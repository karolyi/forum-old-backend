<?php
namespace Forum;

class Db {
  private static $dbConnection;
  private static $selectedDb;
  private function __construct() {
  }

  public static function getInstance() {
    if (!self::$dbConnection) {
      $dbData = new \Forum\Config\DbData();
      self::$dbConnection = new \Mongo("mongodb://" . $dbData->user . ":" . $dbData->pass . "@" . $dbData->host . ":" . $dbData->port . "/" . $dbData->name);
      self::$selectedDb = self::$dbConnection->selectDB($dbData->name);
    }
    return self::$selectedDb;
  }
}

?>
