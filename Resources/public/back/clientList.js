jQuery(function ($) {
    var rangeFilter = function (el) {
        el = el || $('body');
        var fromInput = $('input[name=from]', el);
        var toInput = $('input[name=to]', el);

        function shortISO(date) {
            return date.toISOString().substring(0, 10);
        }

        this.setRange = function (start, end) {
            fromInput.val(shortISO(start));
            toInput.val(shortISO(end));
        };
    };
    var range = new rangeFilter($('#rangeFilter'));
    var end = new Date();
    var start = new Date(end);
    start.setMonth(start.getMonth() - 6);
    range.setRange(start, end);
    $('.filter *').on('change', function () {
        userTrackAjax.populateClientsList(0);
    });
    var $tagFilter = $('#tagFilter');

    function removeTag(el) {
        el.fadeOut(100, function () {
            el.remove();
            userTrackAjax.populateClientsList(0);
        });
    }

    $tagFilter.on('click', '.tagFilterElement', function () {
        removeTag($(this));
    });
    function addTag(tag) {
        if (tag === null || tag.length === 0) {
            alertify.alert("Tag can not be empty!");
            return;
        }
        var tagFound = $('.tagFilterElement .value').filter(function (index, el) {
            return el.innerText === tag;
        });
        if (tagFound.length > 0) {
            removeTag(tagFound.parent());
            return;
        }
        var $tagEl = $('<div class="tagFilterElement"><span class="value"></span> <span class="x">x</span></div>');
        $tagEl.children('.value').text(tag);
        $tagEl.hide();
        $tagFilter.append($tagEl);
        $tagEl.fadeIn(300);
        userTrackAjax.populateClientsList(0);
    }

    $('#recordList').on('click', '.tag', function () {
        addTag($(this).text());
        return false;
    });
    $('#recordList').on('contextmenu', '.tag', function () {
        var el = $(this);
        var plusButton = el.parent().find('.plus');
        var clientID = plusButton.attr('data-id');
        var tag = el.text();
        userTrackAjax.removeTag(clientID, tag, function () {
            el.slideUp(200, function () {
                el.remove();
            });
        });
        return false;
    });
    $('#addTagFilter').click(function () {
        alertify.prompt("Tag value", function (tag) {
            addTag(tag);
        });
    });
    $('#recordList').on('click', '.addTag', function () {
        var plusButton = $(this);
        var clientID = plusButton.attr('data-id');
        alertify.prompt("Tag value", function (tag) {
            userTrackAjax.addTag(clientID, tag, function () {
                var span = $('<span class="tag"></span>');
                span.text(tag);
                span.hide();
                plusButton.parent().append(span);
                span.slideDown(100);
            });
        });
    });
    $('#recordList').on('click', '.shareRecordButton', function () {
        var $this = $(this);
        var $tr = $this.closest('tr');
        var clientID = $tr.attr('data-id');
        userTrackAjax.getShareToken(clientID, function (token) {
            var playButton = $this.prev('button');
            var resolution = $('.resolution', $tr).text();
            var path = window.location.href.replace('userTrack.html', 'play.html');
            var params = ['c=' + encodeURIComponent(clientID), 'i=' + encodeURIComponent(playButton.attr('data-recordid')), 'p=' + encodeURIComponent(playButton.attr('data-page')), 'r=' + encodeURIComponent(resolution), 'k=' + encodeURIComponent(token)];
            var link = path + '?' + params.join('&');
            var clipboard;
            alertify.defaultValue(link).okBtn("Copy to clipboard").prompt("<b>Share link</b>. Anyone with this link can view this recording.", function () {
                alertify.okBtn("Ok");
                alertify.success('Link copied to cliboard!');
                setTimeout(function () {
                    clipboard && clipboard.destroy();
                }, 200);
            }, function () {
                clipboard && clipboard.destroy();
                alertify.okBtn("Ok");
            });
            var $dialog = jQuery('.alertify');
            jQuery('input', $dialog).attr('id', 'clipboardInput').attr('value', link);
            var $okButton = jQuery('.ok', $dialog);
            $okButton.attr('data-clipboard-target', '#clipboardInput');
            clipboard = new Clipboard($okButton[0]);
        });
    });
    $('#deleteRecords').dblclick(function () {
        var count = $('#recordList tr.selected').length;
        if (count !== 0) {
            $('#recordList tr.selected').each(function () {
                var id = $(this).attr('data-id');
                userTrackAjax.deleteClient(id, this);
            });
            alertify.log("Deleting " + count + " client" + (count > 1 ? 's' : ''));

        } else {
            alertify.alert("No records selected!");
        }
    });
    $('#cleanDatabase').dblclick(function () {
        userTrackAjax.cleanDataForDomain(options.domain);
    });
    $('#deleteZeroRecords').dblclick(function () {
        userTrackAjax.deleteZeroRecords(options.domain);
    });
});