(function($) {
  Forum.socketHandler = {
    listeners: new Object(),

    init: function() {
      var self = this;
      this.socket = io.connect(Forum.settings.socketServerUrl);
    },

    subscribe: function (streamName, callback) {
      this.socket.on(streamName, callback);
      if (this.socket.listeners(streamName).length == 1)
        // First subscription
        this.socket.emit('subscribe', {
          streamName: streamName,
        });
    },

    unsubscribe: function (streamName, callback) {
      this.socket.removeListener(streamName, callback);
      if (!this.socket.listeners(streamName).length)
        this.socket.emit('unsubscribe', {
          streamName: streamName,
        })
    },
  };

  Forum.socketHandler.init();
})(jQuery)
