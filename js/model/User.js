(function($) {

  // The user object
  var User = function(options) {
    this._unsetValues = [
      'id',
      'name',
      'quote',
      'regDate',
      'language',
      'topicCommentsPerPage',
      'topicPerGroup',
      'votingValue',
      'votingCount',
      'voteLimit',
      'maxPostsPerDay',
      'sumComments',
      'todayComments',
      'yesterdayComments',
      'invitations',
      'inviterUserId',
      'inviteSuccess',
      'reminders',
      'usedSkin',
      'ignoredUserIdArray',
      'introduction',
//      'regIntroduction',
//      'friendIntroduction',
      'settings',
    ];
    this._init(options);
  };

  User.prototype.set = function(key, value) {
    if (value === undefined)
      return;
    var elementNumber = this._unsetValues.indexOf(key);
    if (elementNumber != -1)
      this._unsetValues.splice(elementNumber, 1);
    this[key] = value;
  };

  User.prototype._init = function(options) {
    if (typeof options === 'object')
      for (var key in options)
        this.set(key, options[key]);
  };

  Forum.model.User = User;

})(jQuery)
