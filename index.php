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
    <script type="text/javascript" src="js/app.js"></script>
    <link rel="stylesheet" href="/skins/<?php print $forum->currentUser->usedSkin?>/css/style.css" type="text/css" />
  </head>
  <body>
    <div style="position:absolute;top:50%;left:50%;display:table-cell;vertical-align:middle" id="pageLoader">
      <div style="position: relative;top:-100%;left:-50%;text-align:center">
        <img src="/skins/<?php print $forum->currentUser->usedSkin?>/images/ajax-loader.gif" alt="<?php print _('Loader')?>"/><br />
        <?php print _('Please wait, loading ...')?>
      </div>
    </div>
    <div id="pageHolder">
      CUCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC<br />
    </div>
  </body>
</html>
