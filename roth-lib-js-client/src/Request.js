
roth.lib.js.client.Request = roth.lib.js.client.Request || function()
{
	var State =
	{
		NEXT 	: "next",
		REPLACE : "replace",
		BACK 	: "back"
	};
	
	this.hash = null;
	this.lang = null;
	this.layout = null;
	this.module = null;
	this.page = null;
	this.params = {};
	
	this.defaultModule = "index";
	this.defaultPage = "index";	
	this.langStorage = "lang";
	this.state = null;
	this.loaded = {};
	
	this.newHash = false;
	this.newLang = false;
	this.newLayout = false;
	this.newModule = false;
	this.newPage = false;
	
	this.hasParam = function(name)
	{
		return isSet(this.params[name]);
	};
	
	this.getParam = function(name, defaultValue)
	{
		var param = this.params[name];
		return isValidString(param) ? param : defaultValue;
	};
	
	this.getModule = function()
	{
		return isSet(this.module) ? this.module : this.defaultModule;
	};
	
	this.getPage = function()
	{
		return isSet(this.page) ? this.page : this.defaultPage;
	};
	
	this.setHash = function(hash)
	{
		this.hash = hash;
		this.newHash = this.hash != this.loaded.hash;
	};
	
	this.setLang = function(lang)
	{
		this.lang = lang;
		this.newLang = this.lang != this.loaded.lang;
	};
	
	this.setLayout = function(layout)
	{
		this.layout = layout;
		this.newLayout = this.layout != this.loaded.layout;
	};
	
	this.setModule = function(module)
	{
		this.module = module;
		this.newModule = this.module != this.loaded.module;
	};
	
	this.setPage = function(page)
	{
		this.page = page;
		this.newPage = this.newModule || this.page != this.loaded.page;
	};
	
	this.isNext = function()
	{
		return this.state == State.NEXT;
	};
	
	this.isBack = function()
	{
		return this.state == State.BACK;
	};
	
	this.isReplace = function()
	{
		return this.state == State.REPLACE || isNull(this.state);
	};
	
	this.back = function()
	{
		this.state = State.BACK;
		window.history.back();
	};
	
	this.next = function(module, page, params)
	{
		//this.state = State.NEXT;
		this.state = State.REPLACE;
		window.location.assign(this.buildHash(module, page, params));
	};
	
	this.replace = function(module, page, params)
	{
		this.state = State.REPLACE;
		window.location.replace(this.buildHash(module, page, params));
	};
	
	this.refresh = function()
	{
		this.state = State.REPLACE;
		window.location.replace(this.buildHash(this.module, this.page, this.params));
	};
	
	this.reload = function()
	{
		window.location.reload();
	};
	
	this.buildHash = function(module, page, params)
	{
		var hash = "#";
		if(isValidString(module))
		{
			hash += "/" + module + "/";
			if(isValidString(page))
			{
				hash += page + "/";
				if(isObject(params))
				{
					for(var name in params)
					{
						hash += encodeURIComponent(name) + "/" + encodeURIComponent(params[name]) + "/";
					}
				}
			}
		}
		return hash;
	};
	
	this.parse = function()
	{
		var hash = "#/";
		var lang = null;
		var i = 1;
		var values = window.location.hash.split("/");
		if(isValid(values[i]))
		{
			if(values[i].length == 2)
			{
				this.lang = null;
				lang = values[i];
				hash += values[i] + "/";
				i++;
			}
		}
		if(isValid(values[i]))
		{
			this.setModule(values[i]);
			hash += values[i] + "/";
			i++;
		}
		if(isValid(values[i]))
		{
			this.setPage(values[i]);
			hash += values[i] + "/";
			i++;
		}
		this.params = {};
		var name = null;
		for(i; i < values.length; i++)
		{
			if(isValid(values[i]))
			{
				if(name === null)
				{
					name = values[i];
				}
				else
				{
					this.params[name] = decodeURIComponent(values[i]);
					hash += name + "/";
					hash += values[i] + "/";
					name = null;
				}
			}
		}
		var blankHash = window.location.hash == "" || window.location.hash == "#";
		if(!blankHash && window.location.hash != hash)
		{
			window.location.replace(hash);
			return false;
		}
		else if(isSet(lang))
		{
			localStorage.setItem(this.langStorage, lang);
			this.refresh();
			return false;
		}
		else
		{
			this.setHash(window.location.hash);
			this.newLang = false;
			return true;
		}
	};
	
	this.log = function()
	{
		console.groupEnd();
		var group = "";
		group += this.lang + " / ";
		group += this.getModule() + " / ";
		group += this.getPage() + " / ";
		console.group(group + JSON.stringify(this.params));
	};
	
	this.cloneParams = function()
	{
		return $.extend({}, this.params);;
	}
	
	this.cloneLoadedParams = function()
	{
		return isSet(this.loaded.params) ? $.extend({}, this.loaded.params) : {};
	}
	
	this.loadParams = function()
	{
		this.loaded.params = this.params;
	};
	
};
