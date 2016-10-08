var $ = require('jquery');
var noUiSlider = require('nouislider');
$.fn.noUiSlider = function(options) {
	return this.each(function() {
		return noUiSlider.create(this, options);
	});
}
