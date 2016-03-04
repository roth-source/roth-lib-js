

var roth = roth || {};
roth.lib = roth.lib || {};
roth.lib.js = roth.lib.js || {};
roth.lib.js.web = roth.lib.js.web || {};


roth.lib.js.web.Web = function(app, moduleDependencies)
{
	this.config =
	{
		jqueryScript 		: "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.0/jquery.js",
		defaultLang 		: "en",
		endpoint 			: "endpoint",
		service 			: "service",
		sessionId 			: "jsessionid",
		csrfToken 			: "csrfToken",
		xCsrfToken 			: "X-Csrf-Token",
		layoutId			: "layout",
		pageId				: "page",
		attr :
		{
			text			: "data-text",
			textAttr		: "data-text-attr",
			textParam		: "data-text-param",
			component		: "data-component",
			reference		: "data-reference",
			data			: "data-data",
			group 			: "data-group",
			include 		: "data-include",
			required		: "data-required",
			filter			: "data-filter",
			validate		: "data-validate",
			feedback		: "data-feedback",
			submitGroup		: "data-submit-group",
			disable			: "data-disable",
			prerequest		: "data-prerequest",
			presubmit		: "data-presubmit",
			service			: "data-service",
			method			: "data-method",
			success			: "data-success",
			error			: "data-error",
			request			: "data-request",
			updateValue		: "data-update-value",
			editable		: "data-editable",
			name			: "data-name",
			key				: "data-key",
			editor			: "data-editor",
			type			: "data-type",
			radioGroup		: "data-radio-group",
			radioValue		: "data-radio-value",
			checkboxValue	: "data-checkbox-value",
			fileValue		: "data-file-value",
			field			: "data-field",
			onclick			: "data-onclick",
			ondblclick		: "data-ondblclick",
			onchange		: "data-onchange",
			onblur			: "data-onblur",
			onfocus			: "data-onfocus",
			onkeyup			: "data-onkeyup"
		}
	};
	
	this.app = app;
	this.moduleDependencies = moduleDependencies;
	this._loadedModules = [];
	this._inited = false;
	
	this.template = new roth.lib.js.template.Template();
	this.register = new roth.lib.js.web.Register(this.app, this.moduleDependencies, this.template);
	this.hash = new roth.lib.js.web.Hash();
	this.dev = null;
	
	this.text = {};
	this.layout = {};
	this.page = {};
	this.context = {};
	
};


roth.lib.js.web.Web.prototype.init = function()
{
	var self = this;
	if(!isSet(jQuery))
	{
		document.write('<script src="' + this.config.jqueryScript + '"></script>');
	}
	if(isMock())
	{
		this.dev = new roth.lib.js.web.Dev();
	}
	window.addEventListener("hashchange", function()
	{
		if(self._isLoadable())
		{
			self._loadLayout();
		}
	},
	false);
	document.addEventListener("DOMContentLoaded", function()
	{
		if(!self._inited)
		{
			self._initConsole();
			self._initJquery();
			if(self._isLoadable())
			{
				self._loadLayout();
			}
			self._inited = true;
		}
	});
};


roth.lib.js.web.Web.prototype._initConsole = function()
{
	var console = window.console;
	if(console && !isDev() && !isDebug())
	{
		for(var method in console)
		{
			if(isFunction(console[method]) && Object.prototype.hasOwnProperty.call(console, method))
			{
				console[method] = function(){};
			}
		}
	}
	else
	{
		console.json = function(object)
		{
			console.log(JSON.stringify(object, null, 4));
		};
	}
};


roth.lib.js.web.Web.prototype._initJquery = function()
{
	var self = this;
	jQuery.expr[":"].include = function(node, index, match)
	{
		var element = $(node);
		return element.is(":enabled") && (element.is(":visible") || isTrue(element.attr(self.config.attr.include)));
	};
};


roth.lib.js.web.Web.prototype._loadModuleDependencies = function(module)
{
	var self = this;
	this._loadModule(module);
	forEach(this.moduleDependencies[module], function(module)
	{
		self._loadModule(module);
	});
};


roth.lib.js.web.Web.prototype._loadModule = function(module)
{
	if(isCompiled() && !inArray(module, this._loadedModules))
	{
		var src = "app/" + this.app + "/" + module + ".js";
		$("<script></script>").attr("src", src).appendTo("head");
		this._loadedModules.push(module);
	}
};


roth.lib.js.web.Web.prototype._isLoadable = function()
{
	var self = this;
	var loadable = this.hash.isValid();
	if(loadable)
	{
		var module = this.hash.getModule();
		this._loadModuleDependencies(module);
		var pageName = this.hash.getPage();
		var page = this.register.getPage(module, pageName);
		if(isSet(page))
		{
			var layoutName = !isUndefined(page.layout) ? page.layout : module;
			this.hash.setLayout(layoutName);
			var layout = null;
			if(isSet(layoutName))
			{
				layout = this.hash.newLayout ? this.register.getLayout(module, layoutName) : this.layout;
			}
			if(!(isSet(this.hash.lang) && this.register.isValidLang(module, this.hash.lang)))
			{
				var lang = localStorage.getItem(this.hash.langStorage);
				if(this.register.isValidLang(module, lang))
				{
					this.hash.setLang(lang);
				}
				else
				{
					if(window.navigator.language)
					{
						lang = window.navigator.language;
					}
					else if(window.navigator.browserLanguage)
					{
						lang = window.navigator.browserLanguage;
					}
					if(isSet(lang) && lang.length >= 2)
					{
						lang = lang.substring(0, 2);
					}
					lang = this.register.isValidLang(module, lang) ? lang : this.hash.defaultLang;
					this.hash.setLang(lang);
					localStorage.setItem(this.hash.langStorage, lang);
				}
			}
			if(loadable)
			{
				// SET DEFAULT PARAMS
				forEach(page.defaultParams, function(value, name)
				{
					if(!self.hash.hasParam(name))
					{
						self.hash.param[name] = value;
						loadable = false;
					}
				});
				// CHECK FOR ALLOWED PARAMS
				var allowedParams = this._allowedParams(page);
				if(!isNull(allowedParams))
				{
					forEach(this.hash.param, function(value, name)
					{
						if(!inArray(name, allowedParams))
						{
							delete self.hash.param[name];
							loadable = false;
						}
					});
				}
				if(!loadable)
				{
					this.hash.refresh();
				}
			}
			// CHECK FOR CHANGE PARAMS
			if(loadable && !this.hash.newModule && !this.hash.newPage)
			{
				if(!isEmpty(page.changeParams))
				{
					var changed = false;
					var loadedParam = this.hash.cloneLoadedParam();
					for(var name in this.hash.param)
					{
						changed = page.changeParams.indexOf(name) > -1;
						if(!changed)
						{
							changed = this.hash.param[name] == loadedParam[name];
							if(!changed)
							{
								break;
							}
							else
							{
								delete loadedParam[name];
							}
						}
						else
						{
							delete loadedParam[name];
						}
					}
					if(changed)
					{
						changed = Object.keys(loadedParam).length == 0;
					}
					if(changed)
					{
						if(isFunction(this.layout.change))
						{
							this.layout.change(this.layout.data);
						}
						if(isFunction(this.page.change))
						{
							this.page.change(this.page.data);
						}
						loadable = false;
					}
				}
			}
			if(loadable)
			{
				this.text = this.register.getText(module, this.hash.lang);
				this.page = page;
				this.layout = layout;
				this.hash.log();
				this.hash.loadedParam();
			}
		}
		else
		{
			// error no page
		}
	}
	return loadable;
};


roth.lib.js.web.Web.prototype._allowedParams = function(page)
{
	var allowedParams = [];
	if(!isNull(page.allowedParams))
	{
		if(isArray(page.allowedParams))
		{
			forEach(page.allowedParams, function(name)
			{
				allowedParams.push(name);
			});
		}
		forEach(page.changeParams, function(name)
		{
			allowedParams.push(name);
		});
		forEach(page.defaultParams, function(value, name)
		{
			allowedParams.push(name);
		});
	}
	else
	{
		allowedParams = null;
	}
	return allowedParams;
};


roth.lib.js.web.Web.prototype._initMethod = function(name)
{
	var initMethod = "init";
	forEach(name.replace(/[^a-zA-Z_0-9]/g, "_").split("_"), function(value)
	{
		initMethod += StringUtil.capitalize(value)
	});
	return initMethod;
};

roth.lib.js.web.Web.prototype._loadLayout = function()
{
	var self = this;
	if(isObject(this.layout) && this.hash.newLayout)
	{
		var success = function(data, status, xhr)
		{
			self.layout.data = data;
			var html = self.template.eval(self.layout.constructor.source,
			{
				data : self.layout.data,
				config : self.config,
				register : self.register,
				hash : self.hash,
				text : self.text,
				layout	: self.layout,
				context : self.context
			});
			self.layout._temp = $("<div></div>");
			self.layout._temp.html(html);
			self._translate(self.layout._temp, "layout." + self.layout.module + "." + (self.layout.name.replace(/\//g, ".")) + ".");
			self._defaults(self.layout._temp);
			self._bind(self.layout._temp, self.layout, "layout");
			self._loadComponents(self.layout, self.layout._temp);
			self.hash.loadedLayout();
			self._readyLayout();
		};
		var error = function(xhr, status, errorMessage)
		{
			self.layout._temp = $("<div></div>").attr("id", self.config.pageId);
			self._loadPage();
		};
		var complete = function(xhr, status)
		{
			
		};
		var method = !isUndefined(this.layout.init) ? this.layout.init : this._initMethod(this.hash.layout);
		if(isSet(method))
		{
			var service = isSet(this.layout.service) ? this.layout.service : this.hash.getModule();
			this.service(service, method, this.hash.param, success, error, complete);
		}
		else
		{
			this.layout.data = {};
			success(this.layout.data);
		}
	}
	else
	{
		this.hash.loadedLayout();
		this._loadPage();
	}
};


roth.lib.js.web.Web.prototype._readyLayout = function()
{
	var self = this;
	this.layout.element = $("#" + this.config.layoutId);
	if(!this.layout.element.is(":hidden"))
	{
		this.layout.element.hide();
	}
	this.layout.element.empty().append(this.layout._temp.detach());
	delete this.layout._temp;
	if(isFunction(this.layout.ready))
	{
		this.layout.ready(this.layout.data, this.layout);
	}
	forEach(this.layout._components, function(component)
	{
		if(isFunction(component.ready))
		{
			component.ready(self.layout.data, component);
		}
	});
	this.layout.element.show();
	if(isFunction(this.layout.visible))
	{
		this.layout.visible(this.layout.data, this.layout);
	}
	forEach(this.layout._components, function(component)
	{
		if(isFunction(component.visible))
		{
			component.visible(self.layout.data, component);
		}
	});
	var loader = this.register.loader._default;
	if(isFunction(loader))
	{
		loader($("#" + this.config.pageId), true);
	}
	this._loadPage();
};


roth.lib.js.web.Web.prototype._loadPage = function()
{
	var self = this;
	var success = function(data, status, xhr)
	{
		self.page.data = data;
		var html = self.template.eval(self.page.constructor.source,
		{
			data : self.page.data,
			config : self.config,
			register : self.register,
			hash : self.hash,
			text : self.text,
			layout	: self.layout,
			page	: self.page,
			context : self.context
		});
		self.page._temp = $("<div></div>");
		self.page._temp.html(html);
		self._translate(self.page._temp, "page." + self.page.module + "." + (self.page.name.replace(/\//g, ".")) + ".");
		self._defaults(self.page._temp);
		self._bind(self.page._temp, self.page, "page");
		self._loadComponents(self.page, self.page._temp);
		self.hash.loadedModule();
		self.hash.loadedPage();
		self.hash.loadedValue();
		self.hash.loadedLang();
		self._readyPage();
	};
	var error = function(xhr, status, errorMessage)
	{
		// TODO error
	};
	var complete = function(xhr, status)
	{
		
	};
	var method = !isUndefined(this.page.init) ? this.page.init : this._initMethod(this.hash.getPage());
	if(isSet(method))
	{
		var service = isSet(this.page.service) ? this.page.service : this.hash.getModule();
		this.service(service, method, this.hash.param, success, error, complete);
	}
	else
	{
		this.page.data = {};
		success(this.page.data);
	}
};


roth.lib.js.web.Web.prototype._readyPage = function()
{
	var self = this;
	this.page.element = isSet(this.hash.layout) ? $("#" + this.config.pageId) :  $("#" + this.config.layoutId);
	if(!this.page.element.is(":hidden"))
	{
		this.page.element.hide();
	}
	this.page.element.empty().append(this.page._temp.contents().detach());
	delete this.page._temp;
	if(isFunction(this.page.ready))
	{
		this.page.ready(this.page.data, this.page);
	}
	forEach(this.page._components, function(component)
	{
		if(isFunction(component.ready))
		{
			component.ready(self.page.data, component);
		}
	});
	var loader = this.register.loader._default;
	if(isFunction(loader))
	{
		loader(this.page.element, false);
	}
	this.page.element.show();
	if(isFunction(this.page.visible))
	{
		this.page.visible(this.page.data, this.page);
	}
	forEach(this.page._components, function(component)
	{
		if(isFunction(component.visible))
		{
			component.visible(self.page.data, component);
		}
	});
};


roth.lib.js.web.Web.prototype._loadComponents = function(view, element)
{
	var self = this;
	var module = this.hash.getModule()
	element.find("[" + this.config.attr.component + "]").each(function()
	{
		var element = $(this);
		var componentName = element.attr(self.config.attr.component);
		var component = self.register.getComponent(module, componentName);
		if(isSet(component))
		{
			var data = ObjectUtil.parse(element.attr(self.config.attr.data));
			component.element = element;
			self._loadComponent(component, data, false);
			if(!isArray(view._components))
			{
				view._components = [];
			}
			view._components.push(component);
			var reference = element.attr(self.config.attr.reference);
			if(isValidString(reference) && !isSet(view[reference]))
			{
				view[reference] = component;
			}
		}
	});
};


roth.lib.js.web.Web.prototype._loadComponent = function(component, data, hide)
{
	var self = this;
	var html = self.template.eval(component.constructor.source,
	{
		data : data,
		config : self.config,
		register : self.register,
		hash : self.hash,
		text : self.text,
		layout	: self.layout,
		page : self.page,
		component : self.component,
		context : self.context
	});
	component._temp = $("<div></div>");
	component._temp.html(html);
	self._translate(component._temp, "component." + component.module + "." + (component.name.replace(/\//g, ".")) + ".");
	self._defaults(component._temp);
	self._bind(component._temp, component, "component");
	if(!isFalse(hide))
	{
		component.element.hide();
	}
	component.element.empty().append(component._temp.contents().detach());
};


roth.lib.js.web.Web.prototype.loadComponentInit = function(element, componentName, service, method, request, data, callback)
{
	var self = this;
	var service = isValidString(service) ? service : element.attr(this.config.attr.service);
	var method = isValidString(method) ? method : element.attr(this.config.attr.method);
	if(isValidString(service) && isValidString(method))
	{
		request = isObject(request) ? request : {};
		$.extend(true, request, this.hash.cloneParam(), ObjectUtil.parse(element.attr(this.config.attr.request)));
		var success = function(response)
		{
			data = isObject(data) ? data : {};
			$.extend(true, data, response);
			self.loadComponent(element, componentName, data, callback);
		};
		var error = function(errors)
		{
			self.loadComponent(element, componentName, data, callback);
		};
		var complete = function()
		{
			
		};
		this.service(service, method, request, success, error, complete);
	}
	else
	{
		this.loadComponent(element, componentName, data, callback);
	}
};


roth.lib.js.web.Web.prototype.loadComponent = function(element, componentName, data, callback)
{
	if(!isObject(data))
	{
		data = this.page.data;
	}
	var component = this.register.getComponent(this.hash.getModule(), componentName);
	if(isSet(component))
	{
		component.name = componentName;
		component.element = element;
		this._loadComponent(component, data, true);
		if(isFunction(component.ready))
		{
			component.ready(data, component);
		}
		component.element.show();
		if(isFunction(component.visible))
		{
			component.visible(data, component);
		}
		if(isFunction(callback))
		{
			callback(data, component);
		}
	}
};


roth.lib.js.web.Web.prototype.service = function(service, method, request, success, error, complete, group)
{
	if(isMock())
	{
		this._serviceFile(service, method, request, success, error, complete, group);
	}
	else
	{
		this._serviceCall(service, method, request, success, error, complete, group);
	}
};


roth.lib.js.web.Web.prototype._serviceFile = function(service, method, request, success, error, complete, group)
{
	var self = this;
	var scenarios = this.dev.getResponseScenarios(service, method);
	if(scenarios.length > 0)
	{
		if(isMockDemo())
		{
			this._serviceCall(service, method, request, success, error, complete, group, scenarios[0]);
		}
		else
		{
			this.dev.select(service + "/" + method, scenarios, function(scenario)
			{
				self._serviceCall(service, method, request, success, error, complete, group, scenario);
			});
		}
	}
	else
	{
		this._serviceCall(service, method, request, success, error, complete, group);
	}
};


roth.lib.js.web.Web.prototype._serviceCall = function(service, method, request, success, error, complete, group, scenario)
{
	var self = this;
	var module = this.hash.getModule();
	var page = this.hash.getPage();
	var url = null;
	var type = "POST";
	if(isMock())
	{
		type = "GET";
		url = "dev/service/" + service + "/" + method + "/" + method + "-response";
		if(scenario)
		{
			url += "-";
			url += scenario;
		}
		url += ".json";
	}
	else
	{
		path = this.config.service+ "/" + service + "/" + method;
		if(isFileProtocol())
		{
			var sessionId = localStorage.getItem(this.config.sessionId);
			if(isSet(sessionId))
			{
				path += ";" + this.config.sessionId + "=" + encodeURIComponent(sessionId);
			}
		}
		var csrfToken = localStorage.getItem("csrfToken");
		if(isSet(csrfToken))
		{
			path += "?csrfToken=" + encodeURIComponent(csrfToken);
		}
		var endpoint = this._endpoint();
		if(isSet(endpoint))
		{
			var context = isValidString(this.hash.context) ? this.hash.context + "/" : "";
			url = "https://" + endpoint + "/" + context + this.config.endpoint + "/" + path;
		}
		else
		{
			// TODO: error
		}
	}
	var errored = false;
	$.ajax(
	{
		type		: type,
		url			: url,
		data		: JSON.stringify(request),
		contentType	: "text/plain",
		dataType	: "json",
		cache		: false,
		xhrFields	:
		{
			withCredentials : true
		},
		success		: function(response, status, xhr)
		{
			if(isSet(response.dev))
			{
				if(isSet(response.dev[self.config.sessionId]))
				{
					localStorage.setItem(self.config.sessionId, response.dev[self.config.sessionId]);
				}
			}
			var csrfTokenHeader = xhr.getResponseHeader(self.config.xCsrfToken);
			if(isSet(csrfTokenHeader))
			{
				localStorage.setItem(self.config.csrfToken, csrfTokenHeader);
			}
			self._serviceLog(service, method, url, request, response);
			if(isSet(response.errors) && response.errors.length > 0)
			{
				var groupElement = isSet(group) ? $("[" + self.config.attr.group + "='" + group + "']") : $();
				forEach(response.errors, function(error)
				{
					switch(error.type)
					{
						case "SERVICE_AJAX_NOT_AUTHENTICATED":
						case "SERVICE_CSRF_TOKEN_INVALID":
						{
							var authRedirector = self.register.redirector[self.page.authRedirector];
							if(!isFunction(authRedirector))
							{
								authRedirector = self.register.redirector.auth;
							}
							if(isFunction(authRedirector))
							{
								authRedirector();
							}
							break;
						}
						case "REQUEST_FIELD_REQUIRED":
						case "REQUEST_FIELD_INVALID":
						{
							if(isSet(error.context))
							{
								var element = groupElement.find("[name='" + error.context + "']");
								self.feedback(element, { valid : false });
							}
							break;
						}
					}
				});
				if(isFunction(error))
				{
					error(response.errors);
				}
			}
			else
			{
				if(isFunction(success))
				{
					success(response);
				}
			}
		},
		error		: function(xhr, status, errorMessage)
		{
			if(!errored)
			{
				self._serviceLog(service, method, url, request, status + " - " + errorMessage);
				errored = true;
				if(isFunction(error))
				{
					error();
				}
			}
		},
		complete	: function(xhr, status)
		{
			if("success" != status && !errored)
			{
				self._serviceLog(service, method, url, request, status);
				errored = true;
				if(isFunction(error))
				{
					error();
				}
			}
			if(isFunction(complete))
			{
				complete();
			}
		}
	});
};


roth.lib.js.web.Web.prototype._serviceLog = function(service, method, url, request, response)
{
	if(isDebug())
	{
		var group = "SERVICE : " + service + " / " + method;
		var log = "";
		log += url + "\n\n";
		log += "REQUEST" + "\n";
		log += JSON.stringify(request, null, 4) + "\n\n";
		log += "RESPONSE" + "\n";
		log += JSON.stringify(response, null, 4) + "\n\n";
		console.groupCollapsed(group);
		console.log(log);
		console.groupEnd();
	}
};


roth.lib.js.web.Web.prototype._endpoint = function()
{
	var endpointStorage = this.config.endpoint + "-" + getEnvironment();
	var endpoint = localStorage.getItem(endpointStorage);
	if(!isSet(endpoint))
	{
		var endpoints = this.register.endpoint[getEnvironment()];
		if(isArray(endpoints) && !isEmpty(endpoints))
		{
			endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
			localStorage.setItem(endpointStorage, endpoint);
		}
	}
	return endpoint;
};


roth.lib.js.web.Web.prototype._translate = function(viewElement, prefix)
{
	var self = this;
	viewElement.find("[" + self.config.attr.text + "] > [lang]").each(function()
	{
		var element = $(this);
		var lang = element.attr("lang");
		if(lang == self.hash.lang)
		{
			element.show();
		}
		else
		{
			element.hide();
		}
	});
	viewElement.find("select[" + self.config.attr.text + "]").each(function()
	{
		var element = $(this);
		var path = element.attr(self.config.attr.text);
		element.find("option").each(function()
		{
			var optionElement = $(this);
			if(optionElement.css("display") != "none")
			{
				optionElement.prop("selected", true);
				return false;
			}
		});
		if(path != "true")
		{
			var param = ObjectUtil.parse(element.attr(self.config.attr.textParam));
			var options = self._translation(path, self.text, prefix, param);
			if(isObject(options))
			{
				for(var value in options)
				{
					var text = options[value];
					var option = element.find("option[lang='" + self.hash.lang + "'][value='" + value + "']");
					if(option.length == 0)
					{
						option = $("<option />");
						option.attr("lang", self.hash.lang);
						option.val(value);
						option.text(text);
						element.append(option);
					}
				}
			}
		}
	});
	viewElement.find("[" + self.config.attr.text + "]:not([" + self.config.attr.text + "]:has(> [lang='" + self.hash.lang + "']))").each(function()
	{
		var element = $(this);
		var path = element.attr(self.config.attr.text);
		if(path != "true")
		{
			var param = ObjectUtil.parse(element.attr(self.config.attr.textParam));
			var value = self._translation(path, self.text, prefix, param);
			value = isSet(value) ? value : "";
			element.append($("<span></span>").attr("lang", self.hash.lang).html(value));
		}
	});
	viewElement.find("[" + self.config.attr.textAttr + "]").each(function()
	{
		var element = $(this);
		var attrString = element.attr(self.config.attr.textAttr);
		if(isValidString(attrString))
		{
			var attrs = attrString.split(",");
			for(var i in attrs)
			{
				var attr = attrs[i];
				if(isValidString(attr))
				{
					var path = "true";
					var attrParts = attr.split(":");
					if(attrParts.length == 2)
					{
						attr = attrParts[0];
						path = attrParts[1];
					}
					var value = element.attr("data-" + attr + "-" + self.hash.lang);
					if(!isValidString(value) && path != "true")
					{
						var param = ObjectUtil.parse(element.attr(self.config.attr.textAttr));
						var value = self._translation(path, self.text, prefix, param);
						value = isSet(value) ? value : "";
					}
					element.attr(attr, value);
				}
			}
		}
	});
};


roth.lib.js.web.Web.prototype._translation = function(path, text, prefix, param)
{
	var self = this;
	var object = null;
	if(isValidString(prefix))
	{
		object = ObjectUtil.find(text, prefix + path);
	}
	if(isNull(object))
	{
		object = ObjectUtil.find(text, path);
	}
	if(!isEmpty(param))
	{
		if(isString(object))
		{
			object = this.template.render(object, param);
		}
		else if(isObject(object))
		{
			forEach(object, function(value, name)
			{
				object[name] =  self.template.render(value, param);
			});
		}
	}
	return object;
};


roth.lib.js.web.Web.prototype._defaults = function(viewElement)
{
	var self = this;
	// select value
	viewElement.find("select[value], select[placeholder]").each(function()
	{
		var element = $(this);
		var selected = false;
		var value = element.attr("value");
		if(isValidString(value))
		{
			var option = element.find("option[value='" + value + "']");
			if(option.length > 0)
			{
				option.first().prop("selected", true);
				selected = true;
			}
		}
		var placeholder = element.attr("placeholder");
		if(isValidString(placeholder))
		{
			var color = element.css("color");
			if(!selected)
			{
				selected = element.find("option[selected]").length > 0;
			}
			element.prepend($("<option />").prop("selected", !selected).val("").css("display", "none").text(placeholder));
			var change = function()
			{
				if(element.val() == "")
				{
					element.css("color", "#999");
					element.find("option, optgroup").css("color", color);
				}
				else
				{
					element.css("color", color);
				}
			};
			element.change(change);
			change();
		}
	});
	// radio group value
	viewElement.find("[" + self.config.attr.radioValue + "]").each(function()
	{
		var element = $(this);
		var value = element.attr(self.config.attr.radioValue);
		var radio = element.find("input[type=radio][value='" + value + "']");
		if(radio.length > 0)
		{
			radio.first().prop("checked", true);
		}
		else
		{
			element.find("input[type=radio]").first().prop("checked", true);
		}
	});
	// checkbox value
	viewElement.find("input[type=checkbox][" + self.config.attr.checkboxValue + "]").each(function()
	{
		var element = $(this);
		var value = element.attr(self.config.attr.checkboxValue);
		if(isSet(value) && value.toLowerCase() == "true")
		{
			element.prop("checked", true);
		}
	});
};


roth.lib.js.web.Web.prototype._bind = function(viewElement, view, viewType)
{
	var self = this;
	viewElement.find("[" + this.config.attr.field + "]").each(function()
	{
		var element = $(this);
		var field = element.attr(self.config.attr.field);
		if(!isSet(view[field]))
		{
			view[field] = element;
		}
	});
	this._bindEvent(viewElement, view, viewType, "click", this.config.attr.onclick);
	this._bindEvent(viewElement, view, viewType, "dblclick", this.config.attr.ondblclick);
	this._bindEvent(viewElement, view, viewType, "change", this.config.attr.onchange);
	this._bindEvent(viewElement, view, viewType, "blur", this.config.attr.onblur);
	this._bindEvent(viewElement, view, viewType, "focus", this.config.attr.onfocus);
	this._bindEvent(viewElement, view, viewType, "keyup", this.config.attr.onkeyup);
};


roth.lib.js.web.Web.prototype._bindEvent = function(viewElement, view, viewType, eventType, eventAttr)
{
	var self = this;
	viewElement.find("[" + eventAttr + "]").each(function()
	{
		var element = $(this);
		var code = element.attr(eventAttr);
		element.on(eventType, function(event)
		{
			var scope =
			{
				config : self.config,
				register : self.register,
				hash : self.hash,
				text : self.text,
				context : self.context,
				element : element,
				event : event,
				eventType : eventType
			};
			scope.data = isSet(view.data) ? view.data : {};
			scope[viewType] = view;
			if("layout" != viewType)
			{
				scope.layout = self.layout;
				if("page" != viewType)
				{
					scope.page = self.page;
				}
			}
			self._eval(code, element[0], scope);
		});
	});
};


roth.lib.js.web.Web.prototype._eval = function(code, node, scope)
{
	var names = [];
	var values = [];
	forEach(scope, function(value, name)
	{
		names.push(name);
		values.push(value);
	});
	return new Function(names.join(), code).apply(node, values);
};


roth.lib.js.web.Web.prototype.groupElements = function(element, active)
{
	active = isSet(active) ? active : true;
	var selector = "";
	selector += "input[name][type=hidden]" + (active ? ":enabled" : "") + ", ";
	selector += "input[name][type!=hidden][type!=radio][" + this.config.attr.required + "]" + (active ? ":include" : "") + ", ";
	selector += "select[name][" + this.config.attr.required + "]" + (active ? ":include" : "") + ", ";
	selector += "textarea[name][" + this.config.attr.required + "]" + (active ? ":include" : "") + ", ";
	selector += "[" + this.config.attr.radioGroup + "][" + this.config.attr.required + "]:has(input[name][type=radio]" + (active ? ":include" : "") + ") ";
	return element.find(selector);
}


roth.lib.js.web.Web.prototype.request = function(element, service, method)
{
	var self = this;
	var elementRegExp = new RegExp("^(\\w+)(?:\\[|$)");
	var indexRegExp = new RegExp("\\[(\\d+)?\\]", "g");
	var valid = true;
	var request = this.hash.cloneParam();
	var fields = [];
	this.groupElements(element).each(function()
	{
		var field = self.validate($(this));
		if(!field.valid)
		{
			valid = false;
		}
		if(isDebug())
		{
			fields.push(field);
		}
		if(valid && isValidString(field.name) && isValid(field.value))
		{
			var tempObject = request;
			var names = field.name.split(".");
			for(var i in names)
			{
				var lastElement = (i == names.length - 1);
				var elementMatcher = elementRegExp.exec(names[i]);
				if(elementMatcher)
				{
					var elementName = elementMatcher[1];
					var indexes = [];
					var indexMatcher;
					while((indexMatcher = indexRegExp.exec(names[i])) !== null)
					{
						var index = indexMatcher[1];
						indexes.push(index ? parseInt(index) : -1);
					}
					if(indexes.length > 0)
					{
						var tempElement = tempObject[elementName];
						if(!isArray(tempElement))
						{
							tempElement = [];
							tempObject[elementName] = tempElement;
						}
						tempObject = tempElement;
						for(var j in indexes)
						{
							var index = indexes[j];
							var lastIndex = (j == indexes.length - 1);
							if(!lastIndex)
							{
								var tempElement = tempObject[index];
								if(!isArray(tempElement))
								{
									tempElement = [];
									tempObject[index] = tempElement;
								}
								tempObject = tempElement;
							}
							else
							{
								var tempElement = null;
								if(index >= 0)
								{
									if(lastElement)
									{
										tempElement = field.value
										tempObject[index] = tempElement;
									}
									else if(isSet(tempObject[index]))
									{
										tempElement = tempObject[index];
									}
									else
									{
										tempElement = {};
										tempObject[index] = tempElement;
									}
								}
								else
								{
									tempElement = lastElement ? field.value : {};
									tempObject.push(tempElement);
								}
								tempObject = tempElement;
							}
						}
					}
					else
					{
						if(!lastElement)
						{
							var tempElement = tempObject[elementName];
							if(!isObject(tempElement))
							{
								tempElement = {};
								tempObject[elementName] = tempElement;
							}
							tempObject = tempElement;
						}
						else
						{
							tempObject[elementName] = field.value;
						}
					}
				}
			}
		}
	});
	if(valid)
	{
		return request;
	}
	else
	{
		if(isDebug())
		{
			var i = fields.length;
			while(i--)
			{
				if(fields[i].valid)
				{
					fields.splice(i, 1);
				}
				else
				{
					delete fields[i].element;
				}
			}
			var group = "INVALID" + (isValidString(service) && isValidString(method) ? " : " + service + " / " + method : "");
			var log = "\n\n" + JSON.stringify(fields, null, 4) + "\n\n";
			console.groupCollapsed(group);
			console.log(log);
			console.groupEnd();
		}
		return null;
	}
};


roth.lib.js.web.Web.prototype.update = function(element)
{
	var self = this;
	element = this.element(element);
	var field = this.validate(element);
	if(field.valid && field.name)
	{
		var updateValue = element.attr(this.config.attr.updateValue);
		if(field.value != updateValue)
		{
			var request = this.hash.cloneParam();
			request.name = field.name;
			request.value = field.value;
			this.submit(element, request, function()
			{
				element.attr(self.config.attr.updateValue, field.value);
			},
			function()
			{
				element.val(element.attr(self.config.attr.updateValue));
			});
		}
	}
};


roth.lib.js.web.Web.prototype.submit = function(element, request, success, error, complete)
{
	var self = this;
	element = this.element(element);
	var disable = element.attr(this.config.attr.disable);
	var submitGroup = element.attr(this.config.attr.submitGroup);
	var prerequest = element.attr(this.config.attr.prerequest);
	var presubmit = element.attr(this.config.attr.presubmit);
	var service = element.attr(this.config.attr.service);
	var method = element.attr(this.config.attr.method);
	var successAttr = element.attr(this.config.attr.success);
	var errorAttr = element.attr(this.config.attr.error);
	var disabler = this.register.disabler[disable];
	submitGroup = isValidString(submitGroup) ? submitGroup : method;
	var groupElement = $("[" + this.config.attr.group + "='" + submitGroup + "']");
	var scope =
	{
		config : self.config,
		register : self.register,
		hash : self.hash,
		text : self.text,
		context : self.context,
		element : element,
		groupElement : groupElement
	};
	if(!isFunction(disabler))
	{
		disabler = this.register.disabler._default;
	}
	if(isFunction(disabler))
	{
		disabler(element, true);
	}
	if(isValidString(prerequest))
	{
		if(this._eval("return " + prerequest, element[0], scope) === false)
		{
			if(isFunction(disabler))
			{
				disabler(element, false);
			}
			return;
		}
	}
	if(!isObject(request))
	{
		request = this.request(groupElement, service, method);
	}
	if(isObject(request))
	{
		$.extend(true, request, ObjectUtil.parse(element.attr(this.config.attr.request)));
		scope.request = request;
		if(isValidString(presubmit))
		{
			if(this._eval("return " + presubmit, element[0], scope) === false)
			{
				if(isFunction(disabler))
				{
					disabler(element, false);
				}
				return;
			}
		}
		if(isValidString(service) && isValidString(method))
		{
			this.service(service, method, request, function(data)
			{
				scope.data = data;
				if(isFunction(disabler))
				{
					disabler(element, false);
				}
				if(isFunction(success))
				{
					success(data, request, element);
				}
				if(isValidString(successAttr))
				{
					self._eval(successAttr, element[0], scope);
				}
			},
			function(errors)
			{
				scope.errors = errors;
				if(isFunction(disabler))
				{
					disabler(element, false);
				}
				if(isFunction(error))
				{
					error(errors, request, element);
				}
				if(isValidString(errorAttr))
				{
					self._eval(errorAttr, element[0], scope);
				}
			},
			function()
			{
				if(isFunction(complete))
				{
					complete();
				}
			},
			submitGroup);
		}
	}
	else
	{
		if(isFunction(disabler))
		{
			disabler(element, false);
		}
	}
};


roth.lib.js.web.Web.prototype.element = function(element, selector)
{
	if(element instanceof jQuery)
	{
		return element;
	}
	else if(element.nodeType)
	{
		return $(element);
	}
	else if(isString(element))
	{
		if(isString(selector))
		{
			return $(selector.replace("{name}", element));
		}
		else
		{
			return $(element);
		}
	}
	else
	{
		return element;
	}
};


roth.lib.js.web.Web.prototype.filter = function(element)
{
	var self = this;
	element = this.element(element);
	var field = {};
	field.element = element;
	field.name = element.attr(this.config.attr.radioGroup);
	field.value = null;
	field.formValue = null;
	field.tag = element.prop("tagName").toLowerCase();
	field.type = null;
	field.filter = element.attr(this.config.attr.filter);
	if(field.name)
	{
		field.formValue = element.find("input[type=radio][name='" + field.name + "']:include:checked").val();
		field.value = field.formValue;
	}
	else
	{
		field.name = element.attr("name");
		field.type = element.attr("type");
		if(field.type == "checkbox")
		{
			var value = element.val();
			if(isSet(value))
			{
				field.value = element.is(":checked") ? value : null;
			}
			else
			{
				field.value = element.is(":checked");
			}
		}
		else if(field.type == "file")
		{
			field.value = element.attr(this.config.attr.fileValue);
		}
		else
		{
			field.formValue = element.val();
			field.value = field.formValue;
			if(isValidString(field.value))
			{
				field.value = field.value;
				if(isValidString(field.filter))
				{
					var scope =
					{
						config : self.config,
						register : self.register,
						hash : self.hash,
						text : self.text,
						context : self.context,
						element : element,
						field : field,
						value : field.value
					};
					for(var name in this.register.filterer)
					{
						scope[name] = this.register.filterer[name];
					}
					field.value = this._eval("return " + field.filter, element[0], scope);
				}
			}
		}
	}
	return field;
};


roth.lib.js.web.Web.prototype.validateGroup = function(element)
{
	var self = this;
	var validGroup = true;
	this.groupElements(element).each(function()
	{
		var field = self.validate($(this));
		if(!field.valid)
		{
			validGroup = false;
		}
	});
	return validGroup;
};


roth.lib.js.web.Web.prototype.validate = function(element)
{
	var self = this;
	element = this.element(element);
	var field = this.filter(element);
	field.visible = element.is(":visible");
	field.required =  StringUtil.equals(element.attr(this.config.attr.required), "true");
	field.defined = !isEmpty(field.value);
	field.valid = !(field.required && !field.defined) ? true : false;
	field.validate = element.attr(this.config.attr.validate);
	if(field.visible && (field.required || field.defined))
	{
		if(isValidString(field.validate))
		{
			var scope =
			{
				config : self.config,
				register : self.register,
				hash : self.hash,
				text : self.text,
				context : self.context,
				element : element,
				field : field,
				value : field.value
			};
			for(var name in this.register.validator)
			{
				scope[name] = this.register.validator[name];
			}
			field.valid = this._eval("return " + field.validate, element[0], scope);
		}
	}
	this.feedback(element, field);
	return field;
};


roth.lib.js.web.Web.prototype.file = function(element, callback)
{
	var self = this;
	element = this.element(element);
	var files = element[0].files;
	if(files.length > 0)
	{
		var file = files[0];
		if(file)
		{
			var reader  = new FileReader();
			reader.onload = function(event)
			{
				element.attr(self.config.attr.fileValue, reader.result);
				if(isFunction(callback))
				{
					callback(reader.result);
				}
			};
			reader.readAsDataURL(file);
		}
	}
};


roth.lib.js.web.Web.prototype.feedback = function(element, field)
{
	var self = this;
	element = this.element(element);
	var module = this.hash.getModule();
	var page = this.hash.getPage();
	var feedback = element.attr(this.config.attr.feedback);
	var feedbacker = this.register.feedbacker[feedback];
	if(!isFunction(feedbacker))
	{
		 feedbacker = this.register.feedbacker._default;
	}
	if(isFunction(feedbacker))
	{
		feedbacker(element, field);
	}
};


roth.lib.js.web.Web.prototype.resetGroups = function()
{
	this.resetGroupsValidation();
	this.resetGroupsValue();
};


roth.lib.js.web.Web.prototype.resetGroup = function(element)
{
	this.resetGroupValidation(element);
	this.resetGroupValue(element);
};


roth.lib.js.web.Web.prototype.reset = function(element)
{
	this.resetValidation(element);
	this.resetValue(element);
};


roth.lib.js.web.Web.prototype.resetGroupsValidation = function()
{
	var self = this;
	$("[" + this.config.attr.group + "]").each(function()
	{
		self.resetGroupValidation($(this));
	});
};


roth.lib.js.web.Web.prototype.resetGroupValidation = function(element)
{
	var self = this;
	element = this.element(element, "[" + this.config.attr.group + "='{name}']");
	this.groupElements(element, false).each(function()
	{
		self.resetValidation($(this));
	});
};


roth.lib.js.web.Web.prototype.resetValidation = function(element)
{
	this.feedback(element);
};


roth.lib.js.web.Web.prototype.resetGroupsValue = function()
{
	var self = this;
	$("[" + this.config.attr.group + "]").each(function()
	{
		self.resetGroupValue($(this));
	});
	this._defaults(element);
};


roth.lib.js.web.Web.prototype.resetGroupValue = function(element)
{
	var self = this;
	element = this.element(element, "[" + this.config.attr.group + "='{name}']");
	this.groupElements(element, false).each(function()
	{
		self.resetValue($(this));
	});
};


roth.lib.js.web.Web.prototype.resetValue = function(element)
{
	this.feedback(element);
	var tag = element.prop("tagName").toLowerCase();
	var type = element.attr("type");
	element.val("");
	if(type == "file")
	{
		element.attr(this.config.attr.fileValue, "");
	}
};


roth.lib.js.web.Web.prototype.key = function(key, event, callback)
{
	var keyCode = event.which || event.keyCode;
	if(keyCode == key)
	{
		if(isFunction(callback))
		{
			callback($(event.target), event);
		}
	}
};


roth.lib.js.web.Web.prototype.escape = function(event, callback)
{
	this.key(27, event, callback);
};


roth.lib.js.web.Web.prototype.enter = function(event, callback)
{
	this.key(13, event, callback);
};


roth.lib.js.web.Web.prototype.enterSubmit = function(event)
{
	var self = this;
	var callback = function(element)
	{
		var groupElement = element.closest("[" + self.config.attr.group + "]");
		if(groupElement.length > 0)
		{
			var group = groupElement.attr(self.config.attr.group);
			if(isSet(group))
			{
				var submitElement = groupElement.find("[" + self.config.attr.submitGroup + "='" + group + "'], [" + self.config.attr.method + "='" + group + "']");
				if(submitElement.length > 0)
				{
					self.submit(submitElement);
				}
			}
		}
	};
	this.key(13, event, callback);
};


