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


