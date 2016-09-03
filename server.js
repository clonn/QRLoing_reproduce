/*************************************
//
// qrloing-reproduce app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var device  = require('express-device');

var runningPortNumber = process.env.PORT || 1337;
var domain = process.env.DOMAIN || 'http://localhost';
if (domain.indexOf('herokuapp') < 0)
	domain = domain + ':' + runningPortNumber;
var sso_id = {};


app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});


// logs every request
app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});

	// goes onto the next function in line
	next();
});

app.get("/", function(req, res){
	res.render('index', {});
});
app.get("/qrlogin", function(req, res){
	res.render('qrlogin', {});
});
app.get("/qr_sso_code", function(req, res) {
	var _code = new Date().valueOf();
	sso_id[_code] = true;
	res.json({
		status: 'ok',
		code: _code,
		response: domain + '/qrlogin/' + _code
	});
});


io.sockets.on('connection', function (socket) {

	app.get("/qrlogin/:logincode", function(req, res) {
		var _loginCode = req.params['logincode'];
		// response for mobile view, after mobile scan qrcode and link to page.
		res.json({status: 'ok', response: 'logined - ' + _loginCode});
		
		// if not find user, skip this login.
		if ( ! sso_id[_loginCode]) {
			return;			
		}

		// get qrcode login user id;
		var _socket = sso_id[_loginCode];
		// trigger login event;
		return _socket.emit('login', {
			msg:"logined",
			code: _loginCode,
			response: domain + '/user/' + _loginCode
		});
	});

	socket.on('register', function(data){
		if (sso_id[data.code]) {
			console.log(sso_id[data.code]);
			sso_id[data.code] = socket;
		}
	});

});


server.listen(runningPortNumber);

