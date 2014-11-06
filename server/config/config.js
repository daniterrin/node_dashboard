var config = {};

config.jira = {};
config.jira.default = "https://jira.redtonic/sr/jira.issueviews:searchrequest-xml/20105/SearchRequest-20105.xml?field=fixfor&field=customfield_10092"
config.jira.url = "https://jira.redtonic/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml"
config.jira.params = {};

config.jira.params.query = "?field=fixfor&field=customfield_10092&jqlQuery=project+%3D+AFF+AND+fixVersion+not+in+unreleasedVersions()+AND+issuetype+in+%28%22Quick+Request%22%2C+%22User+Story%22%2C+Bug%2C+Task%29";
config.jira.params.sprints = "fixVersion";

module.exports = config;