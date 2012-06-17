(function($) {

  // The user object
  var User = function(options) {
    this.name = options.name;
    this.quote = options.quote;
  };
  Forum.model.User = User;

})(jQuery)
