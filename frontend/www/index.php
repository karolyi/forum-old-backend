<?php
include_once(__DIR__ . '/../../api/ForumClass.inc.php');
$forum = new \Forum();

?>
<!doctype html>
<html>
  <head>
    <title>Hondaforum.hu</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1/jquery.js"></script>
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js"></script>
    <script type="text/javascript" src="/js/jstorage/jstorage.js"></script>
    <script type="text/javascript" src="/js/json/json2.js"></script>
    <script type="text/javascript" src="/js/jsgettext/Gettext.js"></script>
    <script type="text/javascript" src="/js/sprintf.js"></script>
    <script type="text/javascript" src="/js/date.format.js"></script>
    <script type="text/javascript" src="/js/qTip2/dist/jquery.qtip.js"></script>
    <script type="text/javascript" src="/js/yepnope.js/yepnope.1.5.4-min.js"></script>
    <script type="text/javascript" src="<?php print $forum->configOptions->socketServerUrl?>/socket.io/socket.io.js"></script>
    <script type="text/javascript" src="/js/app.js"></script>
    <script type="text/javascript">
      Forum.settings.apiHost = '<?php print $forum->configOptions->apiHost?>';
    </script>
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1/themes/base/jquery-ui.css" type="text/css" />
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1/themes/pepper-grinder/jquery-ui.css" type="text/css" />
    <link rel="stylesheet" href="/js/qTip2/dist/jquery.qtip.min.css" type="text/css" />
  </head>
  <body>
    <div id="page-wrapper">
      <div id="loader-wrapper">
      </div>
      <div id="root-content-wrapper">
        <div id="language-selector">
          <form id="selector-form">
          <select></select>
          </form>
        </div>
        <div id="main-tab-wrapper">
          <ul id="tab-label-list">
          </ul>
        </div>
        <div id="sidebar-wrapper"></div>
      </div>
    </div>
  </body>
</html>
