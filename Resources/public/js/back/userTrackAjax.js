'use strict';
var DEBUG = true;
window.userTrackAjax = (function () {
    function catchFail() {
        if (jQuery('.alertify').length > 0)return;
        alertify.alert("Something went wrong on the server-side. Please try again!");
    }

    function getResolutions() {
        if (options.url === undefined) {
            alertify.alert('No pages saved in the database. Database may be empty.');
            return;
        }
        jQuery.ajax({
            type: 'POST',
            dataType: "json",
            url: '/php/getResolutions.php',
            data: {url: options.url, domain: options.domain},
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function (data) {
                DEBUG && console.log('resolutions', data);
                var $resolution = jQuery('#resolution');
                $resolution.html('<option value="-1" selected>Any</option>');
                for (var v in data) {
                    $resolution.append('<option value="' + data[v] + '">' + data[v].split(' ')[0] + ' x ' + data[v].split(' ')[1] + '</option>');
                }
                if (artificialTrigger) {
                    jQuery('option[value="' + options.resolution + '"]', $resolution).trigger('change');
                }
                if (options.what !== 'record') {
                    jQuery('option', $resolution).each(function () {
                        var curEl = jQuery(this);
                        var curWidth = +curEl.val().split(' ')[0];
                        if (curWidth < 0)return 1;
                        curEl.text(curWidth);
                        var index = curEl.index();
                        for (var i = index + 1; i < jQuery('option', $resolution).length; ++i) {
                            var el = jQuery('option', $resolution).eq(i);
                            if (+el.val().split(' ')[0] === curWidth) {
                                jQuery('option', $resolution).eq(i).val('-2');
                            }
                        }
                        jQuery('option[value="-2"]', $resolution).remove();
                    });
                }
                var allOptions = jQuery('option', $resolution);
                var selected = $resolution.val();
                allOptions.sort(function (a, b) {
                    if (+a.text > +b.text)return -1;
                    if (+a.text < +b.text)return 1;
                    return 0;
                });
                $resolution.empty().append(allOptions);
                $resolution.val(selected);
            },
            error: function (data) {
                alertify.alert(data.responseText);
            }
        });
    }

    function getPages() {
        jQuery.ajax({
            type: 'POST',
            dataType: "json",
            url: URL_page,
            data: {domain: options.domain},
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function (data) {
                jQuery('#page').html('');
                for (var v in data)
                    jQuery('#page').append('<option value="' + data[v] + '">' + data[v] + '</option>');
                if (data[0]) jQuery('#page option[value="' + data[0] + '"]').attr('selected', true);
                var defaultUrl = jQuery('#page option:first').val() || '/';
                if (localStorage.what !== undefined) {
                    options.what = localStorage.what;
                    jQuery('.opt').removeClass('selected');
                    jQuery('.opt[data-value=' + options.what + ']').addClass('selected');
                    if (options.what === 'record')
                        jQuery('.opt.selected').trigger('click');
                }
                jQuery('#loading').text("Loading webpage");
                var absolutePath = '';
                if (options.domain !== '')
                    absolutePath = '//www.' + options.domain;
                setIframeSource(absolutePath + defaultUrl);
                options.url = defaultUrl;
                jQuery("select,input").uniform();
                jQuery('#page').trigger('change');
            },
            error: function (data) {
                if (data.responseText.indexOf('login') !== -1)
                    window.location = 'login.php'; else
                    alertify.alert("Could not load pages list from db." + data.responseText);
            }
        });
    }

    function limitRecordNumber() {
        jQuery.ajax({
            type: 'POST',
            dataType: "json",
            url: 'helpers/limitRecordNumber.php',
            data: {domain: options.domain},
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function () {
            },
            error: function (data) {
                alertify.alert(data.responseText);
            }
        });
    }

    function setRecordLimit(domain, limit) {
        jQuery.ajax({
            type: 'POST',
            url: 'helpers/setRecordLimit.php',
            data: {limit: limit, domain: domain},
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function () {
            },
            error: function (data) {
                alertify.alert(data.responseText);
            }
        });
    }

    function getRecordLimit(domain, callback, elIndex) {
        jQuery.post("helpers/getRecordLimit.php", {domain: domain}).done(function (data) {
            callback(elIndex, data);
        }).fail(function (data) {
            alertify.alert(data.responseText);
        });
    }

    function populateClientsList(from) {
        if (window.DIRECT_PLAYBACK)return;
        var take = +jQuery('#numberFilter select').val();
        var startDate = jQuery('#rangeFilter input[name="from"]').val();
        var endDate = jQuery('#rangeFilter input[name="to"]').val();
        var tagFilters = jQuery('.tagFilterElement .value').map(function () {
            return jQuery(this).text();
        }).get();
        var browserCodes = ['chrome', 'opera', 'msie', 'firefox', 'mozilla', 'safari', 'mobile'];
        var browserNames = ['Google Chrome', 'Opera', 'Internet Explorer', 'Mozilla Firefox', 'Mozilla Firefox', 'Safari', 'Mobile Device'];
        var browserImages = ['chrome.png', 'opera.png', 'ie.png', 'firefox.png', 'firefox.png', 'safari.png', 'mobile.png'];
        jQuery.ajax({
            type: 'POST',
            dataType: "json",
            url: URL_client,
            data: {
                from: from,
                take: take,
                domain: options.domain,
                startDate: startDate,
                endDate: endDate,
                tagFilters: tagFilters,
                order: localStorage.order
            },
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function (data) {
                var $recordListTable = jQuery('#recordList table');
                jQuery('tr:has(td)', $recordListTable).remove();
                if (data === null || data.clients.length === 0) {
                    $recordListTable.append('<tr><td colspan="6"><h3>Database is empty.</h3></td></tr>');
                    return;
                }
                var cnt = data.count;
                data = data.clients;
                for (var v in data) {
                    var $tr = jQuery('<tr data-id="' + data[v].clientid + '"></tr>');
                    if (data[v].recordid == null) data[v].nr = 0;
                    if (data[v].referrer == null) data[v].referrer = '';
                    data[v].nr = +data[v].nr;
                    var fullDate = data[v].date;
                    data[v].date = fullDate.slice(0, fullDate.lastIndexOf(':')).slice(fullDate.indexOf('-') + 1);
                    var n = 0;
                    var referrerMaxLength = 15;
                    for (var i in data[v]) {
                        if (++n > 7)
                            break;
                        var td = jQuery('<td class="' + i + '"></td>');
                        td.text(data[v][i]);
                        $tr.append(td);
                        switch (i) {
                            case'date':
                                data[v].date = data[v].date.replace(' ', ' <b>') + '</b>';
                                td.html(data[v].date);
                                td.attr('title', "Date: " + fullDate);
                                break;
                            case'referrer':
                                var referrerURL = data[v].referrer;
                                if (!referrerURL)continue;
                                referrerURL = referrerURL.replace('javascript:', '');
                                referrerURL = referrerURL.replace('<', '&lt;');
                                var niceURL = data[v].referrer.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
                                if (!niceURL)continue;
                                if (niceURL.length > referrerMaxLength) {
                                    niceURL = niceURL.substring(0, referrerMaxLength - 3) + '...';
                                }
                                var $a = jQuery('<a target="_blank" href="' + referrerURL + '" class=""></span>');
                                $a.attr('title', "Open in new tab: <b>" + referrerURL + "</b>");
                                $a.text(niceURL);
                                td.html($a);
                                break;
                            case'tags':
                                td.html('<span class="plus addTag" data-id ="' + data[v].clientid + '">+</span>');
                                td.attr('title', '<b>Click</b> to add this tag filter. <br/> <b>Right click</b> a tag to remove it');
                                var tags = data[v][i];
                                for (var idx in tags) {
                                    var span = jQuery('<span class="tag"></span>');
                                    span.text(tags[idx]);
                                    td.append(span);
                                }
                                break;
                            case'ip':
                                var newIP = data[v].ip;
                                if (censorIP) {
                                    newIP = '*' + data[v].ip.slice(-7);
                                }
                                td.html('<img src="/images/tracker/flags/xx.png"/> ' + newIP);
                                if (localStorage['c' + data[v].ip] !== undefined) {
                                    var countryCode = localStorage['c' + data[v].ip];
                                    td.html('<img src="/images/tracker/flags/' + countryCode + '.png" title="' + countryCode + '"/> ' + newIP);
                                }
                                else {
                                    (function (ip, td, newIP) {
                                        setTimeout(function () {
                                            addCountryFlag(ip, td, newIP);
                                        }, 300 * v);
                                    })(data[v].ip, td, newIP);
                                }
                                break;
                            case'pageHistory':
                                td.empty();
                                td.append(data[v].nr + ' page' + (data[v].nr !== 1 ? 's' : ''));
                                var timeSpentString = '';
                                var ts = data[v].timeSpent;
                                if (ts > 3600) {
                                    var hours = ts / 3600 | 0;
                                    timeSpentString += hours + 'h ';
                                    ts -= hours * 3600;
                                }
                                if (ts > 60) {
                                    var mins = ts / 60 | 0;
                                    timeSpentString += mins + 'm ';
                                    ts -= mins * 60;
                                }
                                timeSpentString += ts + 's';
                                td.append(' in ' + timeSpentString + ':');
                                var pageList = data[v][i].split(' ');
                                for (var index in pageList) {
                                    var pageName = pageList[index];
                                    var dotPosition = pageName.lastIndexOf('.');
                                    if (dotPosition !== -1 && pageName.length - dotPosition - 1 < 5) {
                                        pageName = pageName.slice(0, pageName.lastIndexOf('.'));
                                    }
                                    pageList[index] = '<div class="pageEntry">' + pageName + '</div>';
                                    td.append(pageList[index]);
                                }
                                td.attr('width', '50%');
                                break;
                        }
                    }
                    var disabled = data[v].nr === 0 ? ' disabled title="No movements were recorded. Client may have left immediately." ' : '';
                    var firstPage = data[v].pageHistory;
                    if (data[v].pageHistory.indexOf(' ') !== -1) {
                        firstPage = data[v].pageHistory.split(' ')[0];
                    }
                    var recordColumn = jQuery('<td class="playButton"><button ' + 'data-recordid="' + data[v].recordid + '" ' + 'data-page="' + firstPage + '" ' + 'data-resolution="' + data[v].resolution + '" ' +
                        disabled + '>Play</button></td>');
                    var shareButton = jQuery('<img class="shareRecordButton" src="/images/tracker/icons/share.png" title="Direct playback share link."/>');
                    recordColumn.append(shareButton);
                    $tr.append(recordColumn);
                    var browserEl = jQuery('td.browser', $tr).get(0);
                    var br = browserEl.innerText;
                    var browserVersion = br.split(' ').pop();
                    for (var name in browserCodes) {
                        var code = browserCodes[name];
                        if (br.indexOf(code) !== -1) {
                            if (code === 'mobile') browserVersion = '';
                            var d = '<img src="/images/tracker/icons/' + browserImages[name] + '" title="' + browserNames[name] + ' ' + browserVersion + '"/>';
                            d += '<span>' + browserVersion + '</span>';
                            browserEl.innerHTML = d;
                            break;
                        }
                    }
                    $recordListTable.append($tr);
                }
                var $pagination = jQuery('#pagination');
                $pagination.html('');
                if (cnt) {
                    var totalPages = (cnt / take) + (cnt % take !== 0);
                    var currentPage = (from / take) + 1;
                    for (var i = 1; i <= totalPages; ++i) {
                        var selected = i === currentPage ? "selected" : "";
                        $pagination.append('<span class="' + selected + '">' + i + '</span>');
                    }
                }
                updateToolTips('#recordList');
                bindClickToList();
            },
            error: function (data) {
                alertify.alert(data.responseText);
                console.log(data.responseText);
            }
        });
    }

    function addCountryFlag(ip, td, newIP) {
        jQuery.ajax({
            type: 'POST', url: '/php/getCountry.php', data: {ip: ip}, success: function (data) {
                if (data.length === 2) {
                    td.html('<img src="images/flags/' + data.toLowerCase() + '.png" title="' + data + '"/> ' + newIP);
                    if (data.toLowerCase() !== 'xx')
                        localStorage.setItem('c' + ip, data.toLowerCase());
                }
            }, error: function () {
            }
        });
    }

    function getNextRecord(id) {
        jQuery.ajax({
            type: 'POST',
            dataType: "json",
            url: 'getNextRecord.php',
            data: {id: id, domain: options.domain},
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function (data) {
                DEBUG && console.log("getNextRecord", data);
                data.id = Number(data.id);
                userTrackRecord.setNext(data);
            },
            error: function (data) {
                alertify.alert(data.responseText);
            }
        });
    }

    function getRecord(id) {
        if (window.DIRECT_PLAYBACK && options.what !== 'record')return;
        options.lastid = id;
        jQuery.ajax({
            type: "POST",
            dataType: "text",
            data: {
                recordid: id,
                page: options.url,
                resolution: options.resolution,
                what: options.what,
                directPlayback: window.DIRECT_PLAYBACK,
                clientid: window.CLIENT_ID,
                key: window.PUBLIC_KEY
            },
            url: URL_data,
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function (data) {
                try {
                    data = data.replace(/\]\[/g, ',');
                    data = JSON.parse(data);
                    userTrackRecord.setCurrent(data);
                } catch (e) {
                    alertify.alert(data);
                }
            },
            error: function (data) {
                alertify.alert("Could not load data!" + data.responseText);
            }
        });
    }

    function getRecordList(clientID) {
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            data: {clientID: clientID},
            url: 'getRecordList.php',
            beforeSend: function (x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function (data) {
                userTrackRecord.setRecordList(data);
            },
            error: function (data) {
                alertify.alert("Could not load data!" + data.responseText);
            }
        });
    }

    function loadHeatmapData() {
        DEBUG && console.log("loadHeatmapData");
        jQuery.ajax({
            type: "POST",
            dataType: "json",
            data: {page: options.url, resolution: options.resolution, what: options.what, domain: options.domain},
            url: URL_data,
            beforeSend: function (x) {
                jQuery('#loading').text("Retrieving data from database...");
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: function (data) {
                userTrackHeatmap.setData(data);
            },
            error: function (data) {
                console.log(data);
                if (data.responseText.indexOf('login') !== -1)
                    window.location = 'login.php'; else
                    alertify.alert("Could not load heatmap data." + data.responseText);
            }
        });
    }

    function addTag(clientID, tag, cb) {
        if (typeof tag === 'undefined' || tag.length === 0) {
            console.log("Tag cannot be empty!");
            return 0;
        }
        jQuery.post('addTag.php', {clientID: clientID, tagContent: tag}).done(function (data) {
            if (data !== '') {
                alertify.error("Tag was not added. You can not have duplicate tags for the same user.");
                console.log(data);
                return;
            }
            DEBUG && console.log('Tag ' + tag + 'added');
            if (typeof cb === 'function') cb();
        }).fail(function (data) {
            alertify.error("Something went wrong. Tag was not added.");
            console.log(data.responseText);
        });
        return 1;
    }

    function removeTag(clientID, tag, cb) {
        if (typeof tag === 'undefined' || tag.length === 0) {
            console.log("Tag cannot be empty!");
            return 0;
        }
        jQuery.post('helpers/removeTag.php', {clientID: clientID, tagContent: tag}).done(function (data) {
            if (data !== '') {
                alertify.error("Tag was not removed.");
                console.log(data);
                return;
            }
            DEBUG && console.log('Tag ' + tag + 'removed');
            if (typeof cb === 'function') cb();
        }).fail(function (data) {
            alertify.error("Something went wrong. Tag was not removed.");
            console.log(data.responseText);
        });
        return 1;
    }

    function getShareToken(clientID, cb) {
        jQuery.post('helpers/sharing/getPublicRecordingToken.php', {clientID: clientID}).done(function (data) {
            if (typeof cb === 'function') cb(data);
        }).fail(function (data) {
            alertify.error("Something went wrong. Tag was not removed.");
            console.log(data.responseText);
        });
        return 1;
    }

    function deleteRecord(id) {
        if (id > 0) {
            jQuery.post('helpers/deleteRecord.php', {recordid: id}).done(function () {
                alertify.alert('Record deleted!');
            }).fail(function (data) {
                console.log(data);
                alertify.alert("Could not delete record!" + data.responseText);
            });
        }
        else {
            alertify.alert('Incorect id format.');
            return 0;
        }
    }

    function deleteClient(clientID, el) {
        jQuery.post('helpers/deleteClient.php', {clientID: clientID}).done(function () {
            jQuery(el).slideUp(200, function () {
                jQuery(this).remove();
            });
        }).fail(function (data) {
            console.log(data);
            alertify.alert("Could not delete client!" + data.responseText);
        });
    }

    function cleanDataForDomain(domain) {
        jQuery.post('helpers/cleanDatabase.php', {domain: domain}, function (data) {
            if (data === '') alertify.alert('All data stored in the database has been deleted.'); else alertify.alert("Error: " + data);
            window.location.reload();
        });
    }

    function deleteZeroRecords(domain) {
        jQuery.post('helpers/deleteZeroRecords.php', {domain: domain}, function (data) {
            if (data === '')
                alertify.alert('Sessions with 0 data have been deleted.'); else alertify.alert("Error: " + data);
            window.location.reload();
        });
    }

    function getUsersList(callback) {
        jQuery.getJSON('helpers/users/getUserList.php', function (data) {
            callback(data);
        });
    }

    function setUserData(dataType, value, id, shouldLogout) {
        if (dataType.indexOf('name') !== -1)
            dataType = 'name';
        jQuery.post('helpers/users/setUserData.php', {
            dataType: dataType,
            value: value,
            userId: id
        }).done(function (data) {
            if (data !== '') {
                alertify.alert(data);
            } else if (shouldLogout) {
                window.location = 'helpers/users/logout.php';
            }
        }).fail(catchFail);
    }

    function changeUserAccess(type, domain, userid) {
        jQuery.post('helpers/users/changeAccess.php', {
            type: type,
            domain: domain,
            userid: userid
        }).done(function (data) {
            if (data !== '') alertify.alert(data); else location.reload();
        }).fail(catchFail);
    }

    function addUser(name, pass) {
        jQuery.post('helpers/users/addUser.php', {name: name, pass: pass}).done(function (data) {
            if (data !== '')
                alertify.alert(data); else
                location.reload();
        }).fail(catchFail);
    }

    function deleteUser(userId) {
        jQuery.post('helpers/users/deleteUser.php', {id: userId}).done(function (data) {
            if (data !== '')
                alertify.alert(data); else
                location.reload();
        }).fail(catchFail);
    }

    function getSummaryStats(domain, cb) {
        jQuery.post('helpers/statistics/getSummaryStats.php', {domain: domain}).then(cb).fail(catchFail);
    }

    return {
        getPages: getPages,
        populateClientsList: populateClientsList,
        loadHeatmapData: loadHeatmapData,
        getResolutions: getResolutions,
        limitRecordNumber: limitRecordNumber,
        setRecordLimit: setRecordLimit,
        getRecordLimit: getRecordLimit,
        getRecord: getRecord,
        getRecordList: getRecordList,
        getNextRecord: getNextRecord,
        deleteClient: deleteClient,
        cleanDataForDomain: cleanDataForDomain,
        deleteZeroRecords: deleteZeroRecords,
        deleteRecord: deleteRecord,
        getUsersList: getUsersList,
        setUserData: setUserData,
        changeUserAccess: changeUserAccess,
        addUser: addUser,
        deleteUser: deleteUser,
        addTag: addTag,
        removeTag: removeTag,
        getShareToken: getShareToken,
        getSummaryStats: getSummaryStats
    };
}());