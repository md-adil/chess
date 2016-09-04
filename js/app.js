(function() {
var connListEl = $('#connection-list');
var gameBoardEl = $('#game-board');
var loginEl = $('#login');
var currentClientId;
$('#form-login').submit(function(e) {
	e.preventDefault();
	var name = $('#person-name').val();
	var country = $('#person-country').val();
	// name = 'Adil';country = 'India';
	if(!name || !country) {
		alert("Please provide your name and country");
		return;
	}

	var socket = connect({
		name: name,
		country: country
	});

	loginEl.fadeOut(renderBoard.bind(socket));
});

function connect(person) {
	var socket = io.connect("http://192.168.1.32:8000");
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
		socket.emit('selecting-client', person);
	});

	socket.on('selected-client', function(person) {
		if(confirm(person.name + ' wants to play with you. Are you agree?')) {
			currentClientId = person.id;
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

var toggleMoveEvent = false;

function renderBoard() {
	gameBoardEl.show();
	var socket = this;
	var board = ChessBoard('board', {
		draggable: true,
		position: 'start',
		dropOffBoard: 'spapback',
		onDragStart: function() {
			toggleMoveEvent = false;
			if(!currentClientId) {
				alert("Please choose a client or wait for...");
				return false;
			}
		},
		
		onChange: function(oldPos, newPos) {
			if(toggleMoveEvent) return;
			var fen = ChessBoard.objToFen(newPos);
			console.log("Current fen", fen);
			socket.emit('moving', {
				personId: currentClientId,
				fen: fen
			});
		}
	});

	$('#reset').click(function() {
		board.position('start');
	});

	socket.on('moved', function(pos) {
		if(currentClientId == 'machine') {
			var move = stToch(pos.moves);
			console.log("Moving to ", move);
			toggleMoveEvent = true;
			board.move(move);
		} else {
			board.position(pos.fen);
		}
	});

	function stToch(str) {
		return str.substr(0,2) + '-' + str.substr(2);
	}
}
})();
