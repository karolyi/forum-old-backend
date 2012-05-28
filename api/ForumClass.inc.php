<?php
spl_autoload_register(function ($className) {
  $className = str_replace('\\', '/', $className) . 'Class.inc.php';
  include(__DIR__ . '/' . $className);
});

class Forum {
  function __construct() {
    $this->configOptions = \Forum\Config\Options::getInstance();
  }

  function checkSession() {
    $oldSessionId = isset($_COOKIE['forumSessionId']) ? $_COOKIE['forumSessionId'] : null;
    $this->session = new Forum\Session();
    list($loggedIn, $sessionId, $this->currentUser) = $this->session->check();
    if ($oldSessionId != $sessionId) {
      // Set new cookie
      setcookie('forumSessionId', $sessionId, time() + $this->configOptions->cookieLifeTime, '/');
    }
  }

  function api() {
    $parsedUrlArray = parse_url($_SERVER['REQUEST_URI']);
    $requestArray = explode('/', $parsedUrlArray['path']);
    // Remove the '' and the 'api' from the beginning of the array
    array_shift($requestArray);
    array_shift($requestArray);
    if ($requestArray[0] == 'topic') {
      if (isset($requestArray[1])) {
        var_dump($requestArray[1]);
        // Show the comments page
      } else {
        // Show the main topic page
        $this->topicWorker = new \Forum\TopicWorker();
        $this->topicWorker->getTopicList();
      }
    }
  }
}
?>
