const PORT = process.env.PORT || 3002;
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
const config = require('./config');
const http = require('http');
const socketio = require('socket.io');

const server = http.Server(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


server.listen(PORT, function () {
  console.log(`server is running on ${PORT}`);
});

mongoose.connect(config.mongo_url, {}, function (err) {
  if (err) console.log(err);
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const io = socketio(server);
let cache = [];

io.on('connect', (socket) => {
  io.sockets.connected[socket.id].emit('userName-request');

  socket.on('userName-answer', ({ userName }, callback) => {
    cache.push({ socketId: socket.id, userName, userName });
    socket.emit('activeUsers', { activeUsers: cache });
    socket.broadcast.emit('activeUsers', { activeUsers: cache });
  });

  socket.on('disconnect', (x, callback) => {
    cache = cache.filter(payload => payload.socketId != socket.id);
    socket.broadcast.emit('activeUsers', { activeUsers: cache });
  });

  socket.on('message', ({ createdBy, message, targetUser, timestamp }, callback) => {
    if (io.sockets.connected[targetUser.socketId])
      io.sockets.connected[targetUser.socketId].emit('serverMessage', { createdBy, message, timestamp });
  });

});

