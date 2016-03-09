

roth.lib.js.web.Hash = function()
{
	this.value = null;
	this.lang = null;
	this.layout = null;
	this.module = null;
	this.page = null;
	this.param = {};
	
	this.search = null;
	this.context = null;
	
	this.defaultLang = "en";	
	this.defaultModule = "index";
	this.defaultPage = "index";	
	this.langStorage = "lang";
	
	this.loaded = {};
	this.changeParam = {};
	
	this.newValue = false;
	this.newLang = false;
	this.newLayout = false;
	this.newModule = false;
	this.newPage = false;
	
};


roth.lib.js.web.Hash.prototype.hasParam = function(name)
{
	return isSet(this.param[name]);
};


roth.lib.js.web.Hash.prototype.getParam = function(name, defaultValue)
{
	var value = this.param[name];
	return isValidString(value) ? value : defaultValue;
};


roth.lib.js.web.Hash.prototype.getParamSize = function()
{
	return Object.keys(this.param).length;
};


roth.lib.js.web.Hash.prototype.isParamEmpty = function()
{
	return this.getParamSize() == 0;
};


roth.lib.js.web.Hash.prototype.getModule = function()
{
	return isSet(this.module) ? this.module : this.defaultModule;
};


roth.lib.js.web.Hash.prototype.getPage = function()
{
	return isSet(this.page) ? this.page : this.defaultPage;
};


roth.lib.js.web.Hash.prototype.setValue = function(value)
{
	this.value = value;
	this.newValue = this.value != this.loaded.value;
};


roth.lib.js.web.Hash.prototype.setLang = function(lang)
{
	this.lang = lang;
	this.newLang = this.lang != this.loaded.lang;
};


roth.lib.js.web.Hash.prototype.setLayout = function(layout)
{
	this.layout = layout;
	this.newLayout = this.layout != this.loaded.layout;
};


roth.lib.js.web.Hash.prototype.setModule = function(module)
{
	this.module = module;
	this.newModule = this.module != this.loaded.module;
};


roth.lib.js.web.Hash.prototype.setPage = function(page)
{
	this.page = page;
	this.newPage = this.newModule || this.page != this.loaded.page;
};


roth.lib.js.web.Hash.prototype.changeLang = function(lang)
{
	this.setLang(lang);
	this.refresh();
};


roth.lib.js.web.Hash.prototype.back = function()
{
	window.history.back();
};


roth.lib.js.web.Hash.prototype.next = function(module, page, param)
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


roth.lib.js.web.Hash.prototype.replace = function(module, page, param)
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


roth.lib.js.web.Hash.prototype.refresh = function()
{
	window.location.replace(this.build(this.module, this.page, this.param));
};


roth.lib.js.web.Hash.prototype.reload = function()
{
	window.location.reload();
};


roth.lib.js.web.Hash.prototype.change = function(changeParam, page, module)
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


roth.lib.js.web.Hash.prototype.build = function(module, page, param)
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


roth.lib.js.web.Hash.prototype.isValid = function()
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
				if(!isEmpty(matches))
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
	if(isSet(this.search.hash))
	{
		var url = "";
		url += window.location.protocol;
		url += "//";
		url += window.location.host;
		url += window.location.pathname;
		// TODO add query string
		url += "#";
		url += decodeURIComponent(this.search.hash);
		window.location.replace(url);
		return false;
	}
	else if(!blankHash && window.location.hash != hash)
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


roth.lib.js.web.Hash.prototype.loadedParam = function()
{
	this.loaded.param = this.param;
};


roth.lib.js.web.Hash.prototype.loadedValue = function()
{
	this.loaded.value = this.value;
};


roth.lib.js.web.Hash.prototype.loadedLang = function()
{
	this.loaded.lang = this.lang;
};


roth.lib.js.web.Hash.prototype.loadedLayout = function()
{
	this.loaded.layout = this.layout;
};


roth.lib.js.web.Hash.prototype.loadedModule = function()
{
	this.loaded.module = this.module;
};


roth.lib.js.web.Hash.prototype.loadedPage = function()
{
	this.loaded.page = this.page;
};


roth.lib.js.web.Hash.prototype.log = function()
{
	console.groupEnd();
	var group = "";
	group += "PAGE : ";
	group += this.lang + " / ";
	group += this.getModule() + " / ";
	group += this.getPage() + " / ";
	console.group(group + JSON.stringify(this.param));
};


roth.lib.js.web.Hash.prototype.cloneParam = function()
{
	return $.extend({}, this.param);;
};


roth.lib.js.web.Hash.prototype.cloneLoadedParam = function()
{
	return isSet(this.loaded.param) ? $.extend({}, this.loaded.param) : {};
};


roth.lib.js.web.Hash.prototype.paramChanges = function(changeParams)
{
	var self = this;
	var changeParam = {};
	var param = this.cloneParam();
	var loadedParam = this.cloneLoadedParam();
	var names = Object.keys(param);
	forEach(loadedParam, function(value, name)
	{
		if(!inArray(name, names))
		{
			names.push(name);
		}
	});
	var empty = false;
	forEach(names, function(name)
	{
		var changed = param[name] != loadedParam[name];
		if(changed)
		{
			if(inArray(name, changeParams))
			{
				changeParam[name] = isSet(param[name]) ? param[name] : null;
			}
			else
			{
				empty = true;
			}
		}
	});
	this.changeParam = changeParam;
	return !empty ? changeParam : {};
};

