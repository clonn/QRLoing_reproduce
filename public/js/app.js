/*************************************
//
// qrloing-reproduce app
//
**************************************/

// connect to our socket server
var socket = io.connect();

var app = app || {};


// shortcut for document.ready
$(function(){
	
	$.get('/qr_sso_code', function (result) {
		// var result = JSON.parse(data);
		var url = result.response;
		$('#qrcode-scan').qrcode({
			render	: "table",
			text	: url
		});
		socket.emit("register", {code: result.code});
	});
	
	//SOCKET STUFF
	socket.on("login", function(data){
		var result = data;
		var _code = result.code;

		alert('login success:' + _code);
		window.location.href = '/';
	});
	
});