<?php
include_once($_SERVER['DOCUMENT_ROOT'] . '/api/ForumClass.inc.php');
$forum = new \Forum();
$forum->checkSession();
$sessionObj = \Forum\Session::getInstance();
$currentUser = \Forum\User::getById($sessionObj->getUserId());
$dateTimeZoneObj = new DateTimeZone(ini_get('date.timezone'));
$backgroundImageObj = new \Forum\BackgroundImages();

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
    <script type="text/javascript" src="/js/sprintf.js"></script>
    <script type="text/javascript" src="/js/date.format.js"></script>
    <script type="text/javascript" src="/js/qTip2/dist/jquery.qtip.js"></script>
    <script type="text/javascript" src="/js/app.js"></script>
    <script type="text/javascript">
      Forum.settings.displayLanguage = '<?php print $currentUser->getLanguage()?>';
      Forum.settings.cacheKey = '<?php print $forum->configOptions->cacheKey?>';
      Forum.settings.languageObj = <?php print json_encode($forum->configOptions->languageArray)?>;
      Forum.settings.usedSkin = '<?php print $currentUser->getUsedSkin()?>';
      Forum.settings.timeZoneDiff = <?php print $dateTimeZoneObj->getOffset(new DateTime('now', new DateTimeZone('GMT'))) / 60?>;
      Forum.settings.bgImageArray = <?php print json_encode($backgroundImageObj->getSource())?>;
    </script>
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/base/jquery-ui.css" type="text/css" />
    <link rel="stylesheet" href="/js/qTip2/dist/jquery.qtip.min.css" type="text/css" />
    <link rel="stylesheet" href="/skins/<?php print $currentUser->getUsedSkin()?>/css/style.css" type="text/css" />
  </head>
  <body>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/skins/' . $currentUser->getUsedSkin() . '/html/loaderTemplate.html')?>
    <div id="pageHolder">
      <img id="backgroundImage" alt="" />
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
