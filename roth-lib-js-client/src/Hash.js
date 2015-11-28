
roth.lib.js.client.Hash = roth.lib.js.client.Hash || function()
{
	var State =
	{
		NEXT 	: "next",
		REPLACE : "replace",
		BACK 	: "back"
	};
	
	this.value = null;
	this.lang = null;
	this.layout = null;
	this.module = null;
	this.page = null;
	this.param = {};
	this.search = null;
	this.context = null;
	
	this.defaultModule = "index";
	this.defaultPage = "index";	
	this.langStorage = "lang";
	this.state = null;
	this.loaded = {};
	
	this.newValue = false;
	this.newLang = false;
	this.newLayout = false;
	this.newModule = false;
	this.newPage = false;
	
	this.hasParam = function(name)
	{
		return isSet(this.param[name]);
	};
	
	this.getParam = function(name, defaultValue)
	{
		var value = this.param[name];
		return isValidString(value) ? value : defaultValue;
	};
	
	this.getParamSize = function()
	{
		return Object.keys(this.param).length;
	};
	
	this.isParamEmpty = function()
	{
		return this.getParamSize() == 0;
	};
	
	this.getModule = function()
	{
		return isSet(this.module) ? this.module : this.defaultModule;
	};
	
	this.getPage = function()
	{
		return isSet(this.page) ? this.page : this.defaultPage;
	};
	
	this.setValue = function(value)
	{
		this.value = value;
		this.newValue = this.value != this.loaded.value;
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
	
	this.isNewValue = function()
	{
		return this.newValu;
	}
	
	this.isNewLang = function()
	{
		return this.newLang;
	}
	
	this.isNewLayout = function()
	{
		return this.newLayout;
	}
	
	this.isNewModule = function()
	{
		return this.newModule;
	}
	
	this.isNewPage = function()
	{
		return this.newPage;
	}
	
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
	
	this.changeLang = function(lang)
	{
		this.setLang(lang);
		this.reload();
	};
	
	this.back = function()
	{
		this.state = State.BACK;
		window.history.back();
	};
	
	this.next = function(module, page, param)
	{
		this.state = State.NEXT;
		if(!isValidString(page))
		{
			window.location.assign(module);
		}
		else
		{
			window.location.assign(this.build(module, page, param));
		}
	};
	
	this.replace = function(module, page, param)
	{
		this.state = State.REPLACE;
		if(!isValidString(page))
		{
			window.location.replace(module);
		}
		else
		{
			window.location.replace(this.build(module, page, param));
		}
	};
	
	this.refresh = function()
	{
		this.state = State.REPLACE;
		window.location.replace(this.build(this.module, this.page, this.param));
	};
	
	this.reload = function()
	{
		window.location.reload();
	};
	
	this.build = function(module, page, param)
	{
		var hash = "#";
		if(isValidString(module))
		{
			hash += "/" + module + "/";
			if(isValidString(page))
			{
				hash += page + "/";
				param = isObject(param) ? param : this.param;
				for(var name in param)
				{
					hash += encodeURIComponent(name) + "/" + encodeURIComponent(param[name]) + "/";
				}
			}
		}
		return hash;
	};
	
	this.isValid = function()
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
		this.param = {};
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
					this.param[name] = decodeURIComponent(values[i]);
					hash += name + "/";
					hash += values[i] + "/";
					name = null;
				}
			}
		}
		if(isNull(this.search))
		{
			this.search = {};
			var nameValues = window.location.search.substr(1).split("&");
			for(var i = 0; i < nameValues.length; i++)
			{
				var nameValue = nameValues[i].split("=", 2);
				if(nameValue.length == 2)
				{
					var name = nameValue[0];
					var value = nameValue[1];
					this.search[name] = decodeURIComponent(value.replace(/\+/g, " "));
				}
			}
		}
		if(isNull(this.context))
		{
			this.context = getContext();
			if(isNull(this.context))
			{
				if(isSet(this.search.context))
				{
					this.context = this.search.context;
				}
				if(isNull(this.context))
				{
					if(isHyperTextProtocol())
					{
						var path = window.location.pathname.substr(1);
						var index = path.lastIndexOf("/");
						if(index > -1)
						{
							path = path.slice(0, index);
						}
						this.context = path;
					}
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
			this.setValue(window.location.hash);
			this.newLang = false;
			return true;
		}
	};
	
	this.loadedParam = function()
	{
		this.loaded.param = this.param;
	};
	
	this.loadedValue = function(value)
	{
		this.loaded.value = isSet(value) ? value : this.value;
	};
	
	this.loadedLang = function(lang)
	{
		this.loaded.lang = isSet(lang) ? lang : this.lang;
	};
	
	this.loadedLayout = function(layout)
	{
		this.loaded.layout = layout;
	};
	
	this.loadedModule = function(module)
	{
		this.loaded.module = module;
	};
	
	this.loadedPage = function(page)
	{
		this.loaded.page = page;
	};
	
	this.log = function()
	{
		console.groupEnd();
		var group = "";
		group += this.lang + " / ";
		group += this.getModule() + " / ";
		group += this.getPage() + " / ";
		console.group(group + JSON.stringify(this.param));
	};
	
	this.cloneParam = function()
	{
		return $.extend({}, this.param);;
	}
	
	this.cloneLoadedParam = function()
	{
		return isSet(this.loaded.param) ? $.extend({}, this.loaded.param) : {};
	}
	
};



