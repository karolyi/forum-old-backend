(function($) {

  // The Topic object
  var Topic = function(options) {
    this._unsetValues = [
      'id',
      'pureName',
      'htmlName',
      'commentCount',
      'ownerId',
      'disabled',
      'adminOnly',
      'groupId',
      'votingEnabled',
      'replyTo',
      'truncateAt',
      'currCommentTime',
      'lastCommentNumber',
      'currCommentOwnerId',
      'currCommentUniqId',
      'currParsedCommentText',
      'descriptionParsed',
    ];
    this._init(options);
  };

  Topic.prototype.set = function(key, value) {
    if (value === undefined)
      return;
    if (this._unsetValues.indexOf(key) == -1)
      return;
    var elementNumber = this._unsetValues.indexOf(key);
    this._unsetValues.splice(elementNumber, 1);
    this[key] = value;
  };

  Topic.prototype._init = function(options) {
    if (typeof options === 'object')
      for (var key in options)
        this.set(key, options[key]);
  };

  Forum.model.Topic = Topic;

})(jQuery)
