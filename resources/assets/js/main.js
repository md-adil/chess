
window.$ = window.jQuery = require('jquery');
require('bootstrap-sass');
require('jquery-ui-dist/jquery-ui');
require('bootstrap-material-design');
require('jquery.cookie');
var noUiSlider = require('nouislider');
require('./jquery.line');

require('./jquery.scrollbar');
require('./widget-window');

import './app';
import './notify';
import './user-account';
// import './ripples';


$.material.init();

var slider = $('#c-100').get(0);
if(slider) {
	noUiSlider.create(slider, {
	  start: 4,
	  range: {
	    min: 1,
	    max: 18
	  }
	}).on('update', function(val) {
		$('#c-101').text(parseInt(val));
	});
}
