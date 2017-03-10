var record = {};
var recordPlaying = false;
var inPlaybackMode = false;
var playNext = 0;
var drawTimeout;
var progressBar;
var artificialTrigger = false;
var fromList = false;
var censorIP = true;
var settings = JSON.parse('{"delay":"200","recordClicks":"true","recordMoves":"true","static":"false","maxMoves":"300"}');
var iframePath, oIframe;
var firstStaticX = 0;
var recordsPlayed = [];
jQuery(function () {
    alertify.logPosition("bottom right");
    alertify.delay(1500);
    progressBar = jQuery('#progressBar div');
    if (localStorage.getItem('domain') !== null)
        options.domain = localStorage.getItem('domain');
    if (!window.DIRECT_PLAYBACK) loadSettings();
    if (!window.DIRECT_PLAYBACK) userTrackAjax.getPages();
    if (!window.DIRECT_PLAYBACK) userTrackAjax.populateClientsList(0);
    jQuery('#deleteRecord').dblclick(function () {
        var id = options.recordid;
        if (userTrackAjax.deleteRecord(id) !== 0) {
            jQuery("#records option[value=" + id + "]").remove();
        }
    });
    jQuery('#resolution').change(function () {
        DEBUG && console.log("resolution changed");
        options.resolution = jQuery(this).val();
        userTrackHeatmap.clean();
        if (options.resolution != -1) {
            var res = jQuery(this).val().split(' ');
            iframeFit(res[0], res[1]);
        } else {
            iframeFit();
        }
    });
    jQuery('#page').change(function () {
        DEBUG && console.log("page changed to", jQuery(this).val());
        if (jQuery(this).children().length === 0)
            return;
        options.url = localStorage.url = jQuery(this).val();
        var absolutePath = '';
        if (options.domain !== '')
            absolutePath = '//www.' + options.domain;
        oIframe.contentWindow.postMessage(JSON.stringify({task: 'PTH'}), "*");
        if (fromList || iframePath != options.url)
            setIframeSource(absolutePath + options.url);
        if (!artificialTrigger) {
            options.resolution = '-1';
            setIframeSource(absolutePath + options.url);
        }
        userTrackAjax.getResolutions();
    });
    jQuery('.opt').click(function () {
        userTrackRecord.reset();
        if (options.what == 'record')
            userTrackRecord.scrollTo(0, 0);
        options.what = localStorage.what = jQuery(this).attr('data-value');
        jQuery('.opt').removeClass('selected');
        jQuery(this).addClass('selected');
        jQuery('#heatmapWrap').css('opacity', 0).hide();
        if (options.what == 'record') {
            showRecordsList();
            jQuery('#recordControls button').attr('disabled', true);
            jQuery('#cursor,#recordControls,#heatmapIframe').animate({opacity: 1}, 300);
            jQuery('#windowWidth').slideUp(200);
            jQuery('#hoverWrap, #progressBar').slideDown(200);
            jQuery('#loading').hide(100);
            jQuery('#downloadHeatmap').hide(100);
        }
        else {
            jQuery('#recordList #close').trigger('click');
            jQuery('#loading').show().text("Retrieving " + options.what + " statistics...");
            jQuery('#cursor,#recordControls').animate({opacity: 0}, 300);
            jQuery('#windowWidth').slideDown(200);
            jQuery('#hoverWrap, #progressBar').slideUp(200);
            jQuery('#resolution').trigger('change');
            jQuery('#downloadHeatmap').show(100);
        }
    });
    function iframeFit(width, height) {
        DEBUG && console.log('iframeFit');
        if (width === undefined)
            width = jQuery(window).width() - 29;
        if (height === undefined)
            height = jQuery(window).height() - jQuery('#header').outerHeight() - 10;
        jQuery('#heatmapIframe').height(height);
        jQuery('#heatmapIframe').width(parseInt(width) + 24);
        jQuery('#heatmapIframe').center();
        if (options.what !== 'record')
            jQuery('#heatmapWrap').show();
        jQuery('#heatmapWrap').width(jQuery('#heatmapIframe').width() - 20);
        jQuery('#heatmapWrap').height(jQuery('#heatmapIframe').height() - 10);
        if (options.what !== 'record')
            jQuery('#heatmapWrap').fadeIn(200);
        jQuery('#heatmapWrap').css('left', jQuery('#heatmapIframe').offset().left);
        jQuery('#heatmapWrap').css('top', jQuery('#heatmapIframe').offset().top);
        if (options.what === 'record') {
            jQuery('#loading').fadeOut(200);
            return;
        }
        oIframe.contentWindow.postMessage(JSON.stringify({task: 'SZ'}), "*");
        if (options.what !== 'record')
            jQuery('#heatmapWrap').fadeIn(200);
        jQuery('#heatmapWrap').css('left', jQuery('#heatmapIframe').offset().left);
        jQuery('#heatmapWrap').css('top', jQuery('#heatmapIframe').offset().top);
    }

    window.iframeFit = iframeFit;
    jQuery('#heatmapIframe').load(function () {
        DEBUG && console.log("iframe loaded");
        if (inPlaybackMode)
            return;
        if (fromList)
            return;
        if (options.stopLoadEvents) {
            options.stopLoadEvents = false;
            return;
        }
        iframeFit(undefined, undefined);
        fromList = 0;
    });
    oIframe = document.getElementsByTagName('iframe')[0];
    jQuery('#recordControls button#play').click(function () {
        if (recordPlaying) {
            inPlaybackMode = recordPlaying = false;
            jQuery(this).text('Play');
            return;
        }
        jQuery(this).text('Stop');
        inPlaybackMode = recordPlaying = true;
        oIframe.contentWindow.postMessage(JSON.stringify({task: 'SCR', top: 0, left: 0, delay: 0}), "*");
        oIframe.contentWindow.postMessage(JSON.stringify({task: 'CSS'}), "*");
        if (progressBar.css('width') == '0%' || progressBar.css('width') == '0px')
            userTrackRecord.playFrom(0); else
            progressBar.animate({width: '0%'}, 500, function () {
                userTrackRecord.playFrom(0);
            });
    });
    jQuery('#progressBar').click(function (e) {
        playNext = Math.floor(100 * (e.pageX - jQuery(this).offset().left) / jQuery(this).width());
    });
});
function bindClickToList() {
    jQuery('#recordList tr').on('click', function () {
        jQuery(this).toggleClass('selected');
    });
    jQuery('#pagination span').on('click', function () {
        var val = jQuery(this).text();
        var take = jQuery('#numberFilter select').val();
        userTrackAjax.populateClientsList((val - 1) * take);
    });
}
function updateToolTips(parentSelector) {
    if (!parentSelector) parentSelector = '';
    $(parentSelector + " *[title]").qtip({
        content: {attr: 'title'},
        style: {classes: 'qtip-rounded qtip-blue tooltip'},
        position: {target: 'mouse', adjust: {y: 20, x: 20}, viewport: jQuery(window)},
        show: {delay: 600}
    });
}
function handleIframeResponse(e) {
    if (e.data[0] == '!' || e.data[0] > 'A' && e.data[0] < 'z')
        return;
    var data = jQuery.parseJSON(e.data);
    switch (data.task) {
        case'SZ':
            jQuery('#heatmap').width(data.w);
            jQuery('#heatmap').height(data.h);
            if (options.what != 'record')
                userTrackHeatmap.draw();
            break;
        case'PTH':
            iframePath = data.path;
            break;
        case'SCROLL':
            if (options.what != 'record') {
                jQuery('#heatmap').css('top', -data.top);
                jQuery('#heatmap').css('left', -data.left);
                userTrackHeatmap.scrollMinimap(data.top, data.left);
            }
            jQuery('.clickBox').each(function () {
                var t = jQuery(this);
                t.css({'top': Number(t.attr('data-top')) - data.top, 'left': Number(t.attr('data-left')) - data.left});
            });
            break;
        case'STATIC':
            firstStaticX = data.X;
            break;
        case'html2canvasAdded':
            jQuery('#loading').show().text("Generating the screenshot.");
            oIframe.contentWindow.postMessage(JSON.stringify({task: 'screenshot'}), "*");
            break;
        case'screenshot':
            userTrackDownload.start(data.img);
            break;
    }
}
function setIframeSource(link) {
    link = link.replace('http://', '//');
    link = link.replace('https://', '//');
    if (window.location.href.indexOf("//www.") === -1)
        link = link.replace('//www.', '//');
    jQuery('#heatmapIframe').prop('src', link);
}
window.addEventListener('message', handleIframeResponse, false);