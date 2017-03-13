
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="/css/globals.css" rel="stylesheet"/>
    <link rel="stylesheet" href="/css/userTrack.css"/>
    <link rel="stylesheet" href="/css/record.css"/>
    <link rel="stylesheet" href="/css/clientList.css"/>
    <link rel="stylesheet" href="/js/back/lib/uniform.default.min.css" media="screen"/>
    <link rel="stylesheet" href="/js/back/lib/jquery.qtip.min.css"/>

    <title>userTrack - by tips4design</title>
</head>
<body>
<div id="header">
    <a href="index.html"><img id="logo" alt="UserTrack logo" src="/images/tracker/usertrack.png"/></a>
    <ul id="options">
        <li>
            <span class="option">Page:</span>
            <select id="page">
                <option value="/">Loading pages...</option>
            </select>
        </li>
        <li id="windowWidth">
            <span class="option">Window width:</span>
            <select id="resolution">
                <option value="-1">Any</option>
            </select>
        </li>
        <li id="hoverWrap">
            <span class="option">Tracking settings:</span>
            <img id="show_settings" title="Tracking script settings" src="/images/tracker/settings.png"/>
        </li>
    </ul>
    <div id="type">
        <div data-value="movements" class="opt selected" title="Mouse movements"><img src="/images/tracker/move.png" alt="move"/></div>
        <div data-value="clicks" class="opt" title="Mouse clicks"><img src="/images/tracker/click.png" alt="move"/></div>
        <div data-value="scrollmap" class="opt" title="Scroll attention"><img src="/images/tracker/scroll.png" alt="scroll"/></div>
        <div data-value="record" class="opt" title="Full recording"><img src="/images/tracker/record.png" alt="move"/></div>
    </div>
</div>
<div id="loading">Loading ...</div>
<div id="pageWrap">
    <iframe id="heatmapIframe" width="100%"></iframe>
</div>
<div id="heatmapWrap">
    <div id="heatmap"></div>
    <div id="minimap">
        <span>Minimap</span>
        <canvas id="minimapCanvas"></canvas>
        <div id="minimapCursor"></div>
    </div>
</div>
<button id="downloadHeatmap" title="This is still experimental. Might crash on complex websites!!!">Download heatmap [BETA]</button>
<div id="recordList" class="ust_dialog">
    <div id="close" title="Close">X</div>
    <h1>Recorded sessions</h1>
    <div id="clientFilter">
        <div id="rangeFilter" class="filter">
            Show data
            <label for="from">from:</label><input type="date" name="from"/>
            <label for="to">to:</label><input type="date" name="to"/>
        </div>
        <div id="numberFilter" class="filter">
            <label for="number">Results/page: </label>
            <select name="number">
                <option value="5" selected>5</option>
                <option value="10" selected>10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="40">40</option>
                <option value="80">80</option>
                <option value="120">120</option>
                <option value="100000000">All of them</option>
            </select>
        </div>
        <div id="tagFilter" class="filter">
            <label>Tag filters:</label> <div id="addTagFilter" class="plus" title="Add new tag filter">+</div>
        </div>
    </div>
    <table>
        <tr>
            <th>Date</th>
            <th>Country</th>
            <th>Window Size</th>
            <th>Browser</th>
            <th>Referrer</th>
            <th>Visited pages</th>
            <th>Tags</th>
            <th>Record</th>
        </tr>
        <tr>
            <td colspan="7">
                Loading clients, please wait...
            </td>
        </tr>
    </table>
    <div id="pagination" class="noTextSelect">
    </div>
    <div id="sessionControls">
        <div id="controlsWrap">
            <img src="/images/tracker/icons/erase.png" title="Delete all data stored for this domain, including heatmap data. [double click]" id="cleanDatabase" alt="erase all data"/>
            <img src="/images/tracker/icons/trash.png" title="Delete all selected records. [double click]" id="deleteRecords" alt="erase selected data"/>
            <img src="/images/tracker/icons/zero.png" title="Delete all sessions with 0 recorded data [double click]" id="deleteZeroRecords" alt="erase 0-data sessions"/>
        </div>
    </div>
</div>
<div id="settings" class="ust_dialog">
    <div id="close" title="Close without saving">X</div>
    <h1>Tracking Script Settings</h1>
    <center>Change this settings to affect the recording of future user interactions.</center>
    <ul>
        <li>
            <label title="Record the mouse position every X milliseconds">MouseMove delay:</label>
            <div class="right" title="Less delay means more accurate playback but more data stored in DB">
                <input type="range" min="100" max="600" value="200" step="5" id="delayRange"/>
                <span id="range_value">200ms</span>
            </div>
        </li>
        <li>
            <label title="Maximum events recorded for a single user on a page">Max record length:</label>
            <div class="right" title="More events means that even the longest session of a user will be recorded.">
                <input type="range" min="100" max="1500" value="300" step="5" id="maxMoves"/>
                <span id="range_value2">300</span>
            </div>
        </li>
        <li>
            <label title="If your website is not responsive (layout doesn't change depending on user resolution)">
                <img src="/images/tracker/icons/static.png"/>
                Static website:
            </label>
            <div class="right">
                <input id="staticWebsite" type="checkbox" title="This setting can only improve the heatmap display, so it should be always checked."/>
            </div>
        </li>
        <li>
            <label title="Each click is stored in the database">
                <img src="/images/tracker/icons/mouseClick.png"/>
                Record clicks:
            </label>
            <div class="right">
                <input id="recordClicks" type="checkbox" title="This data is used to generate click heatmaps."/>
            </div>
        </li>
        <li>
            <label title="Each movement is stored in the database">
                <img src="/images/tracker/icons/mouseMove.png"/>
                Record mouse movements:
            </label>
            <div class="right">
                <input id="recordMove" type="checkbox" title="This data is used to generate movement heatmaps."/>
            </div>
        </li>
        <li>
            <label title="Each input value change is stored in the database">
                <img src="/images/tracker/icons/keyboard.png" alt="keyboard"/>
                Record keyboard input:
            </label>
            <div class="right">
                <input id="recordKey" type="checkbox"/>
            </div>
        </li>
        <li>
            <label title="If you have lots of visitors, reocrd only a part of them.">
                <img src="/images/tracker/icons/percentage.png" alt="percentage"/>
                Record only some users:
            </label>
            <div class="right">
                <input type="range" min="0" max="100" value="100" step="1" id="percentangeRecorded" title="50% means that only half of the visitors will be recorded."/>
                <span id="range_value3">100</span>
            </div>
        </li>
        <li>
            <label title="Ignore certain URL parameters so pages aren't considered distinct.">
                <img src="/images/tracker/icons/link.png" alt="URL icon"/>
                Ignore URL params
            </label>
            <div class="right">
                <input id="ignoreGET" type="text" title="Values are comma separated parameters keys (with no spaces between them)."/>
            </div>
        </li>
        <li>
            <label title="Ignore the given IPs from being tracked.">
                <img src="/images/tracker/icons/ip.png" alt="URL icon"/>
                Ignore IPs
            </label>
            <div class="right">
                <input id="ignoreIPs" type="text" title="IPs must be comma separated (with no spaces between them)."/>
            </div>
        </li>
        <li>
            <label title="Last 3 digits of the IP won't be displayed.">
                <img src="/images/tracker/icons/lock.png" alt="lock"/>
                Censor IP address
            </label>
            <div class="right">
                <input id="censorIP" type="checkbox" checked="checked"/>
            </div>
        </li>
        <li>
            <label title="Leave blank if userTrack is on the same domain as the tracked website. Run auto-config to set this automatically.">
                <img src="/images/tracker/icons/domain.png" alt="domain"/>
                Server to store data
            </label>
            <div class="right">
                <input id="serverPath" type="text"/>
            </div>
        </li>
        <li> <button id="save_settings">Save</button></li>
    </ul>
</div>
<div id="recordControls">
    <ul id="recordInfo" class="active">
        <li>
            <img src="/images/tracker/icons/user.png" alt="user"/>
            User information
        </li>
        <li>
            <img src="/images/tracker/icons/resolution.png" alt="resolution" title="Screen resolution"/>
            <span id="resolutionInfo"></span>
            <span id="browserInfo"></span>
        </li>
        <li>
            <img src="/images/tracker/icons/page.png" alt="page" title="Page URL"/>
            <span id="urlInfo"></span>
        </li>
        <li>
            <span id="userFlag" title="Country flag"></span>
            <span id="dateInfo" title="Starting time of session"></span>
        </li>
        <li>
            Tags: <span id="userTags"></span>
        </li>
    </ul>

    <div id="progressBar" title="Click to skip record to this point.">
        <div></div>
        <span title="Double click to delete this record" id="deleteRecord">X</span>
    </div>
    <div id="pagesHistory">
    </div>
    <div id="recordButtons">

        <label>Skip pauses:</label><input id="skipPauses" type="checkbox" title="Uncheck this to see the times when mouse was standing still."/>
        <button id="play" disabled>Play</button>
    </div>
</div>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<script src="/js/back/lib/heatmap.js"></script>
<script src="/js/back/lib/html2canvas.js"></script>
<script src="/js/back/lib/jquery.qtip.min.js"></script>
<script src="/js/back/lib/jquery.uniform.min.js"></script>
<script src="/js/back/lib/alertify.js"></script>
<script src="/js/back/lib/clipboard.min.js"></script>

<script src="/js/back/userTrackHeatmap.js"></script>
<script src="/js/back/userTrackHeatmapDownload.js"></script>
<script src="/js/back/userTrackRecords.js"></script>
<script src="/js/back/userTrackScrollmap.js"></script>
<script src="/js/back/userTrackAjax.js"></script>
<script src="/js/back/userTrackAjaxSettings.js"></script>
<script src="/js/back/userTrack.js"></script>
<script src="/js/back/userTrackUI.js"></script>
<script src="/js/back/clientList.js"></script>

</body>
</html>
