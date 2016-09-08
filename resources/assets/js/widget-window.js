import {setting} from './tools';
import _ from 'lodash';

$('.ww.resizable').resizable({
	autoHide: true,
	minWidth: 200,
});

$('.ww.draggable').draggable({
	handle: ".panel-heading",
	stop: on_dragStop
});

var btnClose = $('<a />', {
	html: "&times;",
	class:'close'
}).click(function(e) {
	e.preventDefault();
	$(this).parents('.ww').fadeOut(100);
});

var btnMinimize = $('<a />', {
	html: "&minus;",
	class: "minimize"
});

function on_dragStop(e, ui) {
	var id = $(this).attr('id');
	setting(`ww.${id}.position`, ui.position);
}

$('.ww.closable').find('.panel-title').append(btnClose);
$('.ww.minizable').find('.panel-title').append(btnMinimize);

// Adding default position to widget windows
_.each(setting('ww'), function(set, id) {
	if(set.position) {
		$(`#${id}.ww`).css(set.position);
	}
});