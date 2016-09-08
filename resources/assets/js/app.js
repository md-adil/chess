var socket, connListEl, loginEl, board;

connListEl = $('#connection-list');
loginEl = $('#login');

function connect(person) {
	var socket = io.connect("http://192.168.1.32:3000");
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

function listClients(clients) {
	// connListEl.empty();
	$.each(clients, function(id, person) {
		connListEl.append(
			`<li class="list-group-item">
				<a href="${id}" class="text-success select-client">
					${person.name}
				</a>
				<em class="pull-right">${person.country}</em>
			</li>`
		);
	});
}

function newClient(person) {
	connListEl.append(
		`<li class="list-group-item">
			<a href="${person.id}" class="text-success select-client">
				${person.name}
			</a>
			<em class="pull-right">${person.country}</em>
		</li>`
	);
	$.notify("New player added", "success");
}


function removeClient(person) {
	$(`#connection-list a[href="${person.id}"]`).parent().slideUp();
	if(currentClientId == person.id) {
		currentClientId = null;
		$.notify(`The player ${person.name}, you are playing with is no longer availabel, Choose other`, "error");
	} else {
		$.notify(person.name + " Disconnected", "info");
	}
}

