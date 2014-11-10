var underscore = require('underscore');

// This should not be here
function Trendline() {
	this.finalCategory = "";
	this.initialValue = 0.0;
	this.initialCategory = "";
	this.finalValue = 0.0;
	this.lineColor = "#CC0000";
}

function computeTrendline(sprints) {
	var trendline = new Trendline();
	
	if(!underscore.isEmpty(sprints)) {
		// Finding first sprint
		var jiraSprint = underscore.first(sprints);
		trendline.initialValue = jiraSprint.storyPoints;
		trendline.initialCategory = jiraSprint.sprintNo;
		
		// Finding last sprint
		jiraSprint = underscore.last(sprints);
		trendline.finalValue = jiraSprint.storyPoints;
		trendline.finalCategory = jiraSprint.sprintNo;
	}
	
	return trendline;
};

module.exports = {
	getData: function(json) {
		if (json != null) {
			var sprints = JSON.parse(json);
			trendline = computeTrendline(sprints);
			json = { data: sprints, trendline: trendline };
		}
		return json;
	}
};