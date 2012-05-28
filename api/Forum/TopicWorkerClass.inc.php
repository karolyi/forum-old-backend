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
      'normal' => array(),
      'highlighted' => array(),
      'archived' => array(),
    );
    foreach($cursor as $value) {
      unset($value['_id']);
      if ($value['status'] == $this->TOPIC_NORMAL)
        $responseArray['normal'][] = $value;
      if ($value['status'] == $this->TOPIC_HIGHLIGHTED)
        $responseArray['highlighted'][] = $value;
      if ($value['status'] == $this->TOPIC_ARCHIVED)
        $responseArray['archived'][] = $value;
    }
    print json_encode($responseArray);
  }
}
