const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.Server(app);
server.listen(3000);

const io = socketIo(server);

var numConn = 0;
var users = [];

function getUser(userId) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].id == userId) {
      return users[i];
    }
  }
}

io.on('connection',(socket)=>{
  socket.emit('connect');

  ++numConn;
  var newUser = {
    id: socket.id,
    name: ''
  };
  users.push(newUser)
  socket.emit('getID',socket.id);

  socket.on('changeID',(data)=>{
    for (var i = 0; i < users.length; i++) {
      if (users[i].id == socket.id) {
        users[i].name = data;
      }
    }
    socket.emit('id_changed',data);
    socket.emit('list_user',users);
    socket.broadcast.emit('list_user',users);
    socket.broadcast.emit('user_join',data);
  });

  socket.on('send_notif',(data)=>{
    var notifData = {
      id: socket.id,
      user_id: data.user_id?getUser(data.user_id):'',
      name: getUser(socket.id).name,
      msg: data.msg
    };
    if (data.user_id!='') {
      io.to(data.user_id).emit('msg',notifData);
    }else{
      socket.broadcast.emit('msg',notifData);
    }
    socket.emit('msg',notifData);
  });

  socket.on('disconnect',()=>{
    --numConn;
    var uleft;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id == socket.id) {
        uleft = users[i];
        users.splice(i,1);
      }
    }
    socket.emit('list_user',users);
    socket.broadcast.emit('user_leave',uleft);
    socket.broadcast.emit('list_user',users);
  });

});
