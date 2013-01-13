<?php
namespace Forum;

class Session {
  private static $instance;
  private $id, $lastActive, $createdAt, $ipAddress, $hostName, $userId, $type, $settings;

  private function __construct() {
    $this->db = Db::getInstance();
    $this->NOT_AUTHENTICATED = 0;
    $this->AUTH_SUCCESS = 1;
    $this->INNER_SESSION = 0;
    $this->OUTER_SESSION = 1;
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->outerSessionLock = new \Forum\Lock('outerSession');

    // Check the session at creating the singleton instance
    $valid = False;
    if (isset($_COOKIE['forumSessionId'])) {
      $cursor = $this->db->session->find(array('id' => $_COOKIE['forumSessionId']))->limit(1);
      if ($cursor->count()) {
        $this->setVariables($cursor->getNext());
        if ($this->lastActive > time() - $this->configOptions->innerSessionLifetime && $this->ipAddress == $_SERVER['REMOTE_ADDR']) {
          $this->update();
          $valid = True;
        }
      }
    }
    if (!$valid)
      $this->createOuter();
  }

  /**
   * The singleton creator function
   *
   * @return Object The singleton instance
   */
  public static function getInstance() {
    if (!self::$instance) {
      self::$instance = new \Forum\Session();
    }
    return self::$instance;
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
   * Create an array from the current settings for the MongoDB
   *
   * @return array The array to insert in the session table
   */
  private function createDbValues() {
    if (!isset($this->guiState))
      $this->guiState = $this->configOptions->defGuiState;
    return array(
      'lastActive' => new \MongoDate($this->lastActive),
      'createdAt' => new \MongoDate($this->createdAt),
      'ipAddress' => $this->ipAddress,
      'hostName' => $this->hostName,
      'id' => $this->id,
      'userId' => $this->userId,
      'type' => $this->type,
      'settings' => $this->settings,
      'guiState' => $this->guiState,
    );
  }

  /**
   * Set the session variables from the MongoDB
   *
   * @param array The session data rom the DB
   */
  function setVariables($inputArray) {
    foreach ($inputArray as $key => $value)
      $this->$key = $value;
    $this->lastActive = $this->lastActive->sec;
    $this->createdAt = $this->createdAt->sec;
  }

  /**
   * Build the session settings from the user settings
   *
   * @return array The settings array to the DB
   */
  function pullUserSettings($userId = NULL) {
    if ($userId === NULL)
      $userId = $this->configOptions->outerUserId;
    $userObj = \Forum\User::getById($userId);
    return array(
      'topicCommentsPerPage' => $userObj->getTopicCommentsPerPage(),
      'topicPerGroup' => $userObj->getTopicPerGroup(),
      'useBackgrounds' => $userObj->getUseBackgrounds(),
      'showArchivedTopics' => $userObj->getShowArchivedTopics(),
    );
  }

  /**
   * Create a new not-logged-in session
   */
  function createOuter() {

    // Create the new session values
    $this->lastActive = time();
    $this->createdAt = time();
    $this->ipAddress = $_SERVER['REMOTE_ADDR'];
    $this->hostName = gethostbyaddr($_SERVER['REMOTE_ADDR']);
    $this->id = md5(uniqid('', true));
    $this->type = $this->OUTER_SESSION;
    $this->settings = $this->pullUserSettings();
    $this->guiState = $this->configOptions->defGuiState;
    // Insert the values
    $this->outerSessionLock->acquire();
    $this->userId = $this->getNewOuterId();
    $this->db->session->insert($this->createDbValues(), array('safe' => true));
    $this->outerSessionLock->release();
  }

  /**
   * Change session id for a session when older than a configured time, just for security reasons.
   * When not older, just update the lastActive value.
   */
  function update() {
    $oldId = $this->id;
    if ($this->createdAt < time() - $this->configOptions->refreshInnerSessionAfter) {
      $this->createdAt = time(); // = new \MongoDate();
      $this->id = md5(uniqid('', true));
    }
    $this->lastActive = time(); // = new \MongoDate();
    $this->db->session->update(
      array('id' => $oldId),
      $this->createDbValues(),
      array('safe' => true)
    );
  }

  /*
   * Get the user id of the current session
   *
   * @return integer User id of session
   */
  function getUserId() {
    $userId = $this->userId;
    if ($this->type == $this->OUTER_SESSION)
      $userId = $this->configOptions->outerUserId;
    return $userId;
  }

  /**
   * Get the current session id
   *
   * @return string The session id
   */
  function getId() {
    return $this->id;
  }

  /**
   * Get the settings variables from the current session
   *
   * @return array The settings
   */
  function getSettings() {
    return $this->settings;
  }

  /**
   * Get the stored gui state
   *
   * @return array The stored gui state array
   */
  function getGuiState() {
    return $this->guiState;
  }
}

?>
