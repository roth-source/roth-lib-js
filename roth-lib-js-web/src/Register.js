

roth.lib.js.web.Register = roth.lib.js.web.Register || (function()
{
	
	var Register = function(app, moduleDependencies, template)
	{
		var self = this;
		this.app = app;
		this.moduleDependencies = moduleDependencies;
		this.template = template;
		
		this.text			= {};
		this.layout			= {};
		this.page			= {};
		this.component		= {};
		
		forEach(moduleDependencies, function(dependencies, module)
		{
			self.text[module]		= {};
			self.layout[module]		= {};
			self.page[module]		= {};
			self.component[module]	= {};
		});
		
		this.endpoint		= {};
		this.filterer		= {};
		this.validator		= {};
		this.disabler		= {};
		this.loader			= {};
		this.redirector		= {};
		this.feedbacker		= {};
		
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
	
	
	Register.prototype.isValidModule = function(module)
	{
		return inMap(module, this.moduleDependencies);
	};


	Register.prototype.isValidLang = function(module, lang)
	{
		if(isSet(lang))
		{
			var valid = inMap(lang, this.text[module]);
			if(isDevFile() && !isCompiled() && !valid)
			{
				this.getText(module, lang);
				valid = inMap(lang, this.text[module]);
			}
			return valid;
		}
		else
		{
			return false;
		}
	};


	Register.prototype.getText = function(module, lang)
	{
		var self = this;
		var text = {};
		if(isSet(lang))
		{
			if(isDevFile() && !isCompiled() && !isObject(this.text[module][lang]))
			{
				var path = module + "/text/" + module + "_" + lang;
				this.text[module][lang] = this.getJson(path);
			}
			$.extend(true, text, this.text[module][lang]);
			forEach(this.moduleDependencies[module], function(dependency)
			{
				if(isDevFile() && !isCompiled() && !isObject(self.text[dependency][lang]))
				{
					var path = dependency + "/text/" + dependency + "_" + lang;
					self.text[dependency][lang] = self.getJson(path);
				}
				$.extend(true, text, self.text[dependency][lang]);
			});
		}
		return text;
	};


	Register.prototype.getConstructor = function(module, name, type)
	{
		var safeName = StringUtil.safeName(name);
		var constructor = this[type][module][safeName];
		if(isDevFile() && !isCompiled())
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


	Register.prototype.getViewConstructor = function(module, name, type)
	{
		var self = this;
		var constructorModule = module;
		var constructor = this.getConstructor(module, name, type);
		if(!isFunction(constructor))
		{
			forEach(this.moduleDependencies[module], function(dependency)
			{
				constructor = self.getConstructor(dependency, name, type);
				if(isFunction(constructor))
				{
					constructorModule = dependency;
					return false;
				}
			});
		}
		if(isFunction(constructor))
		{
			constructor._module = constructorModule;
			constructor._name = name;
		}
		return constructor;
	};


	Register.prototype.constructView = function(constructor, web)
	{
		var view = null;
		if(isFunction(constructor))
		{
			if(!isSet(constructor.prototype._init))
			{
				var prototype = constructor.prototype;
				constructor.prototype = Object.create(roth.lib.js.web.View.prototype);
				for(var name in prototype)
				{
					if(!isSet(constructor.prototype[name]))
					{
						constructor.prototype[name] = prototype[name];
					}
					else
					{
						console.error(name + " cannot be on view prototype");
					}
				}
				constructor.prototype.constructor = constructor;
			}
			view = new constructor();
			view._init(web);
		}
		return view;
	};


	Register.prototype.getPageConstructor = function(module, name)
	{
		return this.getViewConstructor(module, name, "page");
	};


	Register.prototype.getLayoutConstructor = function(module, name)
	{
		return this.getViewConstructor(module, name, "layout");
	};


	Register.prototype.getComponentConstructor = function(module, name)
	{
		return this.getViewConstructor(module, name, "component");
	};


	Register.prototype.loadScript = function(path)
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


	Register.prototype.getSource = function(path)
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


	Register.prototype.getJson = function(path)
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
	
	return Register;
	
})();


