<?php
namespace Forum;

class Lock {
  function __construct($lockName) {
    $this->lockName = $lockName;
    $this->configOptions = \Forum\Config\Options::getInstance();
    $this->lockFileName = $this->configOptions->lockFileDir . '/' . $this->lockName;
    touch($this->lockFileName);
  }

  function acquire() {
    // Acquire a lock
    ignore_user_abort(True);
    $result = false;
    $time = 0;
    $this->fileDescriptor = fopen($this->lockFileName, 'r');
    while(!$result) {
      $result = flock($this->fileDescriptor,  LOCK_EX | LOCK_NB);
      // If succeeded, break the waiting cycle
      if ($result)
        break;
      $time += $this->configOptions->lockWaitCycleTime;
      usleep($this->configOptions->lockWaitCycleTime * 1000);
      if ($time >= $this->configOptions->lockWaitMaxTime)
        break;
    }
    if (!$result)
      throw new Exception(_('Timeout waiting for lock.'));
    else
      return true;
  }

  function release() {
    fclose($this->fileDescriptor);
  }
}

?>
