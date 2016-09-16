var Client = require('./client');

module.exports = function(server) {
	var io = require('socket.io')(server);
	Client.io(io);
	
	io.on('connection', function(socket) {
		bindConnectionEvents(io, socket);
	});
}

function bindConnectionEvents(io, socket) {
	console.log('Client Connected: ' + socket.id);
	var client = new Client(socket.id);
	socket.on('disconnect', function() {
		client.destroy();
		delete client;
	});

	// When joining client.
	socket.on('client/join', function(req) {
		on_clientJoin(io, socket, req);
	});

	socket.on('client/position/move', function(data) {
		client.move(data.position);
	});

	socket.on('client/request/connect', function(req) {
		var s = io.sockets.connected[req.client_id];
		if(s) {
			s.emit('server/client/request', req);
		}
	});

	socket.on('client/connect/machine', function(req) {
		var machine = client.connectMachine(req.depth);
		bindClientEvents(client, io, socket);
	});

	socket.on('client/request/accept', function(req) {
		var s = io.sockets.connected[req.client_id];
		if(s) {
			var newClient = client.connect(req.client_id);
			s.emit('server/request/accepted', req.id);
			bindClientEvents(client, io, socket);
		}
	});

	socket.on('client/request/reject', function(req) {
		var s = io.sockets.connected[req.client_id];
		if(s) {
			s.emit('server/request/reject', req);
		}
	});
}

function on_clientJoin(io, socket, req) {
	socket.emit('client-joined', {id: socket.id, players: players});
	players[socket.id] = req;
	req.id = socket.id;
	io.sockets.emit('new_client', req);
}

function bindClientEvents(client, io, socket) {
	client.connected().on('moved', function(pos) {
		client.socket().emit('server/position/move', pos);
	});

	client.socket().on('client/position/move', function(pos) {
		client.move(pos);
	});

	client.on('destroy', function(c) {
		client.socket().emit('server/client/active/destroyed', c.id);
		Client.io().sockets.emit('server/client/destroyed', c.id);
	});
}
