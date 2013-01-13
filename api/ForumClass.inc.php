<?php
spl_autoload_register(function ($className) {
  $className = str_replace('\\', '/', $className) . 'Class.inc.php';
  $fileName = __DIR__ . '/' . $className;
  if (!file_exists($fileName)) {
    throw new \Exception($className . ' not found.');
  } else {
    include(__DIR__ . '/' . $className);
  }
});

class Forum {
  function __construct() {
    try {
      $this->configOptions = \Forum\Config\Options::getInstance();
    } catch (\Exception $e) {
      exit('Configuration not found. Are you sure you set the configuration properly?');
    }
    $this->checkOrigin();
  }

  function checkOrigin() {
    if (isset($_SERVER['HTTP_ORIGIN'])) {
      $parsedUrlArray = parse_url($_SERVER['HTTP_ORIGIN']);
      if (in_array($parsedUrlArray['host'], $this->configOptions->allowedOrigins)) {
        header('Access-Control-Allow-Origin: ' . $parsedUrlArray['scheme'] . '://' . $parsedUrlArray['host']);
      }
    }
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
    // Remove the '' from the beginning of the array
    array_shift($requestArray);
    header('Content-Type: application/json');
    #header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    header('Pragma: no-cache');
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

    if ($requestArray[0] == 'session') {
      if (isset($requestArray[1]) && $requestArray[1] != '') {
        if ($requestArray[1] == 'getGuiState') {
          $sessionObj = \Forum\Session::getInstance();
          print json_encode($sessionObj->getGuiState());
          return;
        }
      }
    } elseif ($requestArray[0] == 'user') {
      if (isset($requestArray[1]) && $requestArray[1] != '') {
        if ($requestArray[1] == 'get') {
          $userArray = explode(',', $requestArray[2]);
          $loadedUserArray = array();
          foreach ($userArray as $key => $userId) {
            $userId = intval($userId);
            try {
              $userObj = \Forum\User::getById($userId);
            } catch (\Exception $e) {
              $userObj = NULL;
            }
            if ($userObj) 
              $loadedUserArray[] = array(
                'id' => $userId,
                'name' => $userObj->getName(),
                'quote' => $userObj->getQuote(),
                'regDate' => $userObj->getRegDate(),
                'language' => $userObj->getLanguage(),
                'topicCommentsPerPage' => $userObj->getTopicCommentsPerPage(),
                'topicPerGroup' => $userObj->getTopicPerGroup(),
                'votingValue' => $userObj->getVotingValue(),
                'votingCount' => $userObj->getVotingCount(),
                'voteLimit' => $userObj->getVoteLimit(),
                'maxPostsPerDay' => $userObj->getMaxPostsPerDay(),
                'sumComments' => $userObj->getSummComments(),
                'todayComments' => $userObj->getTodayComments(),
                'yesterdayComments' => $userObj->getYesterdayComments(),
                'invitations' => $userObj->getInvitations(),
                'inviterUserId' => $userObj->getInviterUserId(),
                'inviteSuccess' => $userObj->getInviteSuccess(),
                'reminders' => $userObj->getReminders(),
                'usedSkin' => $userObj->getUsedSkin(),
                'ignoredUserIdArray' => $userObj->getIgnoredUserIdArray(),
                'introduction' => $userObj->getIntroduction(),
//                'regIntroduction' => $userObj->getRegIntroduction(),
//                'friendIntroduction' => $userObj->getFriendIntroduction(),
                'settings' =>$userObj->getSettings(),
              );
          }
          print json_encode($loadedUserArray);
          return;
        }
      }
    } elseif ($requestArray[0] == 'topic') {
      if (isset($requestArray[1]) && $requestArray[1] != '') {
        if ($requestArray[1] == 'index') {
          if (isset($requestArray[2]) && $requestArray[2] != '') {
            if ($requestArray[2] == 'archived') {
              // Get archived topics
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
        } elseif ($requestArray[1] == 'get') {
          $sessionObj = \Forum\Session::getInstance();
          $userObj = \Forum\User::getById($sessionObj->getUserId());
          $topicArray = explode(',', $requestArray[2]);
          $loadedTopicArray = array();
          foreach ($topicArray as $key => $topicId) {
            $topicId = intval($topicId);
            try {
              $topicObj = \Forum\Topic::getById($topicId);
            } catch (\Exception $e) {
              $topicObj = NULL;
            }
            if ($topicObj) {
              if ($topicObj->getDisabled())
                continue;
              if ($topicObj->getAdminOnly() && !$userObj->getIsAdmin())
                continue;
              $loadedTopicArray[] = array(
                'id' => $topicId,
                'pureName' => $topicObj->getPureName(),
                'htmlName' => $topicObj->getHtmlName(),
                'commentCount' => $topicObj->getCommentCount(),
                'ownerId' => $topicObj->getOwnerId(),
                'disabled' => $topicObj->getDisabled(),
                'adminOnly' => $topicObj->getAdminOnly(),
                'groupId' => $topicObj->getGroupId(),
                'votingEnabled' => $topicObj->getVotingEnabled(),
                'replyTo' => $topicObj->getReplyTo(),
                'truncateAt' => $topicObj->getTruncateAt(),
                'currCommentTime' => $topicObj->getCurrCommentTime(),
                'lastCommentNumber' => $topicObj->getLastCommentNumber(),
                'currCommentOwnerId' => $topicObj->getCurrCommentOwnerId(),
                'currCommentUniqId' => $topicObj->getCurrCommentUniqId(),
                'currParsedCommentText' => $topicObj->getCurrParsedCommentText(),
                'descriptionParsed' => $topicObj->getDescriptionParsed(),
              );
            }
          }
          print json_encode($loadedTopicArray);
          return;
        }
      }
    } elseif ($requestArray[0] == 'settings') {
      if (isset($requestArray[1]) && $requestArray[1] != '') {
        if ($requestArray[1] == 'defaults') {
          $sessionObj = \Forum\Session::getInstance();
          $userObj = \Forum\User::getById($sessionObj->getUserId());
          $dateTimeZoneObj = new DateTimeZone(ini_get('date.timezone'));
          $backgroundImageObj = new \Forum\BackgroundImages();
          $returnArray = array (
            'displayLanguage' => $userObj->getLanguage(),
            'cacheKey' => $this->configOptions->cacheKey,
            'languageObj' => $this->configOptions->languageArray,
            'usedSkin' => $userObj->getUsedSkin(),
            'timeZoneDiff' => $dateTimeZoneObj->getOffset(new DateTime('now', new DateTimeZone('GMT'))) / 60,
            'bgImageArray' => $backgroundImageObj->getSource(),
            'userSettings' => $sessionObj->getSettings(),
            'socketServerUrl' => $this->configOptions->socketServerUrl,
          );
          print json_encode($returnArray);
        }
      }
    }
  }
}
?>
