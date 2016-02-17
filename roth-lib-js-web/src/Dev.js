

roth.lib.js.web.Dev = function()
{
	this.service = (function()
	{
		var service = {};
		var url = "dev/service.json";
		var success = function(data)
		{
			service = data;
		};
		$.ajax(
		{
			url : url,
			dataType : "json",
			cache : false,
			async : false,
			success : success
		});
		return service;
	})
	();
	
};


roth.lib.js.web.Dev.prototype.getResponseScenarios = function(service, method)
{
	var scenarios = [];
	if(isObject(this.service) && isObject(this.service[service]) && isObject(this.service[service][method]) && isArray(this.service[service][method].response))
	{
		scenarios = this.service[service][method].response;
	}
	return scenarios;
};