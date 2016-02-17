

roth.lib.js.web.Register = function(app)
{
	this.app = app;
	this.template = isFileProtocol() ? new roth.lib.js.template.Template() : null;
	
	this.langs			= ["en"];
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


roth.lib.js.web.Register.prototype.isValidLang = function(lang)
{
	return inArray(lang, this.langs);
};


roth.lib.js.web.Register.prototype.getText = function(lang)
{
	if(isFileProtocol() && !isObject(this.text[lang]))
	{
		var path = "text/text_" + lang;
		this.text[lang] = this.getJson(path);
	}
	return this.text[lang];
};


roth.lib.js.web.Register.prototype.getSafeName = function(name)
{
	return isValidString(name) ? name.replace(/[^a-zA-Z_0-9]/g, "_") : "";
};


roth.lib.js.web.Register.prototype.getLayout = function(layoutName)
{
	var layout = null;
	var layoutConstructor = this.getLayoutConstructor(layoutName);
	if(isSet(layoutConstructor))
	{
		layout = new layoutConstructor();
	}
	return layout;
};


roth.lib.js.web.Register.prototype.getLayoutConstructor = function(layoutName)
{
	var name = this.getSafeName(layoutName);
	var layoutConstructor = this.layout[name];
	if(isFileProtocol())
	{
		var path = "view/layout/" + layoutName;
		if(!isFunction(layoutConstructor))
		{
			this.loadScript(path);
			layoutConstructor = this.layout[name];
		}
		if(isFunction(layoutConstructor) && !isString(layoutConstructor.source))
		{
			layoutConstructor.source = this.getSource(path);
		}
	}
	return layoutConstructor;
};


roth.lib.js.web.Register.prototype.getPage = function(moduleName, pageName)
{
	var page = null;
	var pageConstructor = this.getPageConstructor(moduleName, pageName);
	if(isSet(pageConstructor))
	{
		page = new pageConstructor();
	}
	return page;
};


roth.lib.js.web.Register.prototype.getPageConstructor = function(moduleName, pageName)
{
	var name = this.getSafeName(moduleName + "_" + pageName);
	var pageConstructor = this.page[name];
	if(isFileProtocol())
	{
		var path = "view/page/" + moduleName + "/" + pageName;
		if(!isFunction(pageConstructor))
		{
			this.loadScript(path);
			pageConstructor = this.page[name];
		}
		if(isFunction(pageConstructor) && !isString(pageConstructor.source))
		{
			pageConstructor.source = this.getSource(path);
		}
	}
	return pageConstructor;
};


roth.lib.js.web.Register.prototype.getComponent = function(componentName)
{
	var component = null;
	var componentConstructor = this.getComponentConstructor(componentName);
	if(isSet(componentConstructor))
	{
		component = new componentConstructor();
	}
	return component;
};


roth.lib.js.web.Register.prototype.getComponentConstructor = function(componentName)
{
	var name = this.getSafeName(componentName);
	var componentConstructor = this.component[name];
	if(isFileProtocol())
	{
		var path = "view/component/" + componentName;
		if(!isFunction(componentConstructor))
		{
			this.loadScript(path);
			componentConstructor = this.component[name];
		}
		if(isFunction(componentConstructor) && !isString(componentConstructor.source))
		{
			componentConstructor.source = this.getSource(path);
		}
	}
	return componentConstructor;
};


roth.lib.js.web.Register.prototype.loadScript = function(path)
{
	var url = "dev/" + this.app + "/" + path + ".js";
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
	var url = "dev/" + this.app + "/" + path + ".html";
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
	var url = "dev/" + this.app + "/" + path + ".json";
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



