

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
			complete		: "data-complete",
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
			onscroll		: "data-onscroll",
			onkeyup			: "data-onkeyup",
			onenter			: "data-onenter",
			onescape		: "data-onescape",
			onbackspace		: "data-onbackspace"
		}
	};
	
	this.app = app;
	this.moduleDependencies = moduleDependencies;
	this._loadedModules = [];
	this._inited = false;
	this._pageConstructor = null;
	this._pageConfig = null;
	
	this.template = new roth.lib.js.template.Template();
	this.register = new roth.lib.js.web.Register(app, moduleDependencies, this.template);
	this.hash =  new roth.lib.js.web.Hash();
	this.dev = null;
	
	this.text = {};
	this.layout = {};
	this.page = {};
	this.context = {};
	
};


roth.lib.js.web.Web.prototype.init = function()
{
	var self = this;
	if(!this._inited)
	{
		if(!isSet(jQuery))
		{
			document.write('<script src="' + this.config.jqueryScript + '"></script>');
		}
		if(isMock())
		{
			self.dev = new roth.lib.js.web.Dev();
		}
		self._initStorage();
		self._initConsole();
		self._initJquery();
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
				self._inited = true;
				if(self._isLoadable())
				{
					self._loadLayout();
				}
			}
		});
	}
};


roth.lib.js.web.Web.prototype._initStorage = function()
{
	try
	{
		localStorage.setItem("_test", "");
	}
	catch(e)
	{
		var prefix = "cookieStorage_";
		// SET ITEM
		var setItem = function(name, value)
		{
			CookieUtil.set(prefix + name, value);
		};
		localStorage.setItem = setItem;
		sessionStorage.setItem = setItem;
		// GET ITEM
		var getItem = function(name)
		{
			return CookieUtil.get(prefix + name);
		};
		localStorage.getItem = getItem;
		sessionStorage.getItem = getItem;
		// REMOVE ITEM
		var removeItem = function(name)
		{
			CookieUtil.remove(prefix + name);
		};
		localStorage.removeItem = removeItem;
		sessionStorage.removeItem = removeItem;
	}
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
		// CHECK DEPENDENCIES
		var module = this.hash.getModule();
		this._loadModuleDependencies(module);
		// GET PAGE CONSTRUCTOR
		var pageName = this.hash.getPage();
		var pageConstructor = this.register.getPageConstructor(module, pageName);
		if(isFunction(pageConstructor))
		{
			// CHECK LANG
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
			// SET DEFAULT PARAMS
			var pageConfig = isObject(pageConstructor.config) ? pageConstructor.config : {};
			forEach(pageConfig.defaultParams, function(value, name)
			{
				if(!self.hash.hasParam(name))
				{
					self.hash.param[name] = value;
					loadable = false;
				}
			});
			// CHECK FOR ALLOWED PARAMS
			var allowedParams = this._allowedParams(pageConfig);
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
			if(loadable)
			{
				// CHECK FOR CHANGE PARAMS
				if(!this.hash.newPage && !isEmpty(pageConfig.changeParams))
				{
					var changeParam = this.hash.paramChanges(pageConfig.changeParams);
					if(!isEmpty(changeParam))
					{
						if(isFunction(this.layout.change))
						{
							this.layout.change(this.layout.data, changeParam);
						}
						if(isFunction(this.page.change))
						{
							this.page.change(this.page.data, changeParam);
						}
						loadable = false;
					}
				}
				else
				{
					this.hash.changeParam = {};
				}
				if(loadable)
				{
					this.text = this.register.getText(module, this.hash.lang);
					this._pageConstructor = pageConstructor;
					this._pageConfig = pageConfig;
					this.hash.log();
				}
				this.hash.loadedParam();
			}
			else
			{
				// PARAMS MODIFIED
				this.hash.refresh();
			}
		}
		else
		{
			// error no page
		}
	}
	return loadable;
};


roth.lib.js.web.Web.prototype._allowedParams = function(config)
{
	var allowedParams = [];
	if(!isNull(config.allowedParams))
	{
		if(isArray(config.allowedParams))
		{
			forEach(config.allowedParams, function(name)
			{
				allowedParams.push(name);
			});
		}
		forEach(config.changeParams, function(name)
		{
			allowedParams.push(name);
		});
		forEach(config.defaultParams, function(value, name)
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
	var module = this.hash.getModule();
	var layoutName = !isUndefined(this._pageConfig.layout) ? this._pageConfig.layout : module;
	this.hash.setLayout(layoutName);
	if(isSet(layoutName) && this.hash.newLayout)
	{
		var layoutConstructor = this.register.getLayoutConstructor(module, layoutName);
		if(isFunction(layoutConstructor))
		{
			var layoutConfig = isObject(layoutConstructor.config) ? layoutConstructor.config : {};
			this.layout = this.register.constructView(layoutConstructor, this);
			if(isObject(this.layout))
			{
				var success = function(data, status, xhr)
				{
					self.layout.data = isObject(data) ? data : {};
					var html = self.template.eval(layoutConstructor.source,
					{
						data : self.layout.data,
						config : self.config,
						register : self.register,
						hash : self.hash,
						text : self.text,
						layout : self.layout,
						context : self.context
					},
					self.layout);
					self.layout._temp = $("<div></div>");
					self.layout._temp.html(html);
					self._translate(self.layout._temp, "layout." + layoutConstructor._module + "." + (layoutConstructor._name.replace(/\//g, ".")) + ".");
					self._defaults(self.layout._temp);
					self._bind(self.layout._temp, self.layout);
					self._loadComponents(self.layout, self.layout._temp);
					self.hash.loadedLayout();
					self._readyLayout();
				};
				var error = function(xhr, status, errorMessage)
				{
					self.layout._temp = $("<div></div>").attr("id", self.config.pageId);
					self._readyLayout();
				};
				var complete = function(xhr, status)
				{
					
				};
				var method = !isUndefined(layoutConfig.init) ? layoutConfig.init : this._initMethod(this.hash.layout);
				if(isValidString(method))
				{
					var service = isValidString(layoutConfig.service) ? layoutConfig.service : this.hash.getModule();
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
				// error
			}
		}
		else
		{
			// error
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
	if(isFunction(this.layout.change))
	{
		this.layout.change(this.layout.data, this.hash.changeParam);
	}
	forEach(this.layout._components, function(component)
	{
		if(isFunction(component.change))
		{
			component.change(self.layout.data, self.hash.changeParam);
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
	var pageConstructor = this._pageConstructor;
	var pageConfig = this._pageConfig;
	this.page = this.register.constructView(pageConstructor, this);
	var success = function(data, status, xhr)
	{
		self.page.data = isObject(data) ? data : {};
		var html = self.template.eval(pageConstructor.source,
		{
			data : self.page.data,
			config : self.config,
			register : self.register,
			hash : self.hash,
			text : self.text,
			layout : self.layout,
			page : self.page,
			context : self.context
		},
		self.page);
		self.page._temp = $("<div></div>");
		self.page._temp.html(html);
		self._translate(self.page._temp, "page." + pageConstructor._module + "." + (pageConstructor._name.replace(/\//g, ".")) + ".");
		self._defaults(self.page._temp);
		self._bind(self.page._temp, self.page);
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
	var method = !isUndefined(pageConfig.init) ? pageConfig.init : this._initMethod(this.hash.getPage());
	if(isValidString(method))
	{
		var service = isValidString(pageConfig.service) ? pageConfig.service : this.hash.getModule();
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
	if(isFunction(this.page.change))
	{
		this.page.change(this.page.data, this.hash.changeParam);
	}
	forEach(this.page._components, function(component)
	{
		if(isFunction(component.change))
		{
			component.change(self.page.data, self.hash.changeParam);
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
		var componentConstructor = self.register.getComponentConstructor(module, componentName);
		if(isFunction(componentConstructor))
		{
			var componentConfig = isObject(componentConstructor.config) ? componentConstructor.config : {};
			var component = self.register.constructView(componentConstructor, self);
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
		}
	});
};


roth.lib.js.web.Web.prototype._loadComponent = function(component, data, hide)
{
	var self = this;
	component.data = isObject(data) ? data : {};
	var html = self.template.eval(component.constructor.source,
	{
		data : component.data,
		config : self.config,
		register : self.register,
		hash : self.hash,
		text : self.text,
		layout : self.layout,
		page : self.page,
		component : component,
		context : self.context
	},
	component);
	component._temp = $("<div></div>");
	component._temp.html(html);
	self._translate(component._temp, "component." + component.constructor._module + "." + (component.constructor._name.replace(/\//g, ".")) + ".");
	self._defaults(component._temp);
	self._bind(component._temp, component);
	if(!isFalse(hide))
	{
		component.element.hide();
	}
	component.element.empty().append(component._temp.contents().detach());
};


roth.lib.js.web.Web.prototype.service = function(service, method, request, success, error, complete, group, view)
{
	if(isMock())
	{
		this._serviceFile(service, method, request, success, error, complete, group, view);
	}
	else
	{
		this._serviceCall(service, method, request, success, error, complete, group, view);
	}
};


roth.lib.js.web.Web.prototype._serviceFile = function(service, method, request, success, error, complete, group, view)
{
	var self = this;
	var scenarios = this.dev.getResponseScenarios(service, method);
	if(scenarios.length > 0)
	{
		if(isMockDemo())
		{
			this._serviceCall(service, method, request, success, error, complete, group, view, scenarios[0]);
		}
		else
		{
			this.dev.select(service + "/" + method, scenarios, function(scenario)
			{
				self._serviceCall(service, method, request, success, error, complete, group, view, scenario);
			});
		}
	}
	else
	{
		this._serviceCall(service, method, request, success, error, complete, group, view);
	}
};


roth.lib.js.web.Web.prototype._serviceCall = function(service, method, request, success, error, complete, group, view, scenario)
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
								view.feedback(element, { valid : false });
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


roth.lib.js.web.Web.prototype._bind = function(viewElement, view)
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
	this._bindEvent(viewElement, view, "click", this.config.attr.onclick);
	this._bindEvent(viewElement, view, "dblclick", this.config.attr.ondblclick);
	this._bindEvent(viewElement, view, "change", this.config.attr.onchange);
	this._bindEvent(viewElement, view, "blur", this.config.attr.onblur);
	this._bindEvent(viewElement, view, "focus", this.config.attr.onfocus);
	this._bindEvent(viewElement, view, "scroll", this.config.attr.onscroll);
	this._bindEvent(viewElement, view, "keyup", this.config.attr.onkeyup);
	this._bindEvent(viewElement, view, "keyup", this.config.attr.onenter, 13);
	this._bindEvent(viewElement, view, "keyup", this.config.attr.onescape, 27);
	this._bindEvent(viewElement, view, "keyup", this.config.attr.onbackspace, 8);
};


roth.lib.js.web.Web.prototype._bindEvent = function(viewElement, view, eventType, eventAttr, key)
{
	var self = this;
	viewElement.find("[" + eventAttr + "]").each(function()
	{
		var element = $(this);
		var code = element.attr(eventAttr);
		element.on(eventType, function(event)
		{
			if(!isSet(key) || view.key(event, key))
			{
				var scope =
				{
					data : view.data,
					config : self.config,
					register : self.register,
					hash : self.hash,
					text : self.text,
					layout : self.layout,
					page : self.page,
					context : self.context,
					node : element[0],
					element : element,
					event : event,
					eventType : eventType
				};
				scope.data = isSet(view.data) ? view.data : {};
				view.eval(code, scope);
			}
		});
	});
};



