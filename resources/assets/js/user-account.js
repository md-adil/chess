import $ from 'jquery';
import connect from './connection';

$('#form-login').submit(function(e) {
	e.preventDefault();

	var name = $('#person-name').val();
	var country = $('#person-country').val();
	// name = 'Adil';country = 'India';
	if(!name || !country) {
		alert("Please provide your name and country");
		return;
	}
	connect({
		name: name,
		country: country
	});
});
