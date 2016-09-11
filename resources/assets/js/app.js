import $ from 'jquery';
import renderBoard from './game';

var socket, connListEl, loginEl, board;
connListEl = $('#connection-list');
loginEl = $('#login');

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

