<?php
namespace Forum;

class User {
  private static $userObjArray = array();
  private $id, $name, $password, $regDate, $settings, $votingValue, $votingCount, $voteLimit, $quote, $email, $regId, $maxPostsPerDay, $sumComments, $todayComments, $yesterdayComments, $invitations, $inviterUserId, $inviteSuccess, $reminders, $usedSkin, $ignoredUserIdArray, $introduction, $regIntroduction, $famIntroduction, $picemails, $language, $_extendedDataLoaded = False, $_simpleDataLoaded = False;
  private $default;

  private function __construct($userId) {
    // Call with empty parameter for a skeleton, otherwise with a userId
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->db = \Forum\Db::getInstance();
    $this->id = $userId;
    if (intval($userId) < 1 && intval($userId) != $this->configOptions->outerUserId)
      throw new \Exception('Unusable topic id');
    $this->default = new \Forum\Config\DefaultUser();
    foreach ($this->default as $key => $value) {
      $this->$key = $value;
    }
    if ($userId != $this->configOptions->outerUserId)
      $this->getUserAndPass();
  }

  /**
   * Return a user object by id
   *
   * @param $userId The id of the user
   */
  public static function getById($userId = NULL) {
    if (!isset(self::$userObjArray[$userId])) {
      self::$userObjArray[$userId] = new User($userId);
    }
    return self::$userObjArray[$userId];
  }

  /**
   * Load the user id, name, password, and store it into the object.
   */
  private function getUserAndPass() {
    if ($this->_simpleDataLoaded || $this->id == $this->configOptions->outerUserId)
      return;
    $cursor = $this->db->user->find(array('id' => $this->id));
    $userArray = $cursor->getNext();
    if (!$userArray)
      throw new \Exception('No such user');
    $this->name = $userArray['name'];
    $this->password = $userArray['password'];
    $this->_simpleDataLoaded = True;
  }

  /**
   * Load all data from the user table extension and store it into the object
   */
  private function loadExtendedData() {
    if ($this->_extendedDataLoaded || $this->id == $this->configOptions->outerUserId)
      return;
    $cursor = $this->db->userExt->find(array('id' => $this->id));
    $userArray = $cursor->getNext();
    if (!$userArray)
      throw new \Exception('No such user');
    // var_dump($this->id);
    unset($userArray['_id'], $userArray['id']);
    foreach ($userArray as $key => $value)
      $this->$key = $value;
    $this->regDate = $this->regDate->sec;
    $this->_extendedDataLoaded = True;
  }

  /**
   * Get a extended setting boolean value from the 'settings' array
   *
   * @param $name string The setting name
   *
   * @return boolean The setting value
   */
  private function getBooleanSetting($name) {
    $this->loadExtendedData();
    return $this->settings[$name];
  }

  /**
   * Get a extended user setting value
   *
   * @param $name string The setting name
   *
   * @return sting|integer|boolean The setting value
   */
  private function getValue($name) {
    $this->loadExtendedData();
    return $this->$name;
  }

  /**
   * Get the username
   *
   * @return string The username
   */
  function getName() {
    $this->getUserAndPass();
    return $this->name;
  }

  /**
   * Get the userid
   *
   * @return integer The userid
   */
  function getId() {
    return $this->id;
  }

  /**
   * Get the show background setting from the users settings
   *
   * @return boolean The show background setting
   */
  function getUseBackgrounds() {
    return $this->getBooleanSetting('useBackgrounds');
  }

  /**
   * Get the admin status of the user
   *
   * @return boolean The admin status
   */
  function getIsAdmin() {
    return $this->getBooleanSetting('isAdmin');
  }

  /**
   * Get the value of showing archived topics
   *
   * @return boolean Show or not
   */
  function getShowArchivedTopics() {
    return $this->getBooleanSetting('showArchivedTopics');
  }

  /**
   * Get the preferred language of the user
   *
   * @return string The language identifier
   */
  function getLanguage() {
    return $this->getValue('language');
  }

  /**
   * Get the used skin of the user
   *
   * @return string The used skin setting
   */
  function getUsedSkin() {
    return $this->getValue('usedSkin');
  }

  /**
   * Get the shown topics in a topic group
   *
   * @return integer The shown topic count
   */
  function getTopicPerGroup() {
    return $this->getValue('topicPerGroup');
  }

  /**
   * Get the shown comments number on a topic page
   *
   * @return integer The shown comments count
   */
  function getTopicCommentsPerPage() {
    return $this->getValue('topicCommentsPerPage');
  }

  /**
   * Get the quote of the user
   *
   * @return string The quote of the user
   */
  function getQuote() {
    return $this->getValue('quote');
  }

  /**
   * Build the settings object for the database
   *
   * @return array The insertable db object for MongoDB
   */
  function getSettingsObject() {
    $returnArray = array('settings' => array());
    foreach ($this->default as $key => $value) {
      if ($key == 'settings') {
        foreach($this->default->settings as $sKey => $sValue) {
          $returnArray['settings'][$sKey] = $this->settings[$sKey];
        }
      } else {
        $returnArray[$key] = $this->$key;
      }
    }
    // The password should not travel in this object
    unset($returnArray['password']);
    return $returnArray;
  }

  /**
   * Get the registration date of a user
   *
   * @return integer The registration date
   */
  function getRegDate() {
    return $this->getValue('regDate');
  }

  /**
   * Get the sum of votes for this user
   * 
   * @return integer The sum of votes for this user
   */
  function getVotingValue() {
    return $this->getValue('votingValue');
  }

  /**
   * Get the count of votes for this user
   * 
   * @return integer The count of votes for this user
   */
  function getVotingCount() {
    return $this->getValue('votingCount');
  }

  /**
   * Get the comment voting limit, under the user hides a comment
   * 
   * @return integer The comment voting limit, under the user hides a comment
   */
  function getVoteLimit() {
    return $this->getValue('voteLimit');
  }

  /**
   * Get the email for the user
   * 
   * @return string The email for the user
   */
  function getEmail() {
    return $this->getValue('email');
  }

  /**
   * Get the comment limit for a user, per day
   * 
   * @return integer The comment limit for a user, per day
   */
  function getMaxPostsPerDay() {
    return $this->getValue('maxPostsPerDay');
  }

  /**
   * Get the all-time count of users comments
   * 
   * @return integer The all-time count of users comments
   */
  function getSummComments() {
    return $this->getValue('sumComments');
  }

  /**
   * Get the count of comments which has been made today by the user
   * 
   * @return integer The count of comments which has been made today by the user
   */
  function getTodayComments() {
    return $this->getValue('todayComments');
  }

  /**
   * Get the count of comments which has been made yesterday by the user
   * 
   * @return integer The count of comments which has been made yesterday by the user
   */
  function getYesterdayComments() {
    return $this->getValue('yesterdayComments');
  }

  /**
   * Get the invitations made by the user
   * 
   * @return integer The invitations made by the user
   */
  function getInvitations() {
    return $this->getValue('invitations');
  }

  /**
   * Get the inviter user id for the user
   * 
   * @return integer The inviter user id for the user
   */
  function getInviterUserId() {
    return $this->getValue('inviterUserId');
  }

  /**
   * Get the successful invites of the user
   * 
   * @return integer The successful invites of the user
   */
  function getInviteSuccess() {
    return $this->getValue('inviteSuccess');
  }

  /**
   * Get the today sent password emails of the user
   * 
   * @return integer The today sent password emails of the user
   */
  function getReminders() {
    return $this->getValue('reminders');
  }

  /**
   * Get the ignored user id list of the user
   * 
   * @return array The ignored user id list of the user
   */
  function getIgnoredUserIdArray() {
    return $this->getValue('ignoredUserIdArray');
  }

  /**
   * Get the introduction for everybody of the user
   * 
   * @return string The introduction for everybody of the user
   */
  function getIntroduction() {
    return $this->getValue('introduction');
  }

  /**
   * Get the introduction for registered users of the user
   * 
   * @return string The introduction for registered users of the user
   */
  function getRegIntroduction() {
    return $this->getValue('regIntroduction');
  }

  /**
   * Get the introduction for friended users of the user
   * 
   * @return string The introduction for friended users of the user
   */
  function getFriendIntroduction() {
    return $this->getValue('friendIntroduction');
  }

  /**
   * Get the used email addresses for the picture upload topics, for the user
   * 
   * @return string The used email addresses for the picture upload topics, for the user
   */
  function getOtherEmails() {
    return $this->getValue('otherEmails');
  }

  /**
   * Get the complete settings object from the users settings
   *
   * @return array The boolean settings array of the user
   */
  function getSettings() {
    $this->loadExtendedData();
    return $this->settings;
  }

}
?>
