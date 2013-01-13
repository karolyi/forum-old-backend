var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(8081);
var socketList = new Array();
var streamSubsObj = new Object();
var socketIdSubsObj = new Object();


setInterval(function() {
  console.log('array length:', socketList.length);
  socketList.forEach(function(socket) {
  socket.emit('userChange', {"id":10683,"name": Math.random(),"quote": Math.random(),"regDate":1326824935,"language":"hu_HU","topicCommentsPerPage":50,"topicPerGroup":20,"votingValue":10,"votingCount":12,"voteLimit":-5,"maxPostsPerDay":0,"sumComments":4,"todayComments":1,"yesterdayComments":0,"invitations":0,"inviterUserId":0,"inviteSuccess":0,"reminders":0,"usedSkin":"default","ignoredUserIdArray":[],"introduction":"Sziasztok Ag\u00f3cs Bence vagyok Szentesr\u0151l. Honda Civic d16z7 1992-es aut\u00f3m van. Nagyon szeretem..\u00e9s szeretn\u00e9k ott lenni id\u00e9n a Hond\u00e1s tal\u00e1lkoz\u00f3kon amennyin csak lehet. Ha tudtok valamit tal\u00e1lkoz\u00f3kr\u00f3l \u00edrjatok. ","settings":{"isAdmin":false,"autoBookmarks":false,"mailsFromOwnTopic":false,"mailsFromReplies":true,"mailsFromModeration":true,"mailsFromMessages":true,"showAnswersAtComments":true,"showRelations":true,"isDisabled":false,"bookmarkedTopicsFirst":true,"showOutsiders":true,"showChat":true,"activated":true,"approved":true,"showArchivedTopics":false,"useBackgrounds":true}});
  });
}, 5000);

function handler (req, res) {
  console.log(__dirname);
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.on('disconnect', function() {
    console.log('disconnect from ', socket.handshake.address);
    // Remove me from all sockets list
    if (socketList.indexOf(socket) != -1) {
      console.log('removing');
      socketList.splice(socketList.indexOf(socket), 1);
    }
    // Remove from subscriptions
    if (socketIdSubsObj[socket.id]) {
      var subsList = socketIdSubsObj[socket.id];
      subsList.forEach(function(streamName) {
        if (streamSubsObj[streamName])
          if (socket in streamSubsObj[streamName])
            streamSubsObj[streamName].splice(streamSubsObj[streamName].indexOf(socket), 1);
      });
      delete(socketIdSubsObj[socket.id]);

    }
  })

  socket.on('subscribe', function (data) {
    var streamName = data.streamName;
    if (streamSubsObj[streamName])
      streamSubsObj[streamName].push(socket);
    else
      streamSubsObj[streamName] = [socket];
    if (socketIdSubsObj[socket.id])
      socketIdSubsObj[socket.id].push(streamName);
    else
      socketIdSubsObj[socket.id] = [streamName];
  });

  socket.on('unsubscribe', function(data) {
    var streamName = data.streamName;
    if (streamSubsObj[streamName])
      if (streamSubsObj[streamName].indexOf(socket) != -1)
        streamSubsObj[streamName].splice(streamSubsObj[streamName].indexOf(socket), 1);
    if (socketIdSubsObj[socket.id])
      if (socketIdSubsObj[socket.id].indexOf(streamName) != -1)
        socketIdSubsObj[socket.id].splice(socketIdSubsObj[socket.id].indexOf(streamName), 1);
  });
  console.log('connect from ', socket.handshake.address);
  socketList.push(socket);
//  socket.on('my other event', function (data) {
//    console.log(data);
//  });
});
