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
    $sessionObj = \Forum\Session::getInstance();

    $sessionId = $sessionObj->getId();
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
    header('Content-Type: application/json');
    #header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    header('Pragma: no-cache');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    if ($requestArray[0] == 'topic') {
      if (isset($requestArray[1]) && $requestArray[1] != '') {
        if ($requestArray[1] = 'archived') {
          $this->topicWorker = new \Forum\TopicWorker();
          $this->topicWorker->getArchivedTopicList();
          return;
        }
      } else {
        // Show the main topic page
        $this->topicWorker = new \Forum\TopicWorker();
        $this->topicWorker->getTopicList();
        return;
      }
    }
  }
}
?>
