<?php
namespace Forum;

class User {
  private static $userObjArray = array();
  private $id, $name, $password, $regDate, $settings, $votingValue, $votingCount, $voteLimit, $quote, $email, $regId, $maxPostsPerDay, $sumComments, $todayComments, $yesterdayComments, $invitations, $inviterUserId, $inviteSuccess, $reminders, $usedSkin, $ignoredUserIdArray, $introduction, $regIntroduction, $famIntroduction, $picemails, $language;
  private $default;

  private function __construct($userId) {
    // Call with empty parameter for a skeleton, otherwise with a userId
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->db = \Forum\Db::getInstance();
    $this->id = $userId;
    $this->default = new \Forum\Config\DefaultUser();
  }

  /**
   * Return a user object by id
   *
   * @param $userId The id of the user
   */
  public static function getById($userId) {
    if (!isset(self::$userObjArray[$userId])) {
      self::$userObjArray[$userId] = new User($userId);
    }
    return self::$userObjArray[$userId];
  }

  /**
   * Load the user id, name, password, and store it into the object.
   */
  private function getUserAndPass() {
    // Username, password
    $cursor = $this->db->user->find(array('id' => $this->id));
    $userArray = $cursor->getNext();
    $this->name = $userArray['name'];
    $this->password = $userArray['password'];
  }

  /**
   * Load all data from the user table extension
   */
  private function loadExtendedData() {
    // Extended user data
    $cursor = $this->db->userExt->find(array('id' => $this->id));
    $userArray = $cursor->getNext();
    // var_dump($this->id);
    unset($userArray['_id'], $userArray['id']);
    foreach ($userArray as $key => $value) {
      $this->$key = $value;
    }
    $this->regDate = $this->regDate->sec;
  }

  /**
   * Get a extended setting boolean value from the 'settings' array
   *
   * @param $name string The setting name
   *
   * @return boolean The setting value
   */
  private function getBooleanSetting($name) {
    $retVal = $this->default->settings[$name];
    if ($this->id == $this->configOptions->outerUserId)
      return $retVal;
    if (!isset($this->settings))
      $this->loadExtendedData();
    // If the value still not exists, return the default value
    if (isset($this->settings))
      $retVal = $this->settings[$name];
    return $retVal;
  }

  /**
   * Get a extended user setting value
   *
   * @param $name string The setting name
   *
   * @return sting|integer|boolean The setting value
   */
  private function getValue($name) {
    $retVal = $this->default->$name;
    if ($this->id == $this->configOptions->outerUserId)
      return $retVal;
    if (!isset($this->$name))
      $this->loadExtendedData();
    // If the value still not exist, return the default value
    if (isset($this->$name))
      $retVal = $this->$name;
    return $retVal;
  }

  /**
   * Get the username
   *
   * @return string The username
   */
  function getName() {
    if (!isset($this->name))
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
   * Get the quote of the user
   *
   * @return string The quote of the user
   */
  function getQuote() {
    return $this->getValue('quote');
  }
}
?>
