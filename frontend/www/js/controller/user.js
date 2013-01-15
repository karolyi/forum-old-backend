(function($) {
  var User = Forum.model.User;

  Forum.controller.user = {
    _userStore: new Object(),

    loadDeferred: function(notKnownIdArray, knownIdObj) {
      var self = this;
      var dfd = $.Deferred();
      $.ajax({
        url: Forum.settings.apiHost + '/user/get/' + notKnownIdArray.join(','),
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          for (var key in data) {
            var userObj = data[key];
            self._userStore[userObj.id] = new User(userObj);
            knownIdObj[data[key].id] = self._userStore[data[key].id];
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
        if (self._userStore[userId] === undefined) {
          notKnownIdArray.push(userId);
        } else {
          if (self._userStore[userId]._unsetValues.length)
            // Not all values set, queue for loading
            notKnownIdArray.push(userId);
          else
            knownIdObj[userId] = self._userStore[userId];
        }
      }
      if (notKnownIdArray.length)
        return this.loadDeferred(notKnownIdArray, knownIdObj);
      else
        return $.Deferred().resolve(knownIdObj).promise();
    },

    set: function(userObj) {
      if (userObj.id) {
        if (this._userStore[userObj.id]) {
          // Update the existing user object in store
          this._userStore[userObj.id]._init(userObj);
        } else {
          // Create a new user object
          this._userStore[userObj.id] = new User(userObj);
        }
      }
    },
  };
})(jQuery)
