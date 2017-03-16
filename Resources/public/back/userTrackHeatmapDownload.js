'use strict';
var userTrackDownload = {};
(function ($) {
    $(function () {
        $('#downloadHeatmap').click(function () {
            jQuery('#loading').show().text("Adding the html2canvas library...");
            oIframe.contentWindow.postMessage(JSON.stringify({task: 'addHtml2canvas'}), "*");
        });
    });
}(jQuery));
userTrackDownload.start = function (base64Screenshot) {
    jQuery('#loading').show().text("Downloading the heatmap.");
    var heatmapCanvas = jQuery('.heatmap-canvas').get(0);
    var auxCanvas = sameSizeCanvas(heatmapCanvas);
    var context = auxCanvas.getContext('2d');
    var screenshot = new Image();
    screenshot.onload = function () {
        context.drawImage(screenshot, 0, 0, auxCanvas.width, auxCanvas.height);
        context.save();
        if (options.what === "scrollmap") {
            context.globalAlpha = parseFloat($(heatmapCanvas).css('opacity'));
        }
        context.drawImage(heatmapCanvas, 0, 0);
        context.restore();
        var a = document.createElement('a');
        a.href = auxCanvas.toDataURL("image/png");
        a.download = "userTrack_heatmap_" + options.domain + ".png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        jQuery('#loading').hide(100);
    };;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    screenshot.src = base64Screenshot;
};;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function sameSizeCanvas(oldCanvas) {
    var newCanvas = document.createElement('canvas');
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    return newCanvas;
}