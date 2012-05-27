<?php
include_once('api/ForumClass.inc.php');
$forum = new Forum();
$forum->start();
?>
<!doctype html>
<html>
  <head>
    <title>Hondaforum.hu</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js"></script>
    <script type="text/javascript" src="/js/jstorage/jstorage.min.js"></script>
    <script type="text/javascript" src="/js/json/json2.js"></script>
    <script type="text/javascript" src="/js/jsgettext/Gettext.js"></script>
    <script type="text/javascript" src="/js/app.js"></script>
    <script type="text/javascript">
      Forum.settings.displayLanguage = '<?php print $forum->currentUser->language?>';
      Forum.settings.cacheKey = '<?php print $forum->configOptions->cacheKey?>';
      Forum.settings.languageObj = <?php print json_encode($forum->configOptions->languageArray)?>;
    </script>
    <link rel="stylesheet" href="/skins/<?php print $forum->currentUser->usedSkin?>/css/style.css" type="text/css" />
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/base/jquery-ui.css" type="text/css" />
  </head>
  <body>
    <div style="position:absolute;top:50%;left:50%;display:table-cell;vertical-align:middle" id="pageLoader">
      <div style="position: relative;top:-100%;left:-50%;text-align:center">
        <img src="/skins/<?php print $forum->currentUser->usedSkin?>/images/ajax-loader.gif" alt="<?php print _('Loader')?>"/><br />
        <div data-text="Loading, please wait ..."></div>
      </div>
    </div>
    <div id="pageHolder">
      <div id="languageSelectorHolder">
        <form id="languageSelectorForm">
        <select></select>
        </form>
      </div>
      <div id="mainTab">
        <ul>
          <li><a href="#settingsTab" data-text="Settings"></a> <span class="ui-icon ui-icon-close">Remove Tab</span></li>
          <li><a href="#topicListTab" data-text="Topic list"></a></li>
        </ul>
        <div id="settingsTab">
          Settingssss
        </div>
        <div id="topicListTab">
          Topic List Tab
        </div>
      </div>
    </div>
  </body>
</html>
