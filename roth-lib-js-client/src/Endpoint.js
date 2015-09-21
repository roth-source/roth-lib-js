
roth.lib.js.client.Endpoint = roth.lib.js.client.Endpoint || function()
{
	this.currentStorage = null;
	this.availableStorage = null;
	
	this.set = function(endpoints)
	{
		if(isArray(endpoints) && endpoints.length > 0)
		{
			sessionStorage.setItem(this.currentStorage, endpoints.shift());
			sessionStorage.setItem(this.availableStorage, JSON.stringify(endpoints));
			/*
			if(endpoints.length > 0)
			{
				sessionStorage.setItem(this.availableStorage, JSON.stringify(endpoints));
			}
			else
			{
				sessionStorage.removeItem(this.availableStorage);
			}
			*/
			return true;
		}
		else
		{
			return false;
		}
	};
	
	this.next = function()
	{
		sessionStorage.removeItem(this.currentStorage);
		return this.set(this.available());
	};
	
	this.clear = function()
	{
		sessionStorage.removeItem(this.currentStorage);
		sessionStorage.removeItem(this.availableStorage);
	};
	
	this.available = function()
	{
		var available = sessionStorage.getItem(this.availableStorage);
		return isValidString ? JSON.parse(available) : [];
	};
	
	this.current = function()
	{
		var current = sessionStorage.getItem(this.currentStorage);
		return current;
	};
	
};



