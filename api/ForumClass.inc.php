<?php
spl_autoload_register(function ($className) {
  $className = str_replace('\\', '/', $className) . 'Class.inc.php';
  include(__DIR__ . '/' . $className);
});

class Forum {
  function __construct() {
    $this->configOptions = \Forum\Config\Options::getInstance();
  }

  function start() {
    $oldSessionId = isset($_COOKIE['forumSessionId']) ? $_COOKIE['forumSessionId'] : null;
    $session = new Forum\Session();
    list($loggedIn, $sessionId, $this->currentUser) = $session->check();
    if ($oldSessionId != $sessionId) {
      // Set new cookie
      setcookie('forumSessionId', $sessionId, time() + $this->configOptions->cookieLifeTime);
    }
  }
}
?>
