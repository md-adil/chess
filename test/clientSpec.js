var expect = require('chai').expect;
var Client = require('../app/client');

var c = new Client();
c.on('test', function() {
	console.log('testing');
});

c.emit('test');
describe("Client", function() {
	it("Should have event listeners", function() {
		expect('adil').to.match(/adil/);
	});
	console.log("Hello");
})
