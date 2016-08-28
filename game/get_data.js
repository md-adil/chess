var fs = require('fs');
var Event = require('events');
var request = require('request');
var event = new Event;
module.exports = event

var lastModified;
function doRequest() {
	request('http://wjcc2016india.com/live-games/open/round10/01to08/games.pgn', function(err, response, body) {
		if(err) {
			console.log(err);
		} else {
			if(lastModified !== response.headers['last-modified']) {
				console.log('modified', response.headers['last-modified']);
				lastModified = response.headers['last-modified'];
			} else {
				console.log('SAme');
			}
		}
		console.log(body);
		setTimeout(doRequest, 500);
	});
}

doRequest();