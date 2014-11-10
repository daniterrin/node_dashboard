var config = require('../config');
var request = require('request');

// load configuration
try {
	var urlJiraDefault = config.jira.default;
	var urlJira = config.jira.url;
	var sprintsField = '';
	if(typeof(config.jira.params) != 'undefined') {
		urlJira += config.jira.params.query;
		sprintsField = config.jira.params.sprints;
	}
}
catch(e) {
	console.log(e);
	throw "Configuration not valid";
}

function buildURL(useDefault, sprints) {
	var url = urlJiraDefault;
	
	if (!useDefault) {
		url = '+AND+' + sprintsField + '+in+%28';
		for(var i = 0; i<sprints.length; i++) {
			url += '%22' + sprints[i] + '%22%2C';
		}
		url = url.substr(0,(url.length - 3)) + '%29';
		url = urlJira + url;
	} 
	return url;
}

module.exports = { 
	get: function(useDefault, sprints, callback) {
		var url = buildURL(useDefault, sprints)
		request.get( url, {strictSSL: false}, function(err, response, body){
			callback(body);
		});
	}
};

