<?php
namespace Forum;

class Session {
  function __construct() {
    $this->db = Db::getInstance();
    $this->NOT_AUTHENTICATED = 0;
    $this->AUTH_SUCCESS = 1;
    $this->INNER_SESSION = 0;
    $this->OUTER_SESSION = 1;
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->outerSessionLock = new \Forum\Lock('outerSession');
    $this->innerSessionLock = new \Forum\Lock('innerSession');
  }

  /**
   * Find a reusable not-logged-in session number (not id)
   *
   * @return integer New session number
   */
  function getNewOuterId() {
    // Select the biggest id
    $cursor = $this->db->session->find(array('type' => $this->OUTER_SESSION), array('userId'))->sort(array('userId' => -1))->limit(1);
    if (!$cursor->count())
      return 1;
    foreach ($cursor as $doc) {
      $maxId = $doc['userId'];
    }
    $idArray = range(1, $maxId);
    // Select all not releaseable ids and fetch to an array
    $cursor = $this->db->session->find(array(
      'type' => $this->OUTER_SESSION,
      'lastActive' => array(
        '$gt' => new \MongoDate(time() - $this->configOptions->releaseOuterIdAfter),
      )
    ), array('userId'));
    $userIdArray = array();
    foreach ($cursor as $doc) {
      $userIdArray[] = $doc['userId'];
    }
    // Get the free values by diffing
    $remainingIdArray = array_diff($idArray, $userIdArray);
    // Grab the first id
    $newId = null;
    foreach ($remainingIdArray as $key => $value) {
      $newId = $value;
      break;
    }
    // If there aren't any free id's, just return an incremented one
    if ($newId === null)
      return $maxId + 1;
    // Else return the fround free id
    return $newId;
  }

  /**
   * Create a new not-logged-in session
   *
   * @return string New session id
   */
  function createOuter() {
    $this->outerSessionLock->acquire();
    $maxId = $this->getNewOuterId();
    $sessionId = md5(uniqid('', true));
    $this->db->session->insert(array(
      'lastActive' => new \MongoDate(),
      'createdAt' => new \MongoDate(),
      'ipAddress' => $_SERVER['REMOTE_ADDR'],
      'hostName' => gethostbyaddr($_SERVER['REMOTE_ADDR']),
      'sessionId' => $sessionId,
      'userId' => $maxId,
      'type' => $this->OUTER_SESSION,
    ), array('safe' => true));
    $this->outerSessionLock->release();
    return $sessionId;
  }

  /**
   * Change session id for a session when older than a configured time, just for security reasons.
   * When not older, just update the lastActive value.
   *
   * @param array Old session record
   *
   * @return array New session record
   */
  function update($sessionArray) {
    $oldSessionId = $sessionArray['sessionId'];
    if ($sessionArray['createdAt']->sec < time() - $this->configOptions->refreshInnerSessionAfter) {
      $sessionArray['createdAt'] = new \MongoDate();
      $sessionArray['sessionId'] = md5(uniqid('', true));
    }
    $sessionArray['lastActive'] = new \MongoDate();
    $this->db->session->update(
      array('sessionId' => $oldSessionId),
      $sessionArray,
      array('safe' => true)
    );
    return $sessionArray;
  }

  /**
   *  Check if the session is valid
   *
   *  @return array Logged in (true/false), session id, user object
   */
  function check() {
    if (isset($_COOKIE['forumSessionId'])) {
      $cursor = $this->db->session->find(array('sessionId' => $_COOKIE['forumSessionId']))->limit(1);
      if ($cursor->count()) {
        $sessionArray = $cursor->getNext();
        if ($sessionArray['lastActive']->sec > time() - $this->configOptions->innerSessionLifetime && $sessionArray['ipAddress'] == $_SERVER['REMOTE_ADDR']) {
          $sessionArray = $this->update($sessionArray);
          $userId = $sessionArray['type'] == $this->OUTER_SESSION ? $this->configOptions->outerUserId : $sessionArray['userId'];
          $userObj = new \Forum\User($userId);
          return array(True, $sessionArray['sessionId'], $userObj);
        }
      }
    }
    // Session does not exist or expired, create new one
    $userObj = new \Forum\User($this->configOptions->outerUserId);
    $sessionId = $this->createOuter();
    return array(False, $sessionId, $userObj);
  }

}

?>
