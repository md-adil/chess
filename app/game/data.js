var data = require('./get_data');
var Event = require('events');
var evt = new Event;
module.exports = data.on('data', function(err, data) {
	if(err) {
		console.log('Error found.');
	}
	this.emit('loaded', splitGame(data));
});

function splitGame(pgn) {
	var games = [], game = '';
	var lines = pgn.split('\n');
	for(var i = 0; i < lines.length; i++) {
		if(lines[i].indexOf('[Event') == 0) {
			if(game) {
				games.push(game);
			}
			game = '';
		}
		game += lines[i] + '\n';
		if(i == (lines.length - 1)) {
			games.push(game);
		}
	}
	return games;
}