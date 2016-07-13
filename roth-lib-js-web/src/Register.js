

roth.lib.js.web.Register = roth.lib.js.web.Register || (function()
{
	
	var Register = function(app, moduleDependencies, template)
	{
		var self = this;
		this._app = app;
		this._moduleDependencies = moduleDependencies;
		this._template = template;
		
		forEach(moduleDependencies, function(dependencies, module)
		{
			self[module] =
			{
				text 		: {},
				mixin		: {},
				layout 		: {},
				page 		: {},
				component	: {}
			};
		});
		
	};
	
	
	Register.prototype.isValidModule = function(module)
	{
		return inMap(module, this._moduleDependencies);
	};


	Register.prototype.isValidLang = function(module, lang)
	{
		if(isSet(lang) && isSet(this[module]) && isSet(this[module].text))
		{
			var valid = isObject(this[module].text[lang]);
			if(isDevFile() && !isCompiled() && !valid)
			{
				this.getText(module, lang);
				valid = isObject(this[module].text[lang]);
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
			if(isDevFile() && !isCompiled() && !isObject(this[module].text[lang]))
			{
				var path = module + "/text/" + module + "_" + lang;
				this[module].text[lang] = this.getJson(path);
			}
			text[module] = this[module].text[lang];
			forEach(this._moduleDependencies[module], function(dependency)
			{
				if(isDevFile() && !isCompiled() && !isObject(self[dependency].text[lang]))
				{
					var path = dependency + "/text/" + dependency + "_" + lang;
					self[dependency].text[lang] = self.getJson(path);
				}
				text[dependency] = self[dependency].text[lang];
			});
		}
		return text;
	};


	Register.prototype.getConstructor = function(module, name, type)
	{
		var self = this;
		var constructor = this[module][type][name];
		if(isDevFile() && !isCompiled())
		{
			var path = module + "/" + type + "/" + name;
			if(!isFunction(constructor))
			{
				constructor = new Function(this.getScript(path)).apply(this);
			}
			if(type != "mixin")
			{
				if(!isFunction(constructor))
				{
					var source = this.getSource(path);
					if(isValidString(source))
					{
						constructor = function() {};
						constructor.config =
						{
							init : null
						};
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
		}
		if(type != "mixin")
		{
			this.extendViewConstructor(constructor);
		}
		this[module][type][name] = constructor;
		return constructor;
	};
	
	
	Register.prototype.extendViewConstructor = function(constructor)
	{
		if(isFunction(constructor) && !isFunction(constructor.prototype._init))
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
		return constructor;
	};
	
	
	Register.prototype.getViewConstructor = function(module, name, type)
	{
		var self = this;
		name = StringUtil.camelCase(name);
		var constructorModule = module;
		var constructor = this.getConstructor(module, name, type);
		if(!isFunction(constructor))
		{
			forEach(this._moduleDependencies[module], function(dependency)
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
			if(isObject(constructor.config) && isArray(constructor.config.mixins))
			{
				forEach(constructor.config.mixins, function(mixinName)
				{
					var mixinConstructor = self.getMixinConstructor(module, mixinName)
					if(isFunction(mixinConstructor))
					{
						mixin(constructor, mixinConstructor);
					}
				});
			}
		}
		return constructor;
	};


	Register.prototype.constructView = function(constructor, data, web)
	{
		var self = this;
		var view = null;
		if(isFunction(constructor))
		{
			view = new constructor(data);
			view.data = data;
			view._init(web);
		}
		return view;
	};
	
	
	Register.prototype.getLayoutConstructor = function(module, name, defaultSource)
	{
		var layoutConstructor = null;
		if(isValidString(name))
		{
			layoutConstructor = this.getViewConstructor(module, name, "layout");
		}
		if(!isFunction(layoutConstructor))
		{
			layoutConstructor = function(){};
			layoutConstructor._module = module;
			layoutConstructor._name = "default";
			layoutConstructor.config = { init : null };
			layoutConstructor.source = this._template.parse(defaultSource);
			this.extendViewConstructor(layoutConstructor);
		}
		return layoutConstructor;
	};
	
	
	Register.prototype.getPageConstructor = function(module, name)
	{
		return this.getViewConstructor(module, name, "page");
	};
	
	
	Register.prototype.getComponentConstructor = function(module, name)
	{
		return this.getViewConstructor(module, name, "component");
	};
	
	
	Register.prototype.getMixinConstructor = function(module, name)
	{
		return this.getViewConstructor(module, name, "mixin");
	};
	
	
	Register.prototype.getScript = function(path)
	{
		var self = this;
		var script = "";
		var url = "dev/app/" + this._app + "/" + path + ".js";
		var success = function(data)
		{
			script = data;
		};
		$.ajax(
		{
			url : url,
			dataType : "text",
			cache : false,
			async : false,
			success : success
		});
		return script;
	};


	Register.prototype.getSource = function(path)
	{
		var self = this;
		var source = null;
		var url = "dev/app/" + this._app + "/" + path + ".html";
		var success = function(data)
		{
			source = self._template.parse(data);
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
		var url = "dev/app/" + this._app + "/" + path + ".json";
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



