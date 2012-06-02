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
   * @return array() Topic list object, sorted
   */
  function getTopicList() {
    $myUserObj = \Forum\User::getById($this->session->getUserId());
    $searchArray = array('disabled' => False);
    // If not admin, only fetch the non-admin topics
    if (!$myUserObj->getIsAdmin())
      $searchArray['adminOnly'] = False;
    if (!$myUserObj->getShowArchivedTopics())
      $searchArray['status'] = array('$nin' => array($this->TOPIC_ARCHIVED));
    $fieldsToShow = array(
      'htmlName',
      'pureName',
      'topicId',
      'commentCount',
      'currCommentTime',
      'currCommentOwnerId',
      'currParsedCommentText',
      'status',
    );
    $cursor = $this->db->topicData->find($searchArray, $fieldsToShow)->sort(array('currCommentTime' => -1));
    $responseArray = array(
      'topicNormal' => array(),
      'topicHighlighted' => array(),
      'topicArchived' => array(),
      'topicBookmarked' => array(),
      'topicNotBookmarked' => array(),
    );
    foreach($cursor as $value) {
      unset($value['_id']);
      if ($value['status'] == $this->TOPIC_NORMAL)
        $responseArray['topicNormal'][] = $this->_prepareResultRow($value);
      if ($value['status'] == $this->TOPIC_HIGHLIGHTED)
        $responseArray['topicHighlighted'][] = $this->_prepareResultRow($value);
      if ($value['status'] == $this->TOPIC_ARCHIVED)
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
    $userId = $row['currCommentOwnerId'];
    $userObj = \Forum\User::getById($userId);
    $row['currCommentUser'] = array(
      'id' => $userId,
      'name' => $userObj->getName(),
      'quote' => $userObj->getQuote()
    );
    unset($row['currCommentOwnerId']);
    return $row;
  }
}
