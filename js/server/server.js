var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(8081);
var socketList = new Array();
var streamSubsObj = new Object();
var socketIdSubsObj = new Object();


setInterval(function() {
//  console.log('array length:', socketList.length);
  socketList.forEach(function(socket) {
    socket.emit('test', {meep: 'meepmeep'});
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
