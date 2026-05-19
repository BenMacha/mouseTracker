/*!
 * MouseTracker — vanilla JS tracker
 * https://github.com/BenMacha/mouseTracker
 *
 * Records mouse movements, clicks, scrolls, resizes and form-blur values
 * and ships them to the bundle's ingest endpoints. No jQuery dependency.
 */
(function (window, document) {
    'use strict';

    var config = window.MouseTrackerConfig || {};
    var URLS = config.urls || {};
    var USER_SETTINGS = config.settings || {};

    var UST = {
        DEBUG: false,
        settings: {
            isStatic: true,
            recordClick: USER_SETTINGS.record_click !== false,
            recordMove: USER_SETTINGS.record_move !== false,
            recordKeyboard: USER_SETTINGS.record_keyboard !== false,
            delay: 200,
            maxMoves: 800,
            serverPath: URLS.base || '',
            percentageRecorded: typeof USER_SETTINGS.percentage_recorded === 'number'
                ? USER_SETTINGS.percentage_recorded : 100,
            ignoreGET: ['utm_source', 'utm_ccc_01', 'gclid', 'utm_campaign', 'utm_medium'],
            ignoreIPs: USER_SETTINGS.ignore_ips || [],
            minIdleTime: 10,
            disableMobileTracking: USER_SETTINGS.disable_mobile === true
        }
    };

    function debug() {
        if (UST.DEBUG && window.console) {
            console.log.apply(console, arguments);
        }
    }

    function post(url, data) {
        var body = new URLSearchParams();
        Object.keys(data).forEach(function (k) {
            if (data[k] !== null && data[k] !== undefined) {
                body.append(k, data[k]);
            }
        });
        return fetch(url, {
            method: 'POST',
            body: body,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            credentials: 'same-origin',
            keepalive: true
        }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json().catch(function () { return {}; });
        });
    }

    function getElementPath(el) {
        if (!el || el.nodeType !== 1) return '';
        if (el.id) return '#' + el.id;
        var parts = [];
        var node = el;
        while (node && node.nodeType === 1 && node !== document.documentElement) {
            var name = (node.localName || '').toLowerCase();
            if (!name) break;
            var parent = node.parentNode;
            if (parent) {
                var siblings = [];
                for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i].localName === node.localName) {
                        siblings.push(parent.children[i]);
                    }
                }
                if (siblings.length > 1) {
                    name += ':nth-of-type(' + (siblings.indexOf(node) + 1) + ')';
                }
            }
            parts.unshift(name);
            node = parent;
        }
        return parts.join('>');
    }

    function closestSelector(el, predicate) {
        var node = el;
        while (node && node !== document) {
            if (predicate(node)) return node;
            node = node.parentNode;
        }
        return null;
    }

    UST.randomToken = function () {
        return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    };

    UST.enableRecord = function () { localStorage.setItem('noRecord', 'false'); };
    UST.disableRecord = function () { localStorage.setItem('noRecord', 'true'); };

    UST.canRecord = function () {
        UST.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
        if (UST.isMobileDevice && UST.settings.disableMobileTracking) return false;
        if (top !== self) return false;
        if (localStorage.getItem('noRecord') === 'true') return false;
        if (localStorage.getItem('token') === null) {
            if (Math.random() * 100 >= UST.settings.percentageRecorded) {
                UST.disableRecord();
                return false;
            }
        }
        return true;
    };

    UST.testRequirements = function () {
        if (typeof window.fetch !== 'function') return 'fetch API not available';
        if (typeof window.localStorage !== 'object') return 'localStorage not available';
        return 'ok';
    };

    UST.removeWpAdminBar = function () {
        var bar = document.getElementById('wpadminbar');
        if (bar) {
            document.documentElement.style.setProperty('margin-top', '0px', 'important');
            bar.style.display = 'none';
        }
    };

    UST.getContentDiv = function () {
        var mostProbable = document.body;
        var maxP = 0;
        var docW = document.documentElement.clientWidth;
        var docH = document.documentElement.clientHeight;
        var divs = document.getElementsByTagName('div');
        for (var i = 0; i < divs.length; i++) {
            var t = divs[i];
            var style = getComputedStyle(t);
            var probability = 0;
            if (style.position === 'static' || style.position === 'relative') probability += 2;
            if (t.offsetHeight > docH / 2) probability += 3;
            if (t.parentNode === document.body) probability++;
            if (style.marginLeft === style.marginRight) probability++;
            if (t.id === 'content') probability += 2;
            if (t.id === 'container') probability++;
            if (t.offsetWidth !== docW) probability += 2;
            if (probability > maxP) {
                maxP = probability;
                mostProbable = t;
            }
        }
        return mostProbable;
    };

    UST.getContextPath = function () { return UST.settings.serverPath; };

    UST.getDomain = function () {
        return document.domain.indexOf('www.') === 0
            ? document.domain.substr(4) : document.domain;
    };

    UST.removeURLParam = function (key, url) {
        var rtn = url.split('?')[0];
        var queryString = url.indexOf('?') !== -1 ? url.split('?')[1] : '';
        if (queryString === '') return rtn;
        var paramsArr = queryString.split('&');
        for (var i = paramsArr.length - 1; i >= 0; i--) {
            if (paramsArr[i].split('=')[0] === key) paramsArr.splice(i, 1);
        }
        return paramsArr.length ? rtn + '?' + paramsArr.join('&') : rtn;
    };

    UST.getCleanPageURL = function () {
        var currentURL = window.location.pathname + window.location.search;
        if (UST.lastURL !== currentURL) {
            UST.lastURL = currentURL;
            UST.cleanPageURL = currentURL;
            UST.settings.ignoreGET.forEach(function (param) {
                UST.cleanPageURL = UST.removeURLParam(param, UST.cleanPageURL);
                if (UST.cleanPageURL.slice(-1) === '?') {
                    UST.cleanPageURL = UST.cleanPageURL.slice(0, -1);
                }
            });
        }
        return UST.cleanPageURL;
    };

    UST.coord4 = {
        fillZeros: function (x) {
            x = String(x);
            while (x.length < 4) x = '0' + x;
            return x;
        },
        get2DPoint: function (x) {
            x = String(x);
            var p = { x: x.substring(0, 4), y: x.substring(4) };
            while (p.x[0] === '0') p.x = p.x.substring(1);
            while (p.y[0] === '0') p.y = p.y.substring(1);
            return p;
        }
    };

    UST.addTag = function () {
        debug('addTag called before init.');
    };

    UST.init = function () {
        debug(localStorage);

        var err = UST.testRequirements();
        if (err !== 'ok') {
            if (window.console) console.warn('MouseTracker could not start:', err);
            return;
        }
        if (!UST.canRecord()) return;

        var partialLastIndex = -1;

        UST.addTag = function (tag) {
            if (!tag || tag.length === 0) {
                debug('Tag cannot be empty.');
                return 0;
            }
            post(UST.getContextPath() + URLS.addTag, {
                clientID: localStorage.getItem('clientID'),
                tagContent: tag
            }).then(function () { debug('Tag added:', tag); })
              .catch(function (e) { debug('Tag error:', e); });
            return 1;
        };

        UST.sendData = function (clientPageID) {
            localStorage.setItem('lastTokenDate', new Date().toISOString());
            var data = { movements: '', clicks: '', partial: '' };

            var toSend = [];
            Object.keys(movements).forEach(function (v) {
                var obj = UST.coord4.get2DPoint(v);
                obj.count = movements[v];
                toSend.push(obj);
            });
            if (toSend.length > 3) {
                data.movements = JSON.stringify(toSend);
                movements = {};
            }

            toSend = [];
            Object.keys(clicks).forEach(function (v) {
                var obj = UST.coord4.get2DPoint(v);
                obj.count = clicks[v];
                toSend.push(obj);
            });
            if (toSend.length > 0) {
                data.clicks = JSON.stringify(toSend);
                clicks = {};
            }

            var cached = localStorage.getItem('record');
            if (cached && cached.length > 30) {
                try {
                    var parsed = JSON.parse(cached);
                    var slice = parsed.slice(partialLastIndex + 1);
                    if (slice.length) data.partial = JSON.stringify(slice);
                    partialLastIndex = parsed.length - 1;
                } catch (e) { /* ignore malformed */ }
            }

            if (data.movements.length || data.clicks.length || data.partial.length) {
                post(UST.getContextPath() + URLS.addData, {
                    movements: data.movements,
                    clicks: data.clicks,
                    partial: data.partial,
                    w: 'data',
                    clientPageID: clientPageID
                }).catch(function (e) { debug('sendData error:', e); });
            }
            activityCount = 0;
        };

        UST.partialToFinal = function () {
            var cached = localStorage.getItem('record');
            var clientPageID = localStorage.getItem('clientPageID');
            localStorage.removeItem('record');
            debug('partialToFinal for', clientPageID, cached);
            if (cached && cached.length > 2) {
                post(UST.getContextPath() + URLS.addData, {
                    cachedRecords: cached,
                    record: 'record',
                    clientPageID: clientPageID
                }).then(function () { debug('Final recording saved.'); })
                  .catch(function (e) { debug('partialToFinal error:', e); });
            } else {
                localStorage.removeItem('record');
            }
        };

        UST.partialToFinal();

        var lastTokenDate = localStorage.getItem('lastTokenDate');
        if (localStorage.getItem('token') === null
            || (new Date() - Date.parse(lastTokenDate) > 40000)) {
            localStorage.setItem('token', UST.randomToken());
            localStorage.removeItem('clientID');
        }
        var token = localStorage.getItem('token');
        localStorage.setItem('lastTokenDate', new Date().toISOString());

        var focused = true;
        document.addEventListener('mouseenter', function () { focused = true; }, true);
        document.addEventListener('mouseleave', function () { focused = false; }, true);
        window.addEventListener('focus', function () { focused = true; });
        window.addEventListener('blur', function () { focused = false; });

        var lastDate = new Date();
        var lastActionDate = new Date();
        var scrollTimeout = null;
        var maxTimeout = 3000;
        var movements = {};
        var clicks = {};
        var record = [];
        var activityCount = 0;
        var lastX, lastY, relX = 0;
        var offsetY = 0;
        var maxMoves = UST.settings.maxMoves;

        var wpAdminBar = document.getElementById('wpadminbar');
        if (wpAdminBar) offsetY = -wpAdminBar.offsetHeight;

        var cachedClicks = localStorage.getItem('clicks');
        if (cachedClicks) {
            try { clicks = JSON.parse(cachedClicks); } catch (e) { clicks = {}; }
            UST.sendData(localStorage.getItem('clientPageID'));
        }

        var clientPageID;
        var clientID = localStorage.getItem('clientID');

        post(UST.getContextPath() + URLS.createClient, {
            resolution: (window.innerWidth || (document.documentElement.clientWidth + 17))
                + ' ' + (window.innerHeight || document.documentElement.clientHeight),
            token: token,
            url: UST.getCleanPageURL(),
            domain: UST.getDomain(),
            clientID: clientID,
            source: document.referrer,
            versionMobile: UST.isMobileDevice ? 1 : 0
        }).then(function (data) {
            debug(data);
            clientPageID = data.clientPageID;
            localStorage.setItem('clientPageID', String(clientPageID));
            localStorage.setItem('clientID', String(data.clientID));
            startSendingData();
        }).catch(function (e) { debug('createClient error:', e); });

        post(UST.getContextPath() + URLS.clearPartial, {
            clientPageID: localStorage.getItem('clientPageID')
        }).then(function () { debug('partials cleared'); })
          .catch(function (e) { debug('clearPartial error:', e); });

        if (UST.settings.isStatic) {
            var contentRect = UST.getContentDiv().getBoundingClientRect();
            relX = (contentRect.left + window.scrollX) | 0;
        }

        document.addEventListener('click', function (e) {
            var tagEl = closestSelector(e.target, function (n) { return n.hasAttribute && n.hasAttribute('data-UST_click_tag'); });
            if (tagEl) UST.addTag(tagEl.getAttribute('data-UST_click_tag'));
            handleClickEvent(e, false);
        });
        document.addEventListener('contextmenu', function (e) {
            handleClickEvent(e, true);
        });

        function addIdleTime(curDate, interpTime) {
            var idleTime = curDate - lastActionDate;
            if (typeof interpTime === 'undefined') interpTime = 0;
            if (idleTime >= UST.settings.minIdleTime) {
                idleTime -= interpTime;
                if (idleTime >= UST.settings.minIdleTime) {
                    record.push({ t: 'i', d: idleTime });
                }
            }
            lastActionDate = curDate;
        }

        function handleClickEvent(e, isRightClick) {
            if (!focused) return;
            if (typeof e.pageX === 'undefined') return;
            if (UST.settings.recordClick) {
                var p = UST.coord4.fillZeros(e.pageX - relX) + UST.coord4.fillZeros(e.pageY + offsetY);
                clicks[p] = (clicks[p] || 0) + 1;
            }
            addIdleTime(new Date());
            var clickData = { t: 'c', x: e.pageX, y: e.pageY + offsetY };
            if (isRightClick) clickData.r = 1;
            record.push(clickData);
            localStorage.setItem('record', JSON.stringify(record));
            localStorage.setItem('url', UST.getCleanPageURL());
            activityCount += 10;
            if (closestSelector(e.target, function (n) { return n.tagName === 'A'; })) {
                localStorage.setItem('clicks', JSON.stringify(clicks));
                localStorage.setItem('url', UST.getCleanPageURL());
            }
        }

        var resizeTimeout;
        window.addEventListener('resize', function () {
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(function () {
                    resizeTimeout = null;
                    record.push({
                        t: 'r',
                        w: window.innerWidth || (document.documentElement.clientWidth + 17),
                        h: window.innerHeight || document.documentElement.clientHeight
                    });
                }, 150);
            }
        }, true);

        var lastScrollDate;
        window.addEventListener('scroll', function () {
            var now = new Date();
            if (lastScrollDate === undefined || now - lastScrollDate >= 100) {
                lastScrollDate = now;
                addIdleTime(now, 100);
                record.push({ t: 's', x: window.scrollX, y: window.scrollY });
                localStorage.setItem('record', JSON.stringify(record));
                activityCount++;
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                var n = new Date();
                addIdleTime(n, 100);
                record.push({ t: 's', x: window.scrollX, y: window.scrollY });
                localStorage.setItem('record', JSON.stringify(record));
                lastScrollDate = n;
                activityCount++;
            }, 100);
        }, { passive: true });

        document.addEventListener('mousemove', function (e) {
            if (!focused) return;
            var curDate = new Date();
            var passed = curDate - lastDate;
            if (passed < UST.settings.delay) return;
            addIdleTime(curDate, UST.settings.delay);
            if (--maxMoves > 0 && passed < maxTimeout) {
                if (lastX !== undefined && UST.settings.recordMove && lastX !== 0 && lastY !== 0) {
                    var p = UST.coord4.fillZeros(lastX) + UST.coord4.fillZeros(lastY);
                    movements[p] = (movements[p] || 0) + 1;
                }
                if (lastX !== 0 && lastY !== 0 && lastX !== undefined) {
                    record.push({ x: e.pageX, y: e.pageY + offsetY });
                    localStorage.setItem('record', JSON.stringify(record));
                    activityCount++;
                }
            }
            lastDate = curDate;
            lastX = e.pageX;
            lastY = e.pageY + offsetY;
            if (UST.settings.isStatic) lastX -= relX;
        });

        if (UST.settings.recordKeyboard) {
            document.addEventListener('blur', function (e) {
                var el = e.target;
                if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
                if (el.type === 'submit' || el.type === 'button' || el.type === 'password') return;
                if (el.classList && el.classList.contains('noRecord')) return;
                addIdleTime(new Date());
                record.push({ t: 'b', p: getElementPath(el), v: el.value });
                localStorage.setItem('record', JSON.stringify(record));
            }, true);
        }

        function startSendingData() { recurseSend(300); }

        function recurseSend(t) {
            debug('Sending data for clientPageID:', clientPageID);
            if (t < 4000) t += 400;
            if (t > 2000 && localStorage.getItem('record') && activityCount > 10) t = 800;
            UST.sendData(clientPageID);
            setTimeout(function () { recurseSend(t); }, t);
        }
    };

    function bootstrap() {
        var err = UST.testRequirements();
        if (err !== 'ok') {
            if (window.console) console.warn('MouseTracker:', err);
            return;
        }
        if (UST.canRecord && UST.settings.ignoreIPs && UST.settings.ignoreIPs.length > 0
            && UST.settings.ignoreIPs[0] !== '') {
            var script = document.createElement('script');
            script.src = 'https://l2.io/ip.js?var=ust_myIP';
            var called = false;
            script.onload = script.onreadystatechange = function () {
                if (called) return;
                called = true;
                if (UST.settings.ignoreIPs.indexOf(window.ust_myIP) === -1) {
                    UST.init();
                } else {
                    UST.disableRecord();
                }
            };
            document.head.appendChild(script);
        } else {
            UST.init();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    /* ---- Iframe-mode receiver (for the replay UI) ---- */
    if (top !== self) {
        var elementUnder = null;
        var lastElement = null;
        var lastEvent = null;
        var lastHover = null;
        var lastParents = null;

        function fireEvent(element, eventName) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(eventName, true, true);
            return !element.dispatchEvent(evt);
        }

        function addHoverClasses(el) {
            var parents = [];
            var node = el;
            while (node && node !== document) {
                parents.push(node);
                node = node.parentNode;
            }
            if (lastParents) {
                lastParents.forEach(function (n) {
                    if (n.classList) n.classList.remove('hover');
                    fireEvent(n, 'mouseout');
                });
            }
            parents.forEach(function (n) {
                if (n.classList) n.classList.add('hover');
                fireEvent(n, 'mouseover');
            });
            lastParents = parents;
        }

        function iframeHover() {
            if (lastHover === elementUnder) return 1;
            addHoverClasses(elementUnder);
            lastHover = elementUnder;
            return 0;
        }

        function iframeRealClick() {
            if (elementUnder) {
                if (elementUnder.nodeName === 'SELECT') {
                    elementUnder.setAttribute('size', elementUnder.options.length);
                } else {
                    var anchor = closestSelector(elementUnder, function (n) { return n.tagName === 'A'; });
                    var link = anchor ? anchor.getAttribute('href') : undefined;
                    if (link && (link.indexOf('//') !== -1 || link.indexOf('www.') !== -1)
                        && link.indexOf(window.location.host) === -1) {
                        link = 'external';
                    }
                    if (link !== 'external') {
                        if (!closestSelector(elementUnder, function (n) {
                                return n.classList && n.classList.contains('UST_noClick');
                            })) {
                            fireEvent(elementUnder, 'click');
                        } else {
                            debug("Didn't trigger click — element has class UST_noClick.");
                        }
                    } else {
                        if (window.console) console.warn('User has left the website');
                    }
                }
            }
            if (lastElement && lastElement.nodeName === 'SELECT') {
                lastElement.setAttribute('size', 1);
            }
            lastElement = elementUnder;
        }

        window.addEventListener('message', function (event) {
            if (typeof event.data !== 'string') return;
            if (event.data[0] === '!' || (event.data[0] > 'A' && event.data[0] < 'z')) return;
            var data;
            try { data = JSON.parse(event.data); } catch (e) { return; }
            if (data.task !== undefined) lastEvent = event;

            switch (data.task) {
                case 'CSS':
                    UST.removeWpAdminBar();
                    for (var i = 0; ; i++) {
                        var sheet = document.styleSheets[i];
                        if (!sheet) break;
                        var rules;
                        try { rules = sheet.rules || sheet.cssRules; } catch (e) { continue; }
                        if (!rules) continue;
                        for (var x = 0; x < rules.length; x++) {
                            if (rules[x].selectorText) {
                                rules[x].selectorText = rules[x].selectorText.replace(':hover', '.hover');
                            }
                        }
                    }
                    break;
                case 'EL':
                    elementUnder = document.elementFromPoint(data.x, data.y);
                    break;
                case 'HOV':
                    iframeHover();
                    break;
                case 'CLK':
                    iframeRealClick();
                    break;
                case 'VAL':
                    var target = document.querySelector(data.sel);
                    if (target) {
                        target.focus();
                        if ('value' in target) target.value = data.val;
                    }
                    break;
                case 'SZ':
                    event.source.postMessage(JSON.stringify({
                        task: 'SZ',
                        w: Math.max(document.documentElement.scrollWidth,
                                     document.documentElement.clientWidth,
                                     window.innerWidth),
                        h: Math.max(document.documentElement.scrollHeight,
                                     document.documentElement.clientHeight,
                                     window.innerHeight)
                    }), event.origin);
                    break;
                case 'PTH':
                    event.source.postMessage(JSON.stringify({
                        task: 'PTH', p: location.pathname
                    }), event.origin);
                    break;
                case 'SCR':
                    window.scrollTo(data.left || 0, data.top || 0);
                    break;
                case 'STATIC':
                    var rect = UST.getContentDiv().getBoundingClientRect();
                    event.source.postMessage(JSON.stringify({
                        task: 'STATIC',
                        X: rect.left + window.scrollX
                    }), event.origin);
                    break;
                case 'addHtml2canvas':
                    if (typeof window.html2canvasAdded === 'undefined') {
                        window.html2canvasAdded = true;
                        var s = document.createElement('script');
                        s.onload = function () {
                            event.source.postMessage(
                                JSON.stringify({ task: 'html2canvasAdded' }), event.origin);
                        };
                        s.src = UST.settings.serverPath + '/lib/html2canvas/html2canvas.js';
                        document.body.appendChild(s);
                    } else {
                        event.source.postMessage(
                            JSON.stringify({ task: 'html2canvasAdded' }), event.origin);
                    }
                    break;
                case 'screenshot':
                    window.scrollTo(0, 0);
                    if (typeof window.html2canvas === 'function') {
                        window.html2canvas(document.body, {
                            logging: false, useCORS: false,
                            proxy: UST.settings.serverPath + '/lib/html2canvas/proxy.php'
                        }).then(function (canvas) {
                            event.source.postMessage(JSON.stringify({
                                task: 'screenshot',
                                img: canvas.toDataURL('image/png')
                            }), event.origin);
                        });
                    }
                    break;
            }
        }, false);

        window.addEventListener('scroll', function () {
            if (lastEvent) {
                lastEvent.source.postMessage(JSON.stringify({
                    task: 'SCROLL',
                    top: window.scrollY,
                    left: window.scrollX
                }), lastEvent.origin);
            }
        }, { passive: true });
    }

    window.UST = UST;
})(window, document);
