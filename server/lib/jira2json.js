var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var underscore = require('underscore');

var sprints = [];
var lastSprints = false;

function JiraItem(id, sprint, storyPoints) {
	// Properties
	this.id = id;
	this.sprint = sprint;
	this.storyPoints = storyPoints;
};

function JiraSprint(sprint) {
	// Properties
	this.sprint = sprint;
	this.storyPoints = 0.0;
	this.items = [];
	
	var index = sprint.indexOf(" ");
	this.sprintNo = parseFloat(sprint.substr(index+1));
	
};

// This should not be here
function Trendline() {
	this.finalCategory = "";
	this.initialValue = 0.0;
	this.initialCategory = "";
	this.finalValue = 0.0;
	this.lineColor = "#CC0000";
}

JiraSprint.prototype.addItem = function(obj) {
	var self = this;
	
	if (obj instanceof JiraItem) {
		self.items.push(obj);
		self.storyPoints += obj.storyPoints;
	}
}

function Velocity() { 
	// Constants
	// XPath
	this.XPATH_KEY_ITEMS = "//item";
	this.XPATH_KEY_ID = "//key/text()";
	this.XPATH_KEY_SPRINT = "//fixVersion[last()]/text()";
	this.XPATH_KEY_STORY_POINTS = "//customfield[@id='customfield_10092']/customfieldvalues[last()]/customfieldvalue/text()";
	
	// Properties
	this.sprints = [];
	this.trendline = new Trendline();
}

Velocity.prototype.computeSprints = function(obj) {
    var self = this;
    
	if (obj instanceof Buffer) {
        obj = obj.toString();
    }
	var doc = new dom().parseFromString(obj);

	var len = Object.keys(xpath.select("//item", doc)).length;
	for (var i = 1; i <= len; i++) {
        
		var itemXPath = self.XPATH_KEY_ITEMS + "[" + i + "]";
		
		id = xpath.select1(itemXPath + self.XPATH_KEY_ID, doc).nodeValue;
		sprint = xpath.select1(itemXPath + self.XPATH_KEY_SPRINT, doc).nodeValue;
		
		if (sprints.length == 0 || underscore.contains(sprints,sprint)) {
			storyPoints = xpath.select1(itemXPath + self.XPATH_KEY_STORY_POINTS, doc);
			if(typeof(storyPoints) != "undefined") {
				storyPoints = storyPoints.nodeValue;
			} else {
				storyPoints = 0.0;
			}
			storyPoints = parseFloat(storyPoints);
		
			var item = new JiraItem(id, sprint, storyPoints);
			self.addItemToSprints(item, sprint);
		}
    }
	
	if (lastSprints) {
		self.sprints = underscore.last(self.sprints, 3);
	}
	self.computeTrendline();
};

Velocity.prototype.addItemToSprints = function(jiraItem, sprintStr) {
	var self = this;
	
	if (jiraItem instanceof JiraItem) {
		var sprintObj = underscore.findWhere(self.sprints, {sprint:sprintStr});
		if (underscore.isEmpty(sprintObj)) {
			sprintObj = new JiraSprint(sprintStr)
			var index = underscore.sortedIndex(self.sprints, sprintObj, 'sprintNo');
			self.sprints.splice(index, 0, sprintObj);
		}
		sprintObj.addItem(jiraItem);
	}
};

Velocity.prototype.toJson = function() {
	var self = this;
	var data = { data: self.sprints, trendline: self.trendline };
	return JSON.stringify(data);
};

Velocity.prototype.computeTrendline = function() {
	var self = this;
	
	if(!underscore.isEmpty(self.sprints)) {
		// Finding first sprint
		var jiraSprint = underscore.first(self.sprints);
		self.trendline.initialValue = jiraSprint.storyPoints;
		self.trendline.initialCategory = jiraSprint.sprint;
		
		// Finding last sprint
		jiraSprint = underscore.last(self.sprints);
		self.trendline.finalValue = jiraSprint.storyPoints;
		self.trendline.finalCategory = jiraSprint.sprint;
	}
};

module.exports = function(xml, _options) {
    var json = null;
	
    if(_options != null) {
        sprints = _options.sprints;
		lastSprints = _options.lastSprints;
    }
	
	if (xml != null) {
		var velocity = new Velocity();
		velocity.computeSprints(xml);
		json = velocity.toJson();
    }
    return json;
};

var exports = module.exports;
exports.toJson = require('./jira2json');