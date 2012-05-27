<?php

//include("api/forumClass.inc.php");

//$a = new forumClass();
//$a->session->authenticate();

spl_autoload_register(function ($className) {
  $className = str_replace('\\', '/', $className) . 'Class.inc.php';
  include($_SERVER['DOCUMENT_ROOT'] . '/api/' . $className);
});

//phpinfo();
$a = new \Forum\Session();
var_dump($a->authenticate());

?>
