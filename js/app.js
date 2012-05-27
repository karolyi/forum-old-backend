var Forum = new Object(), f = Forum;

Forum.init = function() {
  setTimeout(function() {
    $('#pageLoader').fadeOut(1000);
    $('#pageHolder').fadeIn(1000);
  }, 3000)
}

//$(document).ready(Forum.init);
