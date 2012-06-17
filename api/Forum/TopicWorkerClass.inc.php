<?php
namespace Forum;

class TopicWorker {
  function __construct() {
    $this->db = \Forum\Db::getInstance();
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->session = \Forum\Session::getInstance();
    $this->TOPIC_NORMAL = 0;
    $this->TOPIC_ARCHIVED = 1;
    $this->TOPIC_HIGHLIGHTED = 2;
  }

  /**
   * Return the appropriate topic object, according to the session.
   *
   * @param boolean If only the archived topics should return
   */
  function getTopicList($onlyArchived = false) {
    $myUserObj = \Forum\User::getById($this->session->getUserId());
    $searchArray = array('disabled' => false);
    // If not admin, only fetch the non-admin topics
    if (!$myUserObj->getIsAdmin())
      $searchArray['adminOnly'] = false;
    if ($onlyArchived)
      $searchArray['groupId'] = $this->TOPIC_ARCHIVED;
    if (!$myUserObj->getShowArchivedTopics() && !isset($searchArray['groupId']))
      $searchArray['groupId'] = array('$nin' => array($this->TOPIC_ARCHIVED));
    $cursor = $this->db->topicData->find($searchArray)->sort(array('currCommentTime' => -1));
    $responseArray = array(
      'topicNormal' => array(),
      'topicHighlighted' => array(),
      'topicArchived' => array(),
      'topicBookmarked' => array(),
      'topicNotBookmarked' => array(),
    );
    foreach($cursor as $value) {
      unset($value['_id']);
      if ($value['groupId'] == $this->TOPIC_NORMAL)
        $responseArray['topicNormal'][] = $this->_prepareResultRow($value);
      if ($value['groupId'] == $this->TOPIC_HIGHLIGHTED)
        $responseArray['topicHighlighted'][] = $this->_prepareResultRow($value);
      if ($value['groupId'] == $this->TOPIC_ARCHIVED)
        $responseArray['topicArchived'][] = $this->_prepareResultRow($value);
    }
    print json_encode($responseArray);
  }

  /**
   * Prepare a result row for sending
   *
   * @param array A topic result row
   *
   * @return array The prepared array
   */
  function _prepareResultRow($row) {
/*    $userId = $row['currCommentOwnerId'];
    $userObj = \Forum\User::getById($userId);
    $row['currCommentUser'] = array(
      'id' => $userId,
      'name' => $userObj->getName(),
      'quote' => $userObj->getQuote()
    );
    unset($row['currCommentOwnerId']);
 */
    return $row;
  }

  /**
   * Get the archived topics
   */
  function getArchivedTopicList() {
    $this->getTopicList(true);
  }
}
