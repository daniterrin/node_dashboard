var config = require('./config');
var parser = require('./lib/jira2json');
var request = require( 'request' );
var express = require('express');
var underscore = require('underscore');
var fs = require('fs');
var path = require( 'path' );

// load configuration
try {
	var urlJiraDefault = config.jira.default;
	var urlJira = config.jira.url;
	var sprintFields = '';
	if(typeof(config.jira.params) != 'undefined') {
		urlJira += config.jira.params.query;
		sprintFields = config.jira.params.sprints;
	}
}
catch(e) {
	console.log(e);
	throw "Configuration not valid";
}

var app = express();
app.use( express.static( __dirname + '/../client/public' ) );

app.get('/', function (req, res) {
	res.set('Content-Type', 'text/html');
	fs.createReadStream( path.join( __dirname, '..', 'client', 'index.html' ) ).pipe( res );
});

app.get('/data/jira', function (req, res) {
	res.set('Content-Type', 'text/json');
	var json = null;

	try {
		var urlString = '';
		if (typeof(req.query.versions) != "undefined") {
			urlString = '+AND+' + sprintFields + '+in+%28';
			var sprints = req.query.versions.split(',');
			for(var i = 0; i<sprints.length; i++) {
				urlString += '%22' + sprints[i] + '%22%2C';
			}
			urlString = urlString.substr(0,(urlString.length - 3)) + '%29';
		}
		urlString = urlJira + urlString;
		console.log("JIRA call: " + urlString);
		request.get( urlString, {strictSSL: false}, function(err, response, body){
			var options = { sprints: sprints };
			var json = parser.toJson(body, options);
			res.send(json);
		});
	} catch(e) {
		json = { "error": e };
		res.send(JSON.stringify(json));
	}
})

app.get('/data/jiraDefault', function (req, res) {
	res.set('Content-Type', 'text/json');
	var json = null;

	try {
		console.log("JIRA call: " + urlJiraDefault);
		request.get( urlJiraDefault, {strictSSL: false}, function(err, response, body){
			var options = { sprints: [], lastSprints: true };
			var json = parser.toJson(body, options);
			res.send(json);
		});
	} catch(e) {
		json = { "error": e };
		res.send(JSON.stringify(json));
	}
})

module.exports = app;
