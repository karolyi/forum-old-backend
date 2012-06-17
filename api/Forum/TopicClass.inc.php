<?php
namespace Forum;

class Topic {
  private static $topicObjArray = array();

  private $db, $id, $pureName, $htmlName, $commentCount, $ownerId, $disabled, $adminOnly, $groupId, $votingEnabled, $replyTo, $truncateAt, $currCommentTime, $currCommentNumber, $currCommentOwnerId, $currCommentUniqId, $currParsedCommentText, $descriptionParsed, $_dataLoaded = False;

  private function __construct($topicId) {
    // Call with empty parameter for a skeleton, otherwise with a userId
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->db = \Forum\Db::getInstance();
    $this->id = $topicId;
    $this->getData();
  }

  /**
   * Return a topic object by id
   *
   * @param $topicId The id of the topic
   */
  public static function getById($topicId = NULL) {
    if (!isset(self::$topicObjArray[$topicId])) {
      self::$topicObjArray[$topicId] = new Topic($topicId);
    }
    return self::$topicObjArray[$topicId];
  }

  /**
   * Load the Topic id, name, password, and store it into the object.
   */
  private function getData() {
    if ($this->_dataLoaded)
      return;
    $cursor = $this->db->topicData->find(array('id' => $this->id));
    $topicArray = $cursor->getNext();
    if (!$topicArray)
      throw new \Exception('Unusable topic id or nonexistent topic');
    foreach ($topicArray as $key => $value) {
      if ($key != '_id')
        $this->$key = $value;
    }
    $this->_dataLoaded = True;
  }

  /**
   * Get the text version of the topic name
   *
   * @return string The text version of the topic name
   */
  function getPureName() {
    $this->getData();
    return $this->pureName;
  }

  /**
   * Get the html version of the topic name
   *
   * @return string The html version of the topic name
   */
  function getHtmlName() {
    $this->getData();
    return $this->htmlName;
  }

  /**
   * Get the comment count for the topic
   *
   * @return integer The comment count for the topic
   */
  function getCommentCount() {
    $this->getData();
    return $this->commentCount;
  }

  /**
   * Get the owner id for the topic
   *
   * @return integer The owner id (opener) for the topic
   */
  function getOwnerId() {
    $this->getData();
    return $this->ownerId;
  }

  /**
   * Get the disabled status for the topic
   *
   * @return boolean The disabled status for the topic
   */
  function getDisabled() {
    $this->getData();
    return $this->disabled;
  }

  /**
   * Get the adminOnly status for the topic
   *
   * @return boolean The adminOnly status for the topic
   */
  function getAdminOnly() {
    $this->getData();
    return $this->adminOnly;
  }

  /**
   * Get the topicGroup Id for the topic
   *
   * @return integer The topicGroup Id for the topic
   */
  function getGroupId() {
    $this->getData();
    return $this->groupId;
  }

  /**
   * Get the voting enabled status for the topic
   *
   * @return boolean The voting enabled status for the topic
   */
  function getVotingEnabled() {
    $this->getData();
    return $this->votingEnabled;
  }

  /**
   * Get the replyTo id for the topic, where the answers are going by default
   *
   * @return integer The replyTo id for the topic
   */
  function getReplyTo() {
    $this->getData();
    return $this->replyTo;
  }

  /**
   * Get the max comments in the topic
   *
   * @return integer The max comments in the topic
   */
  function getTruncateAt() {
    $this->getData();
    return $this->truncateAt;
  }

  /**
   * Get the latest comment time
   *
   * @return integer The latest comment time
   */
  function getCurrCommentTime() {
    $this->getData();
    return $this->currCommentTime;
  }

  /**
   * Get the latest comment number
   *
   * @return integer The latest comment number
   */
  function getLastCommentNumber() {
    $this->getData();
    return $this->lastCommentNumber;
  }

  /**
   * Get the latest comment owner id
   *
   * @return integer The latest comment owner id
   */
  function getCurrCommentOwnerId() {
    $this->getData();
    return $this->currCommentOwnerId;
  }

  /**
   * Get the latest comment unique id
   *
   * @return string The latest comment unique id
   */
  function getCurrCommentUniqId() {
    $this->getData();
    return $this->currCommentUniqId;
  }

  /**
   * Get the latest comment parsed text
   *
   * @return string The latest comment parsed text
   */
  function getCurrParsedCommentText() {
    $this->getData();
    return $this->currParsedCommentText;
  }

  /**
   * Get the parsed description for the topic
   *
   * @return string The parsed description for the topic
   */
  function getDescriptionParsed() {
    $this->getData();
    return $this->descriptionParsed;
  }

}
?>
