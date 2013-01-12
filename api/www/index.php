<?php
include(__DIR__ . '/../ForumClass.inc.php');

$forum = new Forum();
$forum->checkSession();

$forum->api();
?>
