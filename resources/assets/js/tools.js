import _ from 'lodash'
import $ from 'jquery';
require('jquery.cookie');

var _settings = JSON.parse(
	$.cookie('settings') || "{}"
);

export function setting(key, val) {
	if(key == undefined) return _settings;
	if(val == undefined) return _.get(_settings, key);
	_.set(_settings, key, val);
	return _settings;
}

$( window ).on('beforeunload', function() {
	$.cookie('settings', JSON.stringify(_settings), {
		expires: 1122
	});
});
