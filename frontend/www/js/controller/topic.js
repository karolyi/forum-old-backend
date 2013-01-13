(function($) {
  var Topic = Forum.model.Topic;

  Forum.controller.topic = {
    _topicStore: new Object(),

    deferObj: function(notKnownIdArray, knownIdObj) {
      var self = this;
      var dfd = $.Deferred();
      $.ajax({
        url: Forum.settings.apiHost + '/topic/get/' + notKnownIdArray.join(','),
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          for (var key in data) {
            var topicObj = data[key];
            self._topicStore[topicObj.id] = new Topic(topicObj);
            knownIdObj[topicObj.id] = self._topicStore[topicObj.id];
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
        if (self._topicStore[topicId] === undefined) {
          notKnownIdArray.push(topicId);
        } else {
          //console.log(self._topicStore);
          if (self._topicStore[topicId]._unsetValues.length)
            // Object not fully loaded, queue for loading
            notKnownIdArray.push(topicId);
          else
            knownIdObj[topicId] = self._topicStore[topicId];
        }
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
      return this._topicStore[id];
    },
  };
})(jQuery)
