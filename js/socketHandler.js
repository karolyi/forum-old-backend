(function($) {
  Forum.socketHandler = {
    init: function() {
      var self = this;
      this.socket = io.connect(Forum.settings.socketServerUrl);
      this.socket.on('news', function(data) {
        console.log(data);
//        self.socket.emit('my other event', {my: 'data'});
      });
    },
  };

  Forum.socketHandler.init();
})(jQuery)
