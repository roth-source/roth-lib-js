
roth.js.client.Cache = roth.js.client.Cache || function()
{
	
	this.clear = function()
	{
		this.clearLayout();
		this.clearPage();
		this.clearResponse();
	};
	
	this.clearView = function()
	{
		this.clearLayout();
		this.clearPage();
	};
	
	this.clearLayout = function()
	{
		this.clearSession("cache-layout");
	};
	
	this.clearPage = function()
	{
		this.clearSession("cache-page");
	};
	
	this.clearResponse = function()
	{
		this.clearSession("cache-response");
	};
	
	this.clearSession = function(prefix)
	{
		for(var i = sessionStorage.length - 1; i >= 0; i--)
		{
			var key = sessionStorage.key(i);
			if(key.length >= prefix.length && key.slice(0, prefix.length) == prefix)
			{
				console.log("removing " + key);
				sessionStorage.removeItem(key);
			}
		}
	};
	
	this.setLayout = function(hash, element)
	{
		this.setView("layout", hash, element);
	};
	
	this.setPage = function(hash, element)
	{
		this.setView("page", hash, element);
	};
	
	this.setView = function(type, hash, element)
	{
		if(element.length > 0)
		{
			element.find("input[type!='button'][type!='submit'][type!='reset'][type!='checkbox'][type!='radio']").each(function()
			{
				var input = $(this);
				input.attr("value", input.val());
			});
			var html = element[0].innerHTML;
			sessionStorage.setItem("cache-" + type + hash, html);
		}
	};
	
	this.hasLayout = function(hash)
	{
		return isSet(sessionStorage.getItem("cache-layout" + hash));
	};
	
	this.hasPage = function(hash)
	{
		return isSet(sessionStorage.getItem("cache-page" + hash));
	};
	
	this.getLayout = function(hash)
	{
		return sessionStorage.getItem("cache-layout" + hash);
	};
	
	this.getPage = function(hash)
	{
		return sessionStorage.getItem("cache-page" + hash);
	};
	
};

