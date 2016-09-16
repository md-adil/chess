var _ = require('lodash');
var Machine = require('./machine');
var List = {};
var EventEmitter = require('events');
var util = require('util');

function Client(id) {
	EventEmitter.EventEmitter.call(this);
	if(List[id]) {
		throw new TypeError('Player already exists');
	}
	List[id] = this;
	this._id = id;
	this._connected = null;
}

Client.prototype = {
	constructor: Client,

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
			this._connected.destroy();
		} else {
			this.emit('destroyed', this);
		}
		return true;
	},

	connectMachine(depth) {
		return this._connected = new Machine(depth);
	},

	connect(con) {
		this._connected = Client.find(con);
		this._connected._connected = this;
		return this._connected;
	},
	
	move(pos) {
		console.log('moving');
		if(this.isMachine) {
			this._connected.move(pos);
		} else {
			this.emit('moved');
		}
		return this;
	},

	setHeader(header) {
		this._headers = header;
	},

	getHeader() {
		return this._headers;
	},

	isMachine() {
		return this._connected instanceof Machine;
	},

	isConnected() {
		return this._connected ? true : false;
	},

	socket() {
		return this.constructor._io.sockets.connected[this._id];
	},

	connected() {
		return this._connected;
	}
}

util.inherits(Client, EventEmitter);

Client.find = function(id) {
	return List[id];
}

Client.io = function(io) {
	if(io) {
		Client._io = io;
	}
	return Client._io;
}

Client.exists = function(id) {
	if(List[id]) {
		return true;
	}
	return false;
}

module.exports = Client;