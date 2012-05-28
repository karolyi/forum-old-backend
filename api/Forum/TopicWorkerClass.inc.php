<?php
namespace Forum;

class TopicWorker {
  function __construct() {
    $this->db = \Forum\Db::getInstance();
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->TOPIC_NORMAL = 0;
    $this->TOPIC_ARCHIVE = 1;
    $this->TOPIC_HIGHLIGHTED = 2;
  }

  /**
   * Return the appropriate topic object, according to the session.
   *
   * @return array() Topic list object, sorted
   */
  function getTopicList() {
    $searchArray = array();
    $this->db->topicData->find();
  }
}
