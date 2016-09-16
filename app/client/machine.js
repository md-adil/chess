var spawn = require('child_process').spawn;
var machinePath = __dirname + '/stockfish';

function Machine(depth) {
	this._depth = depth;
	this._machine = spawn(machinePath);
	bindEvents(this);
}

Machine.prototype = {
	setDepth(depth) {
		this._depth = depth;
	},

	move(pos) {
		runMachine(this, `position move ${pos}`);
	},

	fen(fen) {
		runMachine(this, `position fen ${fen}`);
	},

	destroy() {
		this._machine.stdin.end();
	}
}

function runMachine(obj, args) {
	var machine = obj._machine,
		depth = obj._depth;
	machine.stdin.write(`${args}\ngo depth ${depth}\n`);
}

function bindEvents(obj) {
	obj._machine.stdout.on('data', function(data) {
		data = data.toString();
		obj.emit('data', data);
		var moves = bestMove(data);
		if(moves) {
			obj.emit('moved', moves);
		}
	});
}

function bestMove() {
	var res = String(out);
	return res.match(/bestmove (\w+)/);
}

module.exports = Machine;