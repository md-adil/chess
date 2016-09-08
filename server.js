var express = require('express'),
	app = express(),
	server = require('http').Server(app),
	game = require('./game'),
	io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
game(io);


server.listen(3000,'0.0.0.0');