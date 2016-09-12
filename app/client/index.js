var _ = require('lodash');
var Machine = require('./machine');
var List = {};
var EventEmitter = require('events');
var util = require('util');

function Client(id) {
	if(List[id]) {
		throw new TypeError('Player already exists');
	}
	List[id] = this;
	this.id = id;
	this.connectedTo = null;
}

Client.prototype = {
	setting(key, val) {
		if(key === undefined) return this._settings;
		if(val === undefined) {
			return _.get(this, `_settings.${key}`);
		}
		_.set(this, `_settings.${key}`, val);
	},

	destroy() {
		if(!this.isConnected()) return false;
		if(this.isMachine()) {
			this.connectedTo.destroy();
		} else {
			this.connectedTo.emit('destroyed', this);
		}
		return true;
	},

	connectMachine(depth) {
		return this.connectedTo = new Machine(depth);
	},

	connect(con, depth) {
		this.connectedTo = Client.find(con);
		this.connectedTo.connectedTo = this;
		return this.connectedTo;
	},
	
	move(pos, emit) {
		if(!this.isConnected()) return false;
		if(this.isMachine()) {
			var that = this;
			this.connectedTo.fen(pos);
			this.connectedTo.on('moved', function() {
				that.emit('moved');
			})
		} else {
			this.connectedTo.move(pos, true);
			if(emit) {
				this.emit('moved', pos);
			}
		}
		return true;
	},

	isMachine() {
		return this.connectedTo instanceof Machine;
	},

	isConnected() {
		return this.connectedTo ? true : false;
	}

}

util.inherits(Client, EventEmitter);

Client.find = function(id) {
	return List[id];
}

Client.exists = function(id) {
	if(List[id]) {
		return true;
	}
	return false;
}

module.exports = Client;