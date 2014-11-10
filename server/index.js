var parser = require('./lib/jira2json');
var handler = require('./lib/jiraHandler');
var express = require('express');
var fs = require('fs');
var path = require( 'path' );

var app = express();
app.use( express.static( __dirname + '/../client/public' ) );

app.get('/', function (req, res) {
	res.set('Content-Type', 'text/html');
	fs.createReadStream( path.join( __dirname, '..', 'client', 'index.html' ) ).pipe( res );
});

app.get('/large', function (req, res) {
	res.set('Content-Type', 'text/html');
	fs.createReadStream( path.join( __dirname, '..', 'client', 'index_xl.html' ) ).pipe( res );
});

app.get('/data/jira', function (req, res, next) {
	try {
		var sprints = [];
		if (typeof(req.query.versions) != "undefined") {
			sprints = req.query.versions.split(',');
		}
		app.set('useDefault',false);
		app.set('sprints', sprints);
		next();
	} catch(e) {
		res.send(JSON.stringify({ "error": e }));
	}
})

app.get('/data/jiraDefault', function (req, res, next) {
	try {
		app.set('useDefault',true);
		app.set('sprints', []);
		next();
	} catch(e) {
		res.send(JSON.stringify({ "error": e }));
	}
})

app.use('/data/jira*', function (req, res, next) {
	res.set('Content-Type', 'text/json');
	try {
		var useDefault = app.get('useDefault');
		var sprints = app.get('sprints');
		handler.get(useDefault, sprints, function(body) {
			var options = { sprints: sprints, lastSprints: useDefault };
			var json = parser.toJson(body, options)
			res.send(json);
		});
	} catch(e) {
		res.send(JSON.stringify({ "error": e }));
	}
})

module.exports = app;
