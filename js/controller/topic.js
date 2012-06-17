(function($) {
  var Topic = Forum.model.Topic;

  Forum.controller.topic = {
    _topicStore: new Object(),

    deferObj: function(notKnownIdArray, knownIdObj) {
      var self = this;
      var dfd = $.Deferred();
      $.ajax({
        url: '/api/topic/get/' + notKnownIdArray.join(','),
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          for (var key in data) {
            var topicInfo = data[key];
            self._topicStore[topicInfo.id] = new Topic(topicInfo);
            knownIdObj[topicInfo.id] = self._topicStore[topicInfo.id];
          }
          return dfd.resolve(knownIdObj);
        },
      });
      return dfd.promise();
    },

    get: function(idArray) {
      var self = this;
      var notKnownIdArray = new Array();
      var knownIdObj = new Object();
      // Lookup the keys
      for(var key in idArray) {
        var topicId = parseInt(idArray[key]);
        if (self._topicStore[topicId] === undefined)
          notKnownIdArray.push(topicId);
        else
          knownIdObj[topicId] = self._topicStore[topicId];
      }
      if (notKnownIdArray.length)
        return self.deferObj(notKnownIdArray, knownIdObj);
      else
        return $.Deferred().resolve(knownIdObj);
    },

    set: function(id, options) {
      if (this._topicStore[id] === undefined)
        this._topicStore[id] = new Topic({
          id: id,
        });
      for (var key in options)
        this._topicStore[id].set(key, options[key]);
    },
  };
})(jQuery)
