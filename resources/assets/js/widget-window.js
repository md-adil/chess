import {setting} from './tools';
import _ from 'lodash';
import $ from 'jquery';

$('.window > .resizable').resizable({
	autoHide: true,
	minWidth: 200,
	stop: on_resizeStop
});

$('.window .scrollable').scrollbar();

$('.window.draggable').draggable({
	handle: ".panel-heading",
	stop: on_dragStop
});

var btnClose = $('<a />', {
	html: "&times;",
	class:'close'
}).click(function(e) {
	e.preventDefault();
	$(this).parents('.window').fadeOut(100);
});

var btnMinimize = $('<a />', {
	html: "&minus;",
	class: "minimize"
});

function on_dragStop(e, ui) {
	var id = $(this).attr('id');
	setting(`window.${id}.position`, ui.position);
}

function on_resizeStop(e, ui) {
	var id = $(this).parents('.window').attr('id');
	setting(`window.${id}.size`, ui.size);	
}

$('.window.closable').find('.panel-title').append(btnClose);
$('.window.minizable').find('.panel-title').append(btnMinimize);

// Adding default position to widget windows
_.each(setting('window'), function(set, id) {
	var $el = $(`#${id}.window`);
	if(!$el.length) return;
	if(set.position) {
		$el.css(set.position);
	}
	if(set.size) {
		$el.children('.resizable').css(set.size);
	}
});

$('[data-toggle="float-widget"]').click(function() {
	var el = $(this).data('target');
	$(el).slideToggle();
});

$('[data-toggle="window"]').click(function() {
	var el = $(this).data('target');
	$(el).fadeIn(100);
});
