//  Customization


// Librairies

var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);


var jade = require('jade');
// var io = require('socket.io').listen(app);
var pseudoArray = ['admin']; //block the admin username (you can disable it)
var titleArray = ['Anything'];

// Views Options

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false })

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

// Render and send the main page

app.get('/', function(req, res){
  res.render('index.jade');
});
server.listen(port);

// Handle the socket.io connections

var users = 0; //count the users

io.sockets.on('connection', function (socket) { // First connection
  users += 1; // Add 1 to the count
  reloadUsers(); // Send the count to all the users
  socket.on('message', function (data) { // Broadcast the message to all
    if(pseudoSet(socket))
    {
      var transmit = {date : new Date().toISOString(), pseudo : returnPseudo(socket), message : data};
      socket.broadcast.emit('message', transmit);
      console.log("user "+ transmit['pseudo'] +" said \""+data+"\"");
    }
  });
  socket.on('setPseudo', function (data) { // Assign a name to the user
    if (pseudoArray.indexOf(data) == -1) // Test if the name is already taken
    {
      socket.set('pseudo', data, function(){
        pseudoArray.push(data);
        socket.emit('pseudoStatus', 'ok');
        console.log("user " + data + " connected");
      });
    }
    else
    {
      socket.emit('pseudoStatus', 'error') // Send the error
    }
  });
  socket.on('setTitle', function (data) {
    if (titleArray.indexOf(data) == -1)
    {
      socket.set('test', data, function(){
        titleArray.push(data);
        socket.emit('titleStatus', 'ok');
        console.log("Title set to " + data);
      });
    }
    else
    {
      socket.emit('titleStatus', 'error')
    }
  });
  socket.on('disconnect', function () { // Disconnection of the client
    users -= 1;
    reloadUsers();
    if (pseudoSet(socket))
    {
      var pseudo;
      socket.get('pseudo', function(err, name) {
        pseudo = name;
      });
      var index = pseudoArray.indexOf(pseudo);
      pseudo.slice(index - 1, 1);
    }
  });
});

function reloadUsers() { // Send the count of the users to all
  io.sockets.emit('nbUsers', {"nb": users});
}

function pseudoSet(socket) { // Test if the user has a name
  var test;
  socket.get('pseudo', function(err, name) {
    if (name == null ) test = false;
    else test = true;
  });
  return test;
}

function titleSet(socket) { // Set title for chat room
  var test;
  socket.get('title', function(err, title) {
    if (title == null ) test = false;
    else test = true;
  });
  return test;
}

function returnPseudo(socket) { // Return the name of the user
  var pseudo;
  socket.get('pseudo', function(err, name) {
    if (name == null ) pseudo = false;
    else pseudo = name;
  });
  return pseudo;
}

function returnTitle(socket) { // Return title of room
  var title;
  socket.get('title', function(err, name) {
    if ( name == null ) title = false;
    else title = name;
  });
  return title;
}