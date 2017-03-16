var userTrackHeatmap = (function () {
    var heatmap = 0, minimap;
    var emptySet = {max: 0, data: []};

    function drawHeatmap() {
        DEBUG && console.log('createHeatmap');
        jQuery('#loading').stop(1, 0).fadeIn(200).text("Loading data...");
        userTrackAjax.loadHeatmapData();
        jQuery('#heatmapWrap').stop(1, 0).animate({opacity: 1}, 100);
        jQuery('#heatmapIframe').stop(1, 0).animate({opacity: 1}, 1000);
    }

    function setHeatmapData(data) {
        DEBUG && console.log('setHeatmapData called');
        jQuery('#loading').text("Drawing canvas...");
        minimap = jQuery('#minimap'), cleanHeatmap();
        heatmap = h337.create({container: document.getElementById("heatmap"), radius: options.radius});
        if (data === undefined || data.length === 0) {
            jQuery('#loading').text("No data stored in database...");
            return;
        }
        if (options.what == 'scrollmap') {
            drawScrollMap(data);
            return;
        }
        if (settings.static == "true" || settings.static === true) {
            oIframe.contentWindow.postMessage(JSON.stringify({task: 'STATIC'}), '*');
        } else {
            firstStaticX = 0;
        }
        setTimeout(function () {
            if (DEBUG)var starTime = new Date();
            var processedData = [], obj;
            for (var i = 0; i < data.length; ++i) {
                obj = JSON.parse(data[i]);
                for (el in obj) {
                    obj[el].x = parseInt(obj[el].x) + parseInt(firstStaticX);
                    obj[el].y = parseInt(obj[el].y);
                    obj[el].value = parseInt(obj[el].count);
                    delete obj[el].count;
                    if (isNaN(obj[el].x) || isNaN(obj[el].y) || obj[el].y < 0) {
                        DEBUG && console.log('Invalid point:', obj[el]);
                        continue;
                    }
                    processedData.push(obj[el]);
                }
            }
            processedData.sort(function (a, b) {
                if (a.y > b.y)
                    return 1;
                if (a.y == b.y) {
                    if (a.x > b.x)
                        return 1;
                    return 0;
                }
                return -1;
            });
            data = [processedData[0]];
            var N = 0;
            var maxValue = data[0].value;
            for (i = 1; i < processedData.length; ++i) {
                if (data[N].y == processedData[i].y && data[N].x == processedData[i].x) {
                    data[N].value += processedData[i].value;
                } else {
                    data.push(processedData[i]);
                    ++N;
                }
                if (data[N].value > maxValue)
                    maxValue = data[N].value;
            }
            heatmap.setData({max: maxValue, data: data});
            generateMinimap();
            jQuery('#loading').stop(1, 0).fadeOut(200);
            DEBUG && console.log('Total points: ', data.length);
            DEBUG && console.log('Time spent drawing: ', new Date() - starTime, 'ms');
        }, 100);
    }

    function cleanHeatmap() {
        jQuery('.heatmap-canvas').remove();
        if (!minimap) minimap = jQuery('#minimap');
        minimap.css('display', 'none');
        heatmap = 0;
    }

    function generateMinimap() {
        minimap.height(jQuery('#heatmapWrap').height() - 3);
        var oldCanvas = jQuery(".heatmap-canvas").get(0);
        scrollMinimap(0, 0);
        var newCanvas = document.getElementById("minimapCanvas");
        var context = newCanvas.getContext('2d');
        newCanvas.width = minimap.width();
        var ratio = newCanvas.width / oldCanvas.width;
        newCanvas.height = oldCanvas.height * ratio;
        context.drawImage(oldCanvas, 0, 0, oldCanvas.width, oldCanvas.height, 0, 0, newCanvas.width, newCanvas.height);
        minimap.show(200);
    }

    function scrollMinimap(scrollTop, scrollLeft) {
        var cursor = jQuery('#minimapCursor'), heatmapCanvas = jQuery(".heatmap-canvas"), minimapCanvas = jQuery('#minimapCanvas');
        var ratio = minimap.width() / heatmapCanvas.width();
        cursor.width(minimap.width() - 2);
        cursor.height(jQuery('#heatmapWrap').height() * ratio);
        scrollTop *= ratio;
        actualScroll = scrollTop;
        var miniH = minimap.height();
        miniH -= 3 / 10 * miniH;
        if (scrollTop + cursor.height() > miniH) {
            scrollTop = miniH - cursor.height();
        }
        if (actualScroll != scrollTop) {
            minimapCanvas.css('marginTop', -(actualScroll - scrollTop));
        } else {
            minimapCanvas.css('marginTop', 0);
        }
        cursor.css('top', scrollTop);
    }

    return {
        clean: cleanHeatmap,
        setData: setHeatmapData,
        generateMinimap: generateMinimap,
        scrollMinimap: scrollMinimap,
        draw: drawHeatmap,
    };
}());