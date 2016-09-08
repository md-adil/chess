import _ from 'lodash'
require('jquery.cookie');

export function setting(key, val) {
	var settings = getSettingsCookie();
	if(val !== undefined) {
		_.set(settings, key, val);
		setSettingsCookie(settings);
	} else {
		return _.get(settings, key);
	}
}

function getSettingsCookie() {
	return JSON.parse(
		$.cookie('settings') || "{}"
	);
}

function setSettingsCookie(settings) {
	console.log(settings);
	$.cookie('settings', JSON.stringify(settings), { expires: 102400, path: '/' });
}