var fs = require('fs');
var Event = require('events');
var request = require('request');
var event = new Event;
module.exports = event
	request.get('http://wjcc2016india.com/live-games/open/round10/01to08/games.pgn',function(err, request, body) {
		console.log(request);
	});
// setTimeout(function() {
// }, 10);

/*
fs.readFile(__dirname + '/../data/pgn.pgn', 'utf8', function(err, data) {
	event.emit('data', err, data)
});

*/