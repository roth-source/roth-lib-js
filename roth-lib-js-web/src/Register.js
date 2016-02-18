

roth.lib.js.web.Register = function(app, modules, common, template)
{
	var self = this;
	this.app = app;
	this.modules = modules.slice();
	this.common = common;
	this.template = template;
	
	this.text			= {};
	this.layout			= {};
	this.page			= {};
	this.component		= {};
	
	this.endpoint		= {};
	this.filterer		= {};
	this.validator		= {};
	this.loader			= {};
	this.redirector		= {};
	this.feedbacker		= {};
	this.disabler		= {};
	
	modules.push(common);
	forEach(modules, function(module)
	{
		self.text[module]		= {};
		self.layout[module]		= {};
		self.page[module]		= {};
		self.component[module]	= {};
	});
	
	
	this.filterer.replace = function(value, regExp, replacement)
	{
		replacement = isSet(replacement) ? replacement : "";
		return value.replace(regExp, replacement);
	};
	
	this.filterer.number = function(value)
	{
		return value.replace(/[^0-9]/g, "");
	};
	
	this.filterer.decimal = function(value)
	{
		return value.replace(/[^0-9.]/g, "");
	};
	
	this.filterer.int = function(value)
	{
		if(value)
		{
			value = value.replace(/[^0-9.]/g, "");
			if(!isNaN(value))
			{
				value = parseInt(value);
			}
			if(!isNaN(value))
			{
				return value;
			}
		}
		return null;
	};
	
	this.filterer.float = function(value)
	{
		if(value)
		{
			value = value.replace(/[^0-9.]/g, "");
			if(!isNaN(value))
			{
				value = parseFloat(value);
			}
			if(!isNaN(value))
			{
				return value;
			}
		}
		return null;
	};
	
	this.filterer.currency = function(value)
	{
		return CurrencyUtil.parse(value);
	};
	
	this.validator.test = function(value, regExp)
	{
		return regexp.test(value);
	};
	
	this.validator.email = function(value)
	{
		return (/^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]+$/).test(value);
	};
	
	this.validator.phone = function(value)
	{
		return (/^[0-9]{10}$/).test(value);
	};
	
	this.validator.zip = function(value)
	{
		return (/^[0-9]{5}$/).test(value);
	};
	
	this.validator.number = function(value)
	{
		return (/^[0-9]+(\.[0-9]{1,2})?$/).test(value);
	};
	
	this.validator.confirm = function(value, id)
	{
		var value2 = $("#" + id).val();
		return value == value2;
	};
	
	this.validator.date = function(value, pattern)
	{
		return DateUtil.isValid(pattern, value);
	};
	
};


roth.lib.js.web.Register.prototype.isValidModule = function(module)
{
	return inMap(module, this.modules);
};


roth.lib.js.web.Register.prototype.isValidLang = function(module, lang)
{
	var valid = inMap(lang, this.text[module]);
	if(isFileProtocol() && !valid)
	{
		this.getText(module, lang);
		valid = inMap(lang, this.text[module]);
	}
	return valid;
};


roth.lib.js.web.Register.prototype.getText = function(module, lang)
{
	var text = {};
	if(isFileProtocol() && !isObject(this.text[module][lang]))
	{
		var path = module + "/text/" + lang;
		this.text[module][lang] = this.getJson(path);
	}
	$.extend(true, text, this.text[module][lang]);
	if(isFileProtocol() && !isObject(this.text[this.common][lang]))
	{
		var path = this.common + "/text/" + lang;
		this.text[this.common][lang] = this.getJson(path);
	}
	$.extend(true, text, this.text[this.common][lang]);
	return text;
};


roth.lib.js.web.Register.prototype.getSafeName = function(name)
{
	return isValidString(name) ? name.replace(/[^a-zA-Z_0-9]/g, "_") : "";
};


roth.lib.js.web.Register.prototype.getConstructor = function(module, name, type)
{
	var safeName = this.getSafeName(name);
	var constructor = this[type][module][safeName];
	if(isFileProtocol())
	{
		var path = module + "/" + type + "/" + name;
		if(!isFunction(constructor))
		{
			this.loadScript(path);
			constructor = this[type][module][safeName];
		}
		if(!isFunction(constructor))
		{
			var source = this.getSource(path);
			if(isValidString(source))
			{
				this[type][module][safeName] = function()
				{
					this.init = null;
				};
				constructor = this[type][module][safeName];
				constructor.source = source;
			}
		}
		else if(!isValidString(constructor.source))
		{
			constructor.source = this.getSource(path);
			if(!isValidString(constructor.source))
			{
				constructor = null;
			}
		}
	}
	return constructor;
};


roth.lib.js.web.Register.prototype.getView = function(module, name, type)
{
	var view = null;
	var constructor = this.getConstructor(module, name, type);
	if(!isFunction(constructor))
	{
		constructor = this.getConstructor(this.common, name, type);
	}
	if(isFunction(constructor))
	{
		view = new constructor();
	}
	return view;
};


roth.lib.js.web.Register.prototype.getLayout = function(module, name)
{
	return this.getView(module, name, "layout");
};


roth.lib.js.web.Register.prototype.getPage = function(module, name)
{
	return this.getView(module, name, "page");
};


roth.lib.js.web.Register.prototype.getComponent = function(module, name)
{
	return this.getView(module, name, "component");
};


roth.lib.js.web.Register.prototype.loadScript = function(path)
{
	var url = "dev/app/" + this.app + "/" + path + ".js";
	$.ajax(
	{
		url : url,
		dataType : "script",
		cache : false,
		async : false
	});
};


roth.lib.js.web.Register.prototype.getSource = function(path)
{
	var self = this;
	var source = null;
	var url = "dev/app/" + this.app + "/" + path + ".html";
	var success = function(data)
	{
		source = self.template.parse(data);
	};
	$.ajax(
	{
		url : url,
		dataType : "text",
		cache : false,
		async : false,
		success : success
	});
	return source;
};


roth.lib.js.web.Register.prototype.getJson = function(path)
{
	var self = this;
	var json = null;
	var url = "dev/app/" + this.app + "/" + path + ".json";
	var success = function(data)
	{
		json = data;
	};
	$.ajax(
	{
		url : url,
		dataType : "json",
		cache : false,
		async : false,
		success : success
	});
	return json;
};



