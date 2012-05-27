<?php
namespace Forum;

class User extends \Forum\Config\DefaultUser {
  private $configOptions;
  private $db;
  function __construct($userId = null) {
    parent::__construct();
    // Call with empty parameter for a skeleton, otherwise with a userId
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->id = $userId;
    $this->db = Db::getInstance();
    if ($userId and $userId != $this->configOptions->outerUserId)
      $this->getById($userId);
  }

  function getById($userId) {
    // Username, password
    $cursor = $this->db->user->find(array('id' => $userId));
    $userArray = $cursor->getNext();
    $this->name = $userArray['name'];
    $this->password = $userArray['password'];
    // Extended user data
    $cursor = $this->db->userExt->find(array('id' => $userId));
    $userArray = $cursor->getNext();
    unset($userArray['_id'], $userArray['id']);
    foreach ($userArray as $key => $value) {
      $this->$key = $value;
    }
    $this->regDate = $this->regDate->sec;
  }
}
?>
