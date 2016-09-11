var express = require('express'),
	app = express(),
	server = require('http').Server(app);

require('./connection')(server);

app.use(express.static(__dirname + '/../public'));
server.listen(3000,'0.0.0.0');