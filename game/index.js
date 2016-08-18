var spawn = require('child_process').spawn,
	Chess = require('chess.js').Chess,
	gameData = require('./data');

var fishPath = __dirname + '/../stockfish';

var players = {},
	machines = {},
	liveMachines = [],
	currentGames = [];

gameData.on('loaded', function(games) {
	games.forEach(function(d, i) {
		var chess = new Chess();
		chess.load_pgn(d);
		currentGames.push(chess);
		var machine = spawn(fishPath);
		console.log("position fen " + chess.fen() + "\n");
		machine.stdin.write("position fen " + chess.fen() + "\n");
		machine.stdin.write("go depth 18\n");
		liveMachines.push(
			machine
		);
	});
	this.emit('fire-machines');
});

module.exports = function(io) {
	console.log('Running server');
	io.on('connection', onConnect.bind(this,io));
	gameData.on('fire-machines', function() {
		emitLiveStatus(io);
	});
}

function emitLiveStatus(io) {
	console.log('capturing machine output.');
	liveMachines.forEach(function(machine, i) {
		machine.stdout.on('data', function(data) {
			// console.log('fishout: ', data.toString());
			io.sockets.emit('live-broadcast', i, data.toString());
		});
	});
}


function onConnect(io, socket) {
	console.log('Socket id ' + socket.id);
	// When disconnecting client.
	socket.on('disconnect', function() {
		if(machines[socket.id]) {
			machines[socket.id].on('exit', function(e) {
				console.log('Exiting the machine ' + e);
			});
			machines[socket.id].stdin.end();
		} else {
			var player = players[socket.id];
			delete players[socket.id];
			if(player) {
				player.id = socket.id;
				io.sockets.emit('client_disconnected', player);
			}
		}
		// fire disconnect event.
		console.log("Disconnected " + socket.id);
	});

	// When joining client.
	socket.on('joining-client', function(person) {
		socket.emit('client-joined', {id: socket.id, players: players});
		players[socket.id] = person;
		person.id = socket.id
		// Fire events to all when  new client
		io.sockets.emit('new_client', person);
	});

	socket.on('moving', function(data) {
		if(data.personId == 'machine') {
			if(!machines[socket.id]) {
				console.log('Starting the machine for id', socket.id);
				machines[socket.id] = spawn(fishPath);
			}
			machines[socket.id].stdin.write("position fen " + data.fen + "\n");
			machines[socket.id].stdin.write("go depth 18\n");
			machines[socket.id].stdout.on('data', function(out) {
				out = String(out);
				console.log(out);
				var res = out.match(/bestmove (\w+)/);
				if(res) {
					data.moves = res[1];
					socket.emit('moved', data);
				}
			});
		} else {
			var opponent = io.sockets.connected[data.personId];
			if(opponent) {
				opponent.emit('moved', data);
			}
		}
	});

	socket.on('selecting-client', function(person) {
		console.log(io.sockets.socket);

		var s = io.sockets.connected[person.clientId];
		if(s) {
			s.emit('selected-client', person);
		}
	});
	
}
