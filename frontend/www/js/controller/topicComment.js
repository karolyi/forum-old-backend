(function($) {
  var TopicComment = Forum.model.TopicComment;

  Forum.controller.topicComment = {
    userStore: new Object(),

    deferObj: function(notKnownIdArray, knownIdObj) {
      var self = this;
      var dfd = $.Deferred();
      $.ajax({
        url: Forum.settings.apiHost + '/topicComment/get/' + notKnownIdArray.join(','),
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          for (var key in data) {
            var topicCommentObj = data[key]
            self.userStore[topicCommentObj.id] = new TopicComment(topicCommentObj);
            knownIdObj[data[key].id] = self.userStore[data[key].id];
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
        var userId = parseInt(idArray[key]);
        if (self.userStore[userId] === undefined) {
          notKnownIdArray.push(userId);
        } else {
          if (self.userStore[userId]._unsetValues.length)
            // Not all values set, queue for loading
            notKnownIdArray.push(userId);
          else
            knownIdObj[userId] = self.userStore[userId];
        }
      }
      if (notKnownIdArray.length)
        return self.deferObj(notKnownIdArray, knownIdObj);
      else
        return $.Deferred().resolve(knownIdObj);
    },
  };
})(jQuery)
