(function($) {
  Forum.widget.topicComments = {
    _create: function() {
      var self = this;
      $.Forum.TopicComments.instances.push(this);
      $.Widget.prototype._create(this);
      this.options.tabLabel.html(this.options.topicObj.pureName); // TODO: replace with widget
      this.element.append('<div id="loader"/>');
      this.root = $('<div id="mainContentHolder"/>');
      this.element.append(this.root);
      this.loader = new Forum.widget.Loader({
        root: this.element,
        fadeTime: 1000,
      });
      this.loader.show()
      $.when(
        Forum.codeLoader.load('Forum.widget.topicName')
        , Forum.codeLoader.load('Forum.model.Topic')
        , Forum.codeLoader.load('Forum.controller.topic')
        , Forum.codeLoader.load('Forum.widget.userName')
      ).then(function() {
        console.log('run');
      });
    },

    update: function() {
      console.log('got an update request');
    },
    
    destroy: function() {
      var elementIndex = $.Forum.TopicComments.instances.indexOf(this);
      console.log('destroying');
      if (elementIndex != -1)
        $.Forum.TopicComments.instances.splice(elementIndex, 1);
      $.Widget.prototype.destroy.call(this);
    },
  };

  $.widget('Forum.TopicComments', Forum.widget.topicComments);
  $.extend($.Forum.TopicComments, {
    instances: new Array(),
  });
})(jQuery)
