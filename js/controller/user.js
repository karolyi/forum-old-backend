(function($) {
  var User = Forum.model.User;

  Forum.controller.user = {
    userStore: new Object(),

    deferObj: function(notKnownIdArray, knownIdObj) {
      var self = this;
      var dfd = $.Deferred();
      $.ajax({
        url: '/api/user/get/' + notKnownIdArray.join(','),
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          for (var key in data) {
            var userObj = data[key]
            self.userStore[userObj.id] = new User(userObj);
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
