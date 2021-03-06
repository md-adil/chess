var spawn, Chess, fishPath,
	players = {}, machines = {};

spawn = require('child_process').spawn,
Chess = require('chess.js').Chess;

fishPath = __dirname + '/../stockfish';

module.exports = function(io) {
	io.on('connection', function(socket) {
		on_clientConnect(io, socket);
	});
}

function on_clientLeave(io, socket) {
	if(machines[socket.id]) {
		machines[socket.id].on('exit', function(e) {
			console.log('Exiting the machine ' + e);
		});
		machines[socket.id].stdin.end();
	} else {
		var player = players[socket.id];
		if(player) {
			delete players[socket.id];
			player.id = socket.id;
			io.sockets.emit('client_disconnected', player);
		}
	}
	// fire disconnect event.
	console.log("Disconnected " + socket.id);
}

function on_clientJoin(io, socket, person) {
	socket.emit('client-joined', {id: socket.id, players: players});
	players[socket.id] = person;
	person.id = socket.id;
	// Fire events to all when  new client
	io.sockets.emit('new_client', person);
}

function on_pieceMove(io, socket, data) {
	if(data.personId == 'machine') {
		getMachine(socket.id, socket, data)
			.stdin.write("position fen " + data.fen + "\ngo depth 10\n");
	} else {
		var opponent = io.sockets.connected[data.personId];
		if(opponent) {
			opponent.emit('moved', data);
		}
	}
}

function getMachine(id, socket, data) {
	if(!machines[id]) {
		var machine = spawn(fishPath);
		bindDataOnMachine(machine, socket, data);
		machines[id] = machine;
	}

	return machines[id];
}

function bindDataOnMachine(machine, socket, data) {
	machine.stdout.on('data', function(out) {
		var res = String(out);
		res = res.match(/bestmove (\w+)/);
		if(res) {
			data.moves = res[1];
			socket.emit('moved', data);
		}
	});
}

function on_clientConnect(io, socket) {
	console.log('Socket id ' + socket.id);
	// When disconnecting client.
	socket.on('disconnect', function() {
		on_clientLeave(io, socket)
	});

	// When joining client.
	socket.on('joining-client', function(person) {
		on_clientJoin(io, socket, person);
	});

	socket.on('moving', function(data) {
		on_pieceMove(io, socket, data);
	});

	socket.on('selecting-client', function(person) {
		var s = io.sockets.connected[person.clientId];
		if(s) {
			s.emit('selected-client', person);
		}
	});
}
