'use strict';
window.userTrackRecord = (function () {
    var lastElement = null;
    var scroll = {left: 0, top: 0};
    var cursor = jQuery('<img id="cursor" src="/images/tracker/cursor.png"/>');
    var numberOfClicks = 0;
    jQuery(function () {
        jQuery('body').append(cursor);
    });
    function prepareRecord(id, page, res) {
        DEBUG && console.log('Prepare record: ', id, page, res);
        artificialTrigger = 1;
        fromList = 1;
        options.resolution = res;
        options.lastid = options.recordid = id;
        options.url = page;
        options.stopLoadEvents = true;
        var res = options.resolution.split(' ');
        iframeFit(res[0], res[1]);
        var absolutePath = '';
        if (options.domain !== '')
            absolutePath = '//www.' + options.domain;
        setIframeSource(absolutePath + options.url);
        userTrackAjax.getRecord(options.lastid);
        jQuery('#recordList').fadeOut(300);
        jQuery('#recordControls button').attr('disabled', false);
    }

    function setNextRecord(data) {
        DEBUG && console.log('Set next record: ', data);
        if (data.id !== 0) {
            artificialTrigger = true;
            prepareRecord(data.id, data.page, data.res);
        } else {
            inPlaybackMode = false;
            alertify.alert('User has left the website.');
        }
    }

    function setCurrentRecord(data) {
        record = data;
        setTimeout(function () {
            jQuery('#play').trigger('click');
            jQuery('#pagesHistory div').removeClass('active');
            jQuery('#pagesHistory div[data-id=' + options.recordid + ']').addClass('active');
        }, 500);
        fromList = 0;
    }

    function resetElements(minimizeBar) {
        scroll = {left: 0, top: 0};
        numberOfClicks = 0;
        jQuery('.clickBox').remove();
        if (minimizeBar === true)
            jQuery('#header').addClass("minified");
    }

    function startPlayback() {
        if (fromList) {
            userTrackAjax.getRecord(options.recordid);
            artificialTrigger = false;
        } else if (artificialTrigger) {
            userTrackAjax.getRecord(options.lastid);
            artificialTrigger = false;
        }
    }

    var lastP = {};

    function playRecord(i) {
        if (i === 0) {
            resetElements(false);
        }
        var p = JSON.parse(JSON.stringify(record[i]));
        if (p === undefined) {
            recordPlaying = false;
            jQuery('#recordControls button#play').text('Play');
            return;
        }
        progressBar.css({width: Math.round((i + 1) * 100 / record.length) + '%'});
        DEBUG && console.log(p);
        if (p.t === 'i' && localStorage.skipPauses !== "true") {
            if (i + 1 < record.length) {
                setTimeout(function () {
                    playRecord(i + 1);
                }, p.d);
            } else {
                recordPlaying = false;
                jQuery('#recordControls button#play').text('Play');
                userTrackAjax.getNextRecord(options.lastid);
            }
            return;
        }
        if (p.t === 'r') {
            iframeFit(p.w, p.h);
            if (i + 1 < record.length) {
                setTimeout(function () {
                    playRecord(i + 1);
                }, 0);
            } else {
                recordPlaying = false;
                jQuery('#recordControls button#play').text('Play');
                userTrackAjax.getNextRecord(options.lastid);
            }
            return;
        }
        p.x -= scroll.left;
        p.y -= scroll.top;
        var oldP = record[i - 1];
        if (i > 0 && p.t === undefined && oldP.t === 'c' && lastP.x === p.x && lastP.y === p.y) {
            if (i + 1 < record.length) {
                setTimeout(function () {
                    playRecord(i + 1);
                }, 0);
            } else {
                recordPlaying = false;
                jQuery('#recordControls button#play').text('Play');
                userTrackAjax.getNextRecord(options.lastid);
            }
            return;
        }
        oIframe.contentWindow.postMessage(JSON.stringify({task: 'EL', x: p.x, y: p.y}), "*");
        oIframe.contentWindow.postMessage(JSON.stringify({task: 'HOV'}), "*");
        if (p.t === 's') {
            scrollIframe(p.x + scroll.left, p.y + scroll.top);
            if (recordPlaying) {
                if (i + 1 < record.length) {
                    setTimeout(function () {
                        playRecord(i + 1);
                    }, 100);
                } else {
                    recordPlaying = false;
                    jQuery('#recordControls button#play').text('Play');
                    userTrackAjax.getNextRecord(options.lastid);
                }
            }
        } else {
            var interpTime = settings.delay - 20;
            if (p.t === 'c' && lastP.x === p.x && lastP.y === p.y) interpTime = 5;
            cursor.animate({
                top: p.y + jQuery('#heatmapIframe').offset().top,
                left: p.x + jQuery('#heatmapIframe').offset().left
            }, interpTime, function () {
                lastP.x = p.x;
                lastP.y = p.y;
                if (p.t === 'c')
                    triggerClick(p.x, p.y, p.r);
                if (p.t === 'b') {
                    triggerValueChange(p.p, p.v, 0, i);
                    return;
                }
                if (playNext !== 0) {
                    i = Math.floor(playNext / 100 * record.length);
                    playNext = 0;
                }
                if (i + 1 < record.length) {
                    if (recordPlaying)
                        setTimeout(function () {
                            playRecord(i + 1);
                        }, 0);
                } else {
                    recordPlaying = false;
                    jQuery('#recordControls button#play').text('Play');
                    userTrackAjax.getNextRecord(options.lastid);
                }
            });
        }
    }

    function triggerClick(x, y, isRightClick) {
        x += jQuery('#heatmapIframe').offset().left;
        var circle = jQuery("<div class='clickRadius'>&nbsp;</div>");
        var radius = 30;
        circle.css('top', y).css('left', x);
        jQuery('#pageWrap').append(circle);
        circle.animate({
            height: radius,
            width: radius,
            top: y - (radius / 2),
            left: x - (radius / 2),
            opacity: 0.3
        }, 500, function () {
            circle.animate({
                height: 2 * radius,
                width: 2 * radius,
                top: y - radius,
                left: x - radius,
                opacity: 0
            }, 100, function () {
                jQuery(this).remove();
            });
        });
        numberOfClicks++;
        var clickBox = jQuery("<span class='clickBox' data-top='" + (y + scroll.top) + "' data-left='" + (x + scroll.left) + "'>" +
            numberOfClicks + "</span>");
        if (isRightClick) clickBox.addClass('rightClick');
        clickBox.css('top', y).css('left', x);
        jQuery('#pageWrap').append(clickBox);
        clickBox.fadeIn(200);
        clickSound.currentTime = 0;
        clickSound.play();
        oIframe.contentWindow.postMessage(JSON.stringify({task: 'CLK'}), "*");
    }

    function triggerValueChange(sel, val, l, i) {
        if (val.length >= l) {
            oIframe.contentWindow.postMessage(JSON.stringify({task: 'VAL', sel: sel, val: val.slice(0, l)}), "*");
            setTimeout(function () {
                triggerValueChange(sel, val, l + 1, i);
            }, 60);
        }
        else if (i + 1 < record.length) {
            playRecord(i + 1);
        } else {
            recordPlaying = false;
            jQuery('#recordControls button#play').text('Play');
            userTrackAjax.getNextRecord(options.lastid);
        }
    }

    function iframeRealClick() {
        if (elementUnder !== null) {
            if (elementUnder.nodeName === 'SELECT')
                jQuery(elementUnder).get(0).setAttribute('size', elementUnder.options.length); else {
                var link = jQuery(elementUnder).parents('a').eq(0);
                if (link !== undefined) {
                    link = link.attr('href');
                    if (link !== undefined && (link.indexOf('//') !== -1 || link.indexOf('www.') !== -1) && link.indexOf(window.location.host) === -1)
                        link = 'external';
                }
                if (link !== 'external')
                    fireEvent(elementUnder, 'click'); else {
                    alertify.alert('User has left the website');
                }
            }
        }
        if (lastElement !== null && lastElement.nodeName === 'SELECT')
            jQuery(lastElement).get(0).setAttribute('size', 1);
        lastElement = elementUnder;
    }

    function scrollIframe(x, y) {
        scroll.left = x;
        scroll.top = y;
        oIframe.contentWindow.postMessage(JSON.stringify({task: 'SCR', top: y, left: x}), "*");
    }

    function setRecordList(data) {
        var pageHistoryDiv = jQuery('#pagesHistory');
        pageHistoryDiv.html('');
        for (var v in data) {
            var page = data[v];
            var div = jQuery('<div></div>');
            div.attr('data-url', page.page);
            div.attr('data-resolution', page.res);
            div.attr('data-date', page.date);
            div.attr('data-id', page.id);
            div.text(page.page);
            div.attr('title', page.page);
            if (+page.id === 0) {
                div.addClass('disabled');
                div.attr('title', 'User visited this page but left it before any data could be recorded');
            }
            pageHistoryDiv.append(div);
        }
    }

    return {
        startPlayback: startPlayback,
        setCurrent: setCurrentRecord,
        setNext: setNextRecord,
        prepare: prepareRecord,
        playFrom: playRecord,
        setRecordList: setRecordList,
        reset: resetElements,
        scrollTo: scrollIframe
    };
}());