<?php
include($_SERVER['DOCUMENT_ROOT'] . '/api/ForumClass.inc.php');

$forum = new Forum();
$forum->checkSession();

if ($_SERVER['REQUEST_URI'] != '/api/') {
  $forum->api();
} else {
  header('HTTP/1.0 404 Not Found');
}
?>
