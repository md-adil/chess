var gameData = require('./data');

var liveMachines = [],
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

gameData.on('fire-machines', function() {
	emitLiveStatus(io);
});


function emitLiveStatus(io) {
	console.log('capturing machine output.');
	liveMachines.forEach(function(machine, i) {
		machine.stdout.on('data', function(data) {
			// console.log('fishout: ', data.toString());
			io.sockets.emit('live-broadcast', i, data.toString());
		});
	});
}
