import $ from 'jquery';
import {renderBoard} from './game';

function connect(person) {
	var socket = io.connect("http://localhost:3000");
	bindConnections(socket);
	renderBoard();
	return socket;
}

function bindConnections(socket) {
	socket.on('server/client/new', newClient);
	socket.on('server/client/joining', joiningClient);
	socket.on('server/client/joined', joinedClient);
	socket.on('server/client/disconnect', disconnectClient);

}

function newClient() {

}

function joiningClient() {

}

function joinedClient() {

}


function disconnectClient() {

}

function nothing() {
	$('#name').text(person.name);
	
	socket.emit('joining-client', person);

	socket.on('client-joined', function(joining) {
		person.id = joining.id;
		listClients(joining.players);
	});
	
	$(document).on('click', '.select-client', function(e) {
		e.preventDefault();
		if($(this).parent().hasClass('active')) return;
		$(this).parent().addClass('active').siblings().removeClass('active');
		var id = $(this).attr('href');
		currentClientId = id;
		person.clientId = id;
		turn = 'w';
		socket.emit('selecting-client', person);
	});

	socket.on('selected-client', function(person) {
		if(confirm(person.name + ' wants to play with you. Are you agree?')) {
			currentClientId = person.id;
			turn = 'b';
			board.orientation('black');
			$(`a[href="${person.id}"]`).parent().addClass('active').siblings().removeClass('active');
		}
	});

	socket.on('new_client', function(newPerson) {
		if(newPerson.id != person.id) newClient(newPerson);
	});

	socket.on('client_disconnected', removeClient);
	var broadcastEl = $('#broadcast');
	socket.on('live-broadcast', function(i, d) {
		console.log(i);
		broadcastEl.append(d);
	});

	return socket;
}


export default connect;
