'use strict';
var UST = {
    DEBUG: false,
    settings: {
        isStatic: true,
        recordClick: true,
        recordMove: true,
        recordKeyboard: true,
        delay: 200,
        maxMoves: 800,
        serverPath: URL_Path,
        percentangeRecorded: 100,
        ignoreGET: ['utm_source', 'utm_ccc_01', 'gclid', 'utm_campaign', 'utm_medium'],
        ignoreIPs: ['66.249.66.50', '66.249.66.20', '66.249.66.56', '66.249.66.17', '66.249.66.20', '66.249.66.50', '66.249.66.56', '66.249.66.14'],
        minIdleTime: 10,
        disableMobileTracking: false
    }
};
UST.randomToken = function () {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
};
UST.enableRecord = function () {
    localStorage.noRecord = 'false';
};
UST.disableRecord = function () {
    localStorage.noRecord = 'true';
};
UST.canRecord = function () {
    UST.isMobileDevice = (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent);
    if (UST.isMobileDevice && UST.settings.disableMobileTracking) {
        return false;
    }
    if (top !== self) {
        return false;
    }
    if (localStorage.noRecord === 'true') {
        return false;
    }
    if (localStorage.getItem('token') === null) {
        if (Math.random() * 100 >= UST.settings.percentangeRecorded) {
            UST.disableRecord();
            return false;
        }
    }
    return true;
};
UST.testRequirements = function () {
    if (typeof jQuery === 'undefined')
        return "Did you include jQuery before tracker.js?";
    var versions = jQuery.fn.jquery.split('.');
    var oldEnough = versions[0] > 1 || (versions[1] >= 8 && versions[2] >= 1);
    if (!oldEnough)
        console.log("Your jQuery version seems to be old. userTrack requires at least jQuery 1.8.1");
    return 'ok';
};
UST.removeWpAdminBar = function () {
    var bar = jQuery('#wpadminbar');
    if (bar.length) {
        var html = jQuery('html')[0];
        html.style.setProperty('margin-top', '0px', 'important');
        bar.hide();
    }
};
UST.getContentDiv = function () {
    var mostProbable = jQuery('body');
    var maxP = 0;
    var documentWidth = jQuery(document).width();
    var documentHeight = jQuery(document).height();
    jQuery('div').each(function () {
        var probability = 0;
        var t = jQuery(this);
        if (t.css('position') === 'static' || t.css('position') === 'relative')
            probability += 2;
        if (t.height() > documentHeight / 2)
            probability += 3;
        if (t.parent().is('body'))
            probability++;
        if (t.css('marginLeft') === t.css('marginRight'))
            probability++;
        if (t.attr('id') === 'content')
            probability += 2;
        if (t.attr('id') === 'container')
            probability++;
        if (t.width() !== documentWidth)
            probability += 2;
        if (probability > maxP) {
            maxP = probability;
            mostProbable = t;
        }
    });
    return mostProbable;
};
UST.getContextPath = function () {
    return UST.settings.serverPath;
};
UST.getDomain = function () {
    if (document.domain.indexOf('www.') === 0) {
        return document.domain.substr(4);
    }
    return document.domain;
};
UST.removeURLParam = function (key, url) {
    var rtn = url.split("?")[0], param, paramsArr = [], queryString = (url.indexOf("?") !== -1) ? url.split("?")[1] : "";
    if (queryString !== "") {
        paramsArr = queryString.split("&");
        for (var i = paramsArr.length - 1; i >= 0; i -= 1) {
            param = paramsArr[i].split("=")[0];
            if (param === key) {
                paramsArr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + paramsArr.join("&");
    }
    return rtn;
};
UST.getCleanPageURL = function () {
    var currentURL = window.location.pathname + window.location.search;
    if (UST.lastURL !== currentURL) {
        UST.lastURL = currentURL;
        UST.cleanPageURL = currentURL;
        for (var key in UST.settings.ignoreGET) {
            var param = UST.settings.ignoreGET[key];
            UST.cleanPageURL = UST.removeURLParam(param, UST.cleanPageURL);
            if (UST.cleanPageURL[UST.cleanPageURL.length - 1] === '?') {
                UST.cleanPageURL = UST.cleanPageURL.slice(0, -1);
            }
        }
    }
    return UST.cleanPageURL;
};
UST.coord4 = {
    fillZeros: function (x) {
        x = x.toString();
        while (x.length < 4) {
            x = '0' + x;
        }
        return x;
    }, get2DPoint: function (x) {
        x = x.toString();
        var p = {x: x.substring(0, 4), y: x.substring(4)};
        while (p.x[0] === '0') {
            p.x = p.x.substring(1);
        }
        while (p.y[0] === '0') {
            p.y = p.y.substring(1);
        }
        return p;
    }
};
UST.addTag = function () {
    console.log('addTag was called before initializing the function.');
};
UST.init = function () {
    UST.DEBUG && console.log(localStorage);
    var errorStarting = UST.testRequirements();
    if (errorStarting !== 'ok') {
        console.log('userTrack tracker could not be started.', errorStarting);
        return;
    }
    if (!UST.canRecord())return;
    var isCrossDomain = UST.settings.serverPath !== '';
    UST.addTag = function (tag) {
        if (typeof tag === 'undefined' || tag.length === 0) {
            console.log("Tag cannot be empty!");
            return 0;
        }
        jQuery.ajax({
            type: "POST",
            crossDomain: isCrossDomain,
            data: {clientID: localStorage.getItem('clientID'), tagContent: tag},
            url: getContextPath() + URL_tag,
            success: function () {
                UST.DEBUG && console.log('Tag ' + tag + 'added');
            },
            error: function (data) {
                console.log(data.responseText);
            }
        });
        return 1;
    };
    var getContextPath = UST.getContextPath;
    var getDomain = UST.getDomain;
    var partialLastIndex = -1;
    UST.sendData = function (clientPageID) {
        localStorage.setItem('lastTokenDate', new Date());
        var data = {movements: '', clicks: '', partial: ''};
        var toSend = [];
        for (var v in movements) {
            var obj = UST.coord4.get2DPoint(v);
            obj.count = movements[v];
            toSend.push(obj);
        }
        if (toSend.length > 3) {
            data.movements = JSON.stringify(toSend);
            movements = {};
        }
        toSend = [];
        for (v in clicks) {
            var obj = UST.coord4.get2DPoint(v);
            obj.count = clicks[v];
            toSend.push(obj);
        }
        if (toSend.length > 0) {
            data.clicks = JSON.stringify(toSend);
            clicks = {};
        }
        var cachedRecords = localStorage.getItem('record');
        if (cachedRecords !== null && cachedRecords !== undefined) {
            if (cachedRecords.length > 30) {
                cachedRecords = JSON.parse(cachedRecords);
                data.partial = cachedRecords.slice(partialLastIndex + 1, cachedRecords.length);
                if (data.partial.length) {
                    data.partial = JSON.stringify(data.partial);
                }
                partialLastIndex = cachedRecords.length - 1;
            }
        }
        if (data.movements.length || data.clicks.length || data.partial.length) {
            jQuery.ajax({
                type: "POST",
                crossDomain: isCrossDomain,
                data: {movements: data.movements, clicks: data.clicks, partial: data.partial, w: 'data', clientPageID: clientPageID},
                url: getContextPath() + URL_data,
                success: function () {
                },
                error: function (data) {
                    console.log(data.responseText);
                }
            });
        }
        activityCount = 0;
    };
    UST.partialToFinal = function () {
        var cachedRecords = localStorage.getItem('record');
        var clientPageID = localStorage.getItem('clientPageID');
        localStorage.removeItem('record');
        UST.DEBUG && console.log('Trying to save final for clientPage #' + clientPageID, cachedRecords);
        if (cachedRecords !== null && cachedRecords !== undefined) {
            if (cachedRecords.length > 2) {
                jQuery.ajax({
                    type: "POST",
                    data: {cachedRecords: cachedRecords, record: 'record', clientPageID: clientPageID},
                    url: getContextPath() + URL_data,
                    success: function () {
                        UST.DEBUG && console.log('Final recording saved!');
                    },
                    error: function (data) {
                        console.log(data.responseText);
                    }
                });
            } else {
                localStorage.removeItem('record');
            }
        }
    };
    UST.partialToFinal();
    var lastTokenDate = localStorage.getItem('lastTokenDate');
    if (localStorage.getItem('token') === null || (new Date() - Date.parse(lastTokenDate) > 40000)) {
        localStorage.setItem('token', UST.randomToken());
        localStorage.removeItem('clientID');
    }
    var token = localStorage.getItem('token');
    localStorage.setItem('lastTokenDate', new Date());
    var focused = true;
    jQuery(document).hover(function () {
        focused = true;
    }, function () {
        focused = false;
    });
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
    var wpAdminBar = jQuery('#wpadminbar');
    if (wpAdminBar.length) {
        offsetY = -wpAdminBar.height();
    }
    var cachedClicks = localStorage.getItem('clicks');
    if (cachedClicks !== null && cachedClicks !== undefined) {
        clicks = JSON.parse(cachedClicks);
        UST.sendData(localStorage.getItem('clientPageID'));
    }
    var clientPageID;
    var clientID = localStorage.getItem('clientID');
    jQuery.ajax({
        type: "POST",
        crossDomain: isCrossDomain,
        dataType: "JSON",
        data: {
            resolution: ((window.innerWidth || (document.documentElement.clientWidth + 17)) + ' ' + (window.innerHeight || (document.documentElement.clientHeight))),
            token: token,
            url: UST.getCleanPageURL(),
            domain: getDomain(),
            clientID: clientID,
            source: document.referrer,
            versionMobile: UST.isMobileDevice === true ? 1 : 0
        },
        url: getContextPath() + URL_client,
        beforeSend: function (x) {
            if (x && x.overrideMimeType) {
                x.overrideMimeType("application/j-son;charset=UTF-8");
            }
        },
        success: function (data) {
            UST.DEBUG && console.log(data);
            clientPageID = data.clientPageID;
            localStorage.setItem('clientPageID', clientPageID);
            localStorage.setItem('clientID', data.clientID);
            startSendingData();
        },
        error: function (data) {
            console.log(data.responseText);
        }
    });
    jQuery.ajax({
        type: "POST",
        data: {clientPageID: localStorage.getItem('clientPageID')},
        crossDomain: isCrossDomain,
        url: getContextPath() + URL_partial,
        success: function () {
            UST.DEBUG && console.log('partials cleared');
        },
        error: function (data) {
            console.log("Could not clear partial!" + data.responseText);
        }
    });
    if (UST.settings.isStatic) {
        relX = parseInt(UST.getContentDiv().offset().left);
    }
    jQuery(document).on('click', '[data-UST_click_tag]', function () {
        var tag = jQuery(this).attr('data-UST_click_tag');
        UST.addTag(tag);
    });
    function addIdleTime(curDate, interpTime) {
        var idleTime = curDate - lastActionDate;
        if (typeof interpTime === 'undefined')interpTime = 0;
        if (idleTime >= UST.settings.minIdleTime) {
            idleTime -= interpTime;
            if (idleTime >= UST.settings.minIdleTime) {
                record.push({t: 'i', d: idleTime});
            }
        }
        lastActionDate = curDate;
    }

    function handleClickEvent(e, isRightClick) {
        if (!focused) {
            return;
        }
        if (typeof e.pageX === 'undefined') {
            return;
        }
        if (UST.settings.recordClick) {
            var p = UST.coord4.fillZeros(e.pageX - relX).toString() + UST.coord4.fillZeros(e.pageY + offsetY);
            if (clicks[p] === undefined) {
                clicks[p] = 0;
            }
            clicks[p]++;
        }
        addIdleTime(new Date());
        var clickData = {t: 'c', x: e.pageX, y: e.pageY + offsetY};
        if (isRightClick)clickData.r = 1;
        record.push(clickData);
        localStorage.setItem('record', JSON.stringify(record));
        localStorage.setItem('url', UST.getCleanPageURL());
        activityCount += 10;
        if (jQuery(e.target).closest('a').length) {
            localStorage.setItem('clicks', JSON.stringify(clicks));
            localStorage.setItem('url', UST.getCleanPageURL());
        }
    }

    jQuery(document).click(handleClickEvent);
    jQuery(document).on('contextmenu', function (e) {
        handleClickEvent(e, true);
    });
    var resizeTimeout;
    window.addEventListener('resize', function () {
        if (!resizeTimeout) {
            resizeTimeout = setTimeout(function () {
                resizeTimeout = null;
                addCurrentWindowSize();
            }, 150);
        }
    }, true);
    function addCurrentWindowSize() {
        record.push({
            t: 'r',
            w: (window.innerWidth || (document.documentElement.clientWidth + 17)),
            h: (window.innerHeight || (document.documentElement.clientHeight))
        });
    }

    var lastScrollDate = undefined;
    jQuery(window).scroll(function () {
        var now = new Date();
        if (lastScrollDate === undefined || now - lastScrollDate >= 100) {
            UST.DEBUG && console.log('Scroll event recorded!');
            lastScrollDate = now;
            addIdleTime(now, 100);
            record.push({t: 's', x: jQuery(window).scrollLeft(), y: jQuery(window).scrollTop()});
            localStorage.setItem('record', JSON.stringify(record));
            activityCount++;
        }
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function () {
            UST.DEBUG && console.log('Scroll event recorded!');
            addIdleTime(now, 100);
            record.push({t: 's', x: jQuery(window).scrollLeft(), y: jQuery(window).scrollTop()});
            localStorage.setItem('record', JSON.stringify(record));
            lastScrollDate = new Date();
            activityCount++;
        }, 100);
    });
    jQuery(document).mousemove(function (e) {
        if (!focused)
            return;
        var curDate = new Date();
        var passed = curDate - lastDate;
        if (passed < UST.settings.delay)
            return;
        addIdleTime(curDate, UST.settings.delay);
        if (--UST.settings.maxMoves > 0 && passed < maxTimeout) {
            if (lastX !== undefined && UST.settings.recordMove) {
                var p = UST.coord4.fillZeros(lastX).toString() + UST.coord4.fillZeros(lastY);
                if (!(lastX === 0 || lastY === 0)) {
                    if (movements[p] === undefined)
                        movements[p] = 0;
                    movements[p]++;
                }
            }
            if (!(lastX === 0 || lastY === 0)) {
                record.push({x: e.pageX, y: e.pageY + offsetY});
                localStorage.setItem('record', JSON.stringify(record));
                activityCount++;
            }
        }
        lastDate = curDate;
        lastX = e.pageX;
        lastY = e.pageY + offsetY;
        if (UST.settings.isStatic) {
            lastX -= relX;
        }
    });
    if (UST.settings.recordKeyboard) {
        jQuery(document).on('blur', 'input:not([type="submit"]):not([type="button"]), textarea', function () {
            if (jQuery(this).hasClass('noRecord') || jQuery(this).attr('type') == 'password')
                return;
            addIdleTime(new Date());
            var uniquePath = jQuery(this).getPath();
            record.push({t: 'b', p: uniquePath, v: jQuery(this).val()});
            localStorage.setItem('record', JSON.stringify(record));
        });
    }
    function startSendingData() {
        recurseSend(300);
    }

    function recurseSend(t) {
        UST.DEBUG && console.log("Sending data for clientPageID: ", clientPageID);
        if (t < 4000)
            t += 400;
        if (t > 2000 && localStorage.getItem('record') && activityCount > 10) {
            t = 800;
        }
        UST.sendData(clientPageID);
        setTimeout(function () {
            recurseSend(t);
        }, t);
    }

    jQuery.fn.getPath = function () {
        if (this.length != 1)throw'Requires one element.';
        var path, node = this;
        if (node[0].id)return "#" + node[0].id;
        while (node.length) {
            var realNode = node[0], name = realNode.localName;
            if (!name)break;
            name = name.toLowerCase();
            var parent = node.parent();
            var siblings = parent.children(name);
            if (siblings.length > 1) {
                name += ':eq(' + siblings.index(realNode) + ')';
            }
            path = name + (path ? '>' + path : '');
            node = parent;
        }
        return path;
    };
};
var errorMessage = UST.testRequirements();
if (errorMessage !== 'ok') {
    console.log(errorMessage);
}
jQuery(function () {
    if (UST.canRecord && UST.settings.ignoreIPs && UST.settings.ignoreIPs.length > 0 && UST.settings.ignoreIPs[0] !== '') {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//www.l2.io/ip.js?var=ust_myIP';
        var initCalled = false;
        script.onreadystatechange = script.onload = function () {
            if (initCalled)return;
            initCalled = true;
            if (UST.settings.ignoreIPs.indexOf(ust_myIP) === -1) {
                UST.init();
            } else {
                UST.disableRecord();
            }
        };
        head.appendChild(script);
    } else {
        UST.init();
    }
});
if (top !== self) {
    var elementUnder = null, lastElement = null;
    var lastEvent = null;
    var receiver = function (event) {
        if (event.origin == UST.settings.serverPath || true) {
            if (event.data[0] == '!' || event.data[0] > 'A' && event.data[0] < 'z')
                return;
            var data = JSON.parse(event.data);
            if (data.task !== undefined)
                lastEvent = event;
            switch (data.task) {
                case'CSS':
                    UST.removeWpAdminBar();
                    for (var i = 0; ; ++i) {
                        var classes = document.styleSheets[i];
                        if (classes === undefined || classes === null)
                            break;
                        classes = classes.rules;
                        if (classes === undefined || classes === null)
                            continue;
                        for (var x = 0; x < classes.length; x++) {
                            var ss = "";
                            if (classes[x].selectorText !== undefined) {
                                classes[x].selectorText = classes[x].selectorText.replace(':hover', '.hover');
                            }
                        }
                    }
                    break;
                case'EL':
                    elementUnder = document.elementFromPoint(data.x, data.y);
                    break;
                case'HOV':
                    iframeHover();
                    break;
                case'CLK':
                    iframeRealClick();
                    break;
                case'VAL':
                    jQuery(data.sel).trigger('focus').val(data.val);
                    break;
                case'SZ':
                    event.source.postMessage(JSON.stringify({
                        task: 'SZ',
                        w: Math.max(jQuery(document).width(), jQuery('html').width(), window.innerWidth),
                        h: Math.max(jQuery(document).height(), jQuery('html').height(), window.innerHeight)
                    }), event.origin);
                    break;
                case'PTH':
                    event.source.postMessage(JSON.stringify({task: 'PTH', p: location.pathname}), event.origin);
                    break;
                case'SCR':
                    jQuery(document).scrollTop(data.top);
                    jQuery(document).scrollLeft(data.left);
                    break;
                case'STATIC':
                    event.source.postMessage(JSON.stringify({
                        task: 'STATIC',
                        X: UST.getContentDiv().offset().left
                    }), event.origin);
                    break;
                case'addHtml2canvas':
                    if (typeof window.html2canvasAdded === "undefined") {
                        window.html2canvasAdded = true;
                        var s = document.createElement("script");
                        s.type = "text/javascript";
                        document.body.appendChild(s);
                        s.onload = function () {
                            event.source.postMessage(JSON.stringify({task: 'html2canvasAdded'}), event.origin);
                        };
                        s.src = UST.settings.serverPath + '/lib/html2canvas/html2canvas.js';
                    } else {
                        event.source.postMessage(JSON.stringify({task: 'html2canvasAdded'}), event.origin);
                    }
                    break;
                case'screenshot':
                    jQuery(document).scrollTop(0);
                    jQuery(document).scrollLeft(0);
                    html2canvas(document.body, {
                        logging: false,
                        useCORS: false,
                        proxy: UST.settings.serverPath + '/lib/html2canvas/proxy.php',
                    }).then(function (canvas) {
                        var img = new Image();
                        img.onload = function () {
                            img.onload = null;
                            event.source.postMessage(JSON.stringify({task: 'screenshot', img: img.src}), event.origin);
                        };
                        img.onerror = function () {
                            img.onerror = null;
                            window.console.log("Not loaded image from canvas.toDataURL");
                        };
                        img.src = canvas.toDataURL("image/png");
                    });
                    break;
            }
        }
    };
    jQuery(document).scroll(function () {
        var t = jQuery(this).scrollTop();
        var l = jQuery(this).scrollLeft();
        if (lastEvent !== null) {
            lastEvent.source.postMessage(JSON.stringify({task: 'SCROLL', top: t, left: l}), lastEvent.origin);
        } else {
            console.log("Scroll event happened before parent call to iframe");
        }
    });
    var iframeRealClick = function () {
        if (elementUnder !== null) {
            if (elementUnder.nodeName == 'SELECT') {
                jQuery(elementUnder).get(0).setAttribute('size', elementUnder.options.length);
            } else {
                var link = jQuery(elementUnder).parents('a').eq(0);
                if (link !== undefined) {
                    link = link.attr('href');
                    if (link !== undefined && (link.indexOf('//') != -1 || link.indexOf('www.') != -1) && link.indexOf(window.location.host) == -1)
                        link = 'external';
                }
                if (link !== 'external') {
                    if (!jQuery(elementUnder).closest('.UST_noClick').length) {
                        fireEvent(elementUnder, 'click');
                    } else {
                        UST.DEBUG && console.log("Didn't trigger the click. Had class UST_noClick");
                    }
                } else {
                    alertify.alert('User has left the website');
                }
            }
        }
        if (lastElement !== null && lastElement.nodeName == 'SELECT')
            jQuery(lastElement).get(0).setAttribute('size', 1);
        lastElement = elementUnder;
    };
    var lastHover = null;
    var lastParents = null;
    var iframeHover = function () {
        if (lastHover != elementUnder) {
            var parents = jQuery(elementUnder).parents().addBack();
            if (lastParents !== null) {
                lastParents.removeClass("hover");
                lastParents.trigger("mouseout");
            }
            parents.addClass("hover");
            parents.trigger("mouseover");
            lastParents = parents;
        } else {
            return 1;
        }
        lastHover = elementUnder;
        return 0;
    };
    var fireEvent = function (element, event) {
        var evt;
        if (document.createEvent) {
            evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true);
            return !element.dispatchEvent(evt);
        } else {
            evt = document.createEventObject();
            return element.fireEvent('on' + event, evt);
        }
    };
    window.addEventListener('message', receiver, false);
}
