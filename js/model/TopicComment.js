(function($) {

  // The TopicComment object
  var TopicComment = function(options) {
    this._unsetValues = [
      'commentNumber',
      'ownerId',
      'unixTime',
      'votingValue',
      'hostName',
      'prevNumber',
      'prevUserId',
      'prevTopicId',
      'prevUniqId',
      'movedTopicId',
      'commentUniqId',
      'commentParsed',
      'edits',
      'answersToThis',
      'topicId',
    ];
    this._init(options);
  };

  TopicComment.prototype.set = function(key, value) {
    if (value === undefined)
      return;
    if (this._unsetValues.indexOf(key) == -1)
      return;
    var elementNumber = this._unsetValues.indexOf(key);
    this._unsetValues.splice(elementNumber, 1);
    this[key] = value;
  };

  TopicComment.prototype._init = function(options) {
    if (typeof options === 'object')
      for (var key in options)
        this.set(key, options[key]);
  };

  Forum.model.TopicComment = TopicComment;

})(jQuery)
