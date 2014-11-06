var DATA_NOT_FOUND_STATUS = { message: '<b>No data was found for these sprints</b>', className: 'alert alert-warning', hide: false };
var ERROR_STATUS = { message: '<b>No data was found for these sprints</b>', className: 'alert alert-danger', hide: false };
var LOADING_STATUS = { message: '<b>Attention!</b> chart is loading...you might want a coffee', className: 'alert alert-info', hide: false };
var HIDE_STATUS = { message: '', className: '', hide: true };

function loadData() {
	var sprints = document.getElementById('sprints');
	var jiraURL = "data/jiraDefault";
	if(sprints != null && sprints.value != "") {
		jiraURL = "data/jira?versions=" + sprints.value
	}
	$.getJSON(jiraURL,function(resp){
		processResponse(resp);
	});
	setLoadingStatus(LOADING_STATUS);
}

function processResponse(resp) {
	dataProvider = [];
	trendLines = [];
	var status = null;
	
	if (typeof(resp.error) == "undefined") {
		if (resp.data.length > 0) {
			dataProvider = resp.data;
			trendLines = [resp.trendline];
			status = HIDE_STATUS;
		} else {
			status = DATA_NOT_FOUND_STATUS;
		}
	}
	else {
		status = ERROR_STATUS;
	}
	drawChart(dataProvider, trendLines);
	setLoadingStatus(status);
}

function drawChart(dataProvider, trendLines) {
	AmCharts.makeChart("chartdiv", {
		"type": "serial",
		"theme": "light",
		"autoMargins": false,
		"marginLeft":30,
		"marginRight":8,
		"marginTop":10,
		"marginBottom":26,
		"handDrawn": true,
				
		"valueAxes": [{
			"axisAlpha": 0,
			"position": "left",
			"minimum": 0
		}],
		"startDuration": 1,
		"graphs": [{
			"fillAlphas": 1,
			"title": "storyPoints",
			"type": "column",
			"valueField": "storyPoints"
		}],
		"categoryField": "sprintNo",
		"categoryAxis": {
			"gridPosition": "start",
			"axisAlpha":0,
			"tickLength":0
		},
		"dataProvider": dataProvider,
		"trendLines": trendLines
	});	
}

function setLoadingStatus(status) {
	
	var loading = document.getElementById('loading');
	
	if (loading != null) {
		loading.innerHTML = status.message;
		loading.className = status.className;
		loading.hidden = status.hide;
	}
}

// Main
loadData();
