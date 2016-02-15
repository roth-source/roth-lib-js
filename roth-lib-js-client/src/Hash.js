

roth.lib.js.client.Hash = roth.lib.js.client.Hash || function()
{
	
	
	
	this.value = null;
	
	
	this.lang = null;
	
	
	this.layout = null;
	
	
	this.module = null;
	
	
	this.page = null;
	
	
	this.param = {};
	
	
	this.text = null;
	
	
	this.search = null;
	
	
	this.context = null;
	
	
	this.defaultModule = "index";
	
	
	this.defaultPage = "index";	
	
	
	this.langStorage = "lang";
	
	
	this.loaded = {};
	
	
	this.newValue = false;
	
	
	this.newLang = false;
	
	
	this.newLayout = false;
	
	
	this.newModule = false;
	
	
	this.newPage = false;
	
	
	this.newText = false;
	
	
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
	
	
	this.setText = function(text)
	{
		this.text = text;
		this.newText = this.text != this.loaded.text;
	};
	
	
	this.isNewValue = function()
	{
		return this.newValue;
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
	
	
	this.isNewText = function()
	{
		return this.newText;
	}
	
	
	this.changeLang = function(lang)
	{
		this.setLang(lang);
		this.refresh();
	};
	
	
	this.back = function()
	{
		window.history.back();
	};
	
	
	this.next = function(module, page, param)
	{
		if(isValidString(module) && !isValidString(page))
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
		if(isValidString(module) && !isValidString(page))
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
		window.location.replace(this.build(this.module, this.page, this.param));
	};
	
	
	this.reload = function()
	{
		window.location.reload();
	};
	
	
	this.change = function(changeParam, page, module)
	{
		var param = this.cloneParam();
		if(isObject(changeParam))
		{
			forEach(changeParam, function(value, name)
			{
				param[name] = value;
			});
		}
		if(!isValidString(page))
		{
			page = this.page;
		}
		if(!isValidString(module))
		{
			module = this.module;
		}
		return {
			module : module,
			page : page,
			param : param
		};
	};
	
	
	this.build = function(module, page, param)
	{
		if(isObject(module))
		{
			var change = this.change(module, page, param);
			module = change.module;
			page = change.page;
			param = change.param;
		}
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
					var value = param[name];
					if(isSet(value))
					{
						hash += encodeURIComponent(name) + "/";
						if(isArray(value))
						{
							hash += "[";
							var seperator = "";
							for(var i in value)
							{
								hash += seperator;
								hash += encodeURIComponent(value[i]);
								seperator = ",";
							}
							hash += "]/";
						}
						else
						{
							hash += encodeURIComponent(value) + "/";
						}
					}
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
					var value = decodeURIComponent(values[i]);
					var matches = value.match(/^\[(.*?)\]$/);
					if(isNotEmpty(matches))
					{
						this.param[name] = matches[1].split(",");
					}
					else
					{
						this.param[name] = value;
					}
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
	
	
	this.loadedValue = function()
	{
		this.loaded.value = this.value;
	};
	
	
	this.loadedLang = function()
	{
		this.loaded.lang = this.lang;
	};
	
	
	this.loadedLayout = function()
	{
		this.loaded.layout = this.layout;
	};
	
	
	this.loadedModule = function()
	{
		this.loaded.module = this.module;
	};
	
	
	this.loadedPage = function()
	{
		this.loaded.page = this.page;
	};
	
	
	this.loadedText = function()
	{
		this.loaded.text = this.text;
	};
	
	
	this.log = function()
	{
		console.groupEnd();
		var group = "";
		group += "PAGE : ";
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



