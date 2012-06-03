<?php
namespace Forum;

class BackgroundImages {
  function __construct() {
    $this->session = \Forum\Session::getInstance();
    $this->user = \Forum\User::getById($this->session->getUserId());
    $this->usedSkin = $this->user->getUsedSkin();
  }

  function getSource() {
    $fileDescriptor = opendir($_SERVER['DOCUMENT_ROOT'] . '/skins/' . $this->usedSkin . '/images/backgrounds');
    $pathArray = array();
    while (($file = readdir($fileDescriptor)) !== false) {
      if ($file != '.' && $file != '..')
        $pathArray[] = '/skins/' . $this->usedSkin . '/images/backgrounds/' . $file;
    }
    closedir($fileDescriptor);
    return $pathArray;
  }
}
?>
