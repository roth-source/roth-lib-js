

var roth = roth || {};
roth.lib = roth.lib || {};
roth.lib.js = roth.lib.js || {};
roth.lib.js.web = roth.lib.js.web || {};


roth.lib.js.web.Web = roth.lib.js.web.Web || (function()
{
	
	var Web = function(app, moduleDependencies)
	{
		this.config =
		{
			jqueryScript 		: "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.0/jquery.js",
			defaultLang 		: "en",
			endpoint 			: "endpoint",
			service 			: "service",
			csrfToken 			: "csrfToken",
			xCsrfToken 			: "X-Csrf-Token",
			layoutId			: "layout",
			pageId				: "page",
			pageClass			: "",
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
				requestError	: "data-request-error",
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
				oninput			: "data-oninput",
				onpaste			: "data-onpaste",
				onkeypress		: "data-onkeypress",
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
		this._loadId = null;
		
		this.template = new roth.lib.js.template.Template();
		this.register = new roth.lib.js.web.Register(app, moduleDependencies, this.template);
		this.hash =  new roth.lib.js.web.Hash();
		this.dev = null;
		
		this.text = {};
		this.layout = null;
		this.page = null;
		this.context = {};
		
		this.handler = 
		{
			change			: null,	
			endpoint		: {},
			filterer		: {},
			validator		: {},
			disabler		: {},
			loader			: {},
			redirector		: {},
			feedbacker		: {}
		};
		
		this.handler.filterer.replace = function(value, regExp, replacement)
		{
			replacement = isSet(replacement) ? replacement : "";
			return value.replace(regExp, replacement);
		};
		
		this.handler.filterer.number = function(value)
		{
			return value.replace(/[^0-9]/g, "");
		};
		
		this.handler.filterer.decimal = function(value)
		{
			return value.replace(/[^0-9.]/g, "");
		};
		
		this.handler.filterer.int = function(value)
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
		
		this.handler.filterer.float = function(value)
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
		
		this.handler.filterer.currency = function(value)
		{
			return CurrencyUtil.parse(value);
		};
		
		this.handler.validator.test = function(value, regExp)
		{
			return regexp.test(value);
		};
		
		this.handler.validator.email = function(value)
		{
			return (/^[A-Za-z0-9_\-\+]+(?:\.[A-Za-z0-9_\-]+)*@([A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,})$/).test(value);
		};
		
		this.handler.validator.phone = function(value)
		{
			return (/^[0-9]{10}$/).test(value);
		};
		
		this.handler.validator.zip = function(value)
		{
			return (/^[0-9]{5}$/).test(value);
		};
		
		this.handler.validator.number = function(value)
		{
			return (/^[0-9]+(\.[0-9]{1,2})?$/).test(value);
		};
		
		this.handler.validator.confirm = function(value, id)
		{
			var value2 = $("#" + id).val();
			return value == value2;
		};
		
		this.handler.validator.date = function(value, pattern)
		{
			return DateUtil.isValid(pattern, value);
		};
		
	};
	
	Web.prototype.init = function()
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
			var load = function()
			{
				if(self._isLoadable())
				{
					if(isFunction(self.handler.change))
					{
						self.handler.change(self.hash);
					}
					self._loadId = IdUtil.generate();
					self._loadLayout(self._loadId);
				}
			}
			window.addEventListener("hashchange", load, false);
			document.addEventListener("DOMContentLoaded", function()
			{
				if(!self._inited)
				{
					self._inited = true;
					load();
				}
			});
		}
	};


	Web.prototype._initStorage = function()
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


	Web.prototype._initConsole = function()
	{
		var console = window.console;
		if(console && !isDev() && !isDebug())
		{
			var noop = function(){};
			for(var method in console)
			{
				if(isFunction(console[method]) && Object.prototype.hasOwnProperty.call(console, method))
				{
					console[method] = noop;
				}
			}
			console.json = noop;
		}
		else
		{
			console.json = function(object)
			{
				console.log(JSON.stringify(object, null, 4));
			};
		}
	};


	Web.prototype._initJquery = function()
	{
		var self = this;
		jQuery.expr[":"].include = function(node, index, match)
		{
			var element = $(node);
			return element.is(":enabled") && (element.is(":visible") || isTrue(element.attr(self.config.attr.include)));
		};
	};


	Web.prototype._loadModuleDependencies = function(module)
	{
		var self = this;
		forEach(this.moduleDependencies[module].slice().reverse(), function(module)
		{
			self._loadModule(module);
		});
		this._loadModule(module);
	};


	Web.prototype._loadModule = function(module)
	{
		if(isCompiled() && !inArray(module, this._loadedModules))
		{
			var url = "app/" + this.app + "/" + module + ".js?key=" + roth.lib.js.cache.key;
			$.ajax(
			{
				url:url,
				dataType:"script",
				cache:true,
				async:false
			});
			this._loadedModules.push(module);
		}
	};


	Web.prototype._isLoadable = function()
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
							if(isSet(this.layout))
							{
								this.layout._change(changeParam);
							}
							if(isSet(this.page))
							{
								this.page._change(changeParam);
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


	Web.prototype._allowedParams = function(config)
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


	Web.prototype._initMethod = function(name)
	{
		var initMethod = "init";
		forEach(name.replace(/[^a-zA-Z_0-9]/g, "_").split("_"), function(value)
		{
			initMethod += StringUtil.capitalize(value)
		});
		return initMethod;
	};
	
	
	Web.prototype.layoutElement = function()
	{
		return $("#" + this.config.layoutId);
	};
	
	
	Web.prototype.pageElement = function()
	{
		return $("#" + this.config.pageId);
	};
	
	
	Web.prototype._continueLoad = function(loadId)
	{
		return !isSet(loadId) || loadId == this._loadId;
	};
	
	Web.prototype._loadLayout = function(loadId)
	{
		var self = this;
		var module = this.hash.getModule();
		var layoutName = !isUndefined(this._pageConfig.layout) ? this._pageConfig.layout : module;
		if(isPrint())
		{
			layoutName = null;
		}
		this.hash.setLayout(layoutName);
		if(this.hash.newLayout || this.hash.newLang)
		{
			var defaultSource = "<div id=\"" + this.config.pageId + "\" class=\"" + this.config.pageClass + "\"><div>";
			var layoutConstructor = this.register.getLayoutConstructor(module, layoutName, defaultSource);
			var layoutConfig = isObject(layoutConstructor.config) ? layoutConstructor.config : {};
			var success = function(data, status, xhr)
			{
				if(self._continueLoad(loadId))
				{
					if(!isObject(data))
					{
						data = {};
					}
					var layout = self.register.constructView(layoutConstructor, data, self);
					var html = self.template.eval(layoutConstructor.source,
					{
						data : data,
						config : self.config,
						register : self.register,
						hash : self.hash,
						text : self.text,
						layout : layout,
						context : self.context
					},
					layout);
					layout._temp = $("<div></div>");
					layout._temp.html(html);
					self._translate(layout._temp, layoutConstructor._module + ".layout." + layoutConstructor._name + ".");
					self._defaults(layout._temp);
					self._bind(layout);
					self.hash.loadedLayout();
					self.layout = layout;
					self._loadComponents(layout, loadId);
					self._readyLayout(loadId);
				}
			};
			var error = function(errors, status, xhr)
			{
				if(isFunction(self.handler.redirector.init))
				{
					self.handler.redirector.init(errors, status, xhr);
				}
			};
			var complete = function(status, xhr)
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
				success();
			}
		}
		else
		{
			this.hash.loadedLayout();
			this._loadPage(loadId);
		}
	};
	
	
	Web.prototype._readyLayout = function(loadId)
	{
		if(this._continueLoad(loadId))
		{
			this.layout._references(this);
			this.layout.element = this.layoutElement();
			this.layout.element.hide();
			this.layout.element.empty().append(this.layout._temp.contents().detach());
			this.layout._ready();
			this.layout.element.show();
			this.layout._visible();
			var loader = this.handler.loader._default;
			if(isFunction(loader))
			{
				loader(this.pageElement(), true);
			}
			this._loadPage(loadId);
		}
	};
	
	
	Web.prototype._loadPage = function(loadId)
	{
		var self = this;
		var pageConstructor = this._pageConstructor;
		var pageConfig = this._pageConfig;
		var success = function(data, status, xhr)
		{
			if(self._continueLoad(loadId))
			{
				if(!isObject(data))
				{
					data = {};
				}
				var page = self.register.constructView(pageConstructor, data, self);
				var html = self.template.eval(pageConstructor.source,
				{
					data : data,
					config : self.config,
					register : self.register,
					hash : self.hash,
					text : self.text,
					layout : self.layout,
					page : page,
					context : self.context
				},
				page);
				page._temp = $("<div></div>");
				page._temp.html(html);
				self._translate(page._temp, pageConstructor._module + ".page." + pageConstructor._name + ".");
				self._defaults(page._temp);
				self._bind(page);
				self.hash.loadedModule();
				self.hash.loadedPage();
				self.hash.loadedValue();
				self.hash.loadedLang();
				self.page = page;
				self._loadComponents(page, loadId);
				self._readyPage(loadId);
			}
		};
		var error = function(errors, status, xhr)
		{
			if(isFunction(self.handler.redirector.init))
			{
				self.handler.redirector.init(errors, status, xhr);
			}
		};
		var complete = function(status, xhr)
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
			success();
		}
	};


	Web.prototype._readyPage = function(loadId)
	{
		if(this._continueLoad(loadId))
		{
			this.layout.page = this.page;
			this.page._references(this);
			this.page.element = this.pageElement();
			this.page.element.hide();
			this.page.element.empty().append(this.page._temp.contents().detach());
			this.page._ready();
			this.page._change();
			this.layout._change();
			var loader = this.handler.loader._default;
			if(isFunction(loader))
			{
				loader(this.page.element, false);
			}
			this.page.element.show();
			this.page._visible();
		}
	};


	Web.prototype._loadComponents = function(view, loadId)
	{
		var self = this;
		var module = this.hash.getModule()
		view._components = [];
		view._temp.find("[" + this.config.attr.component + "]").each(function()
		{
			if(self._continueLoad(loadId))
			{
				var element = $(this);
				var componentName = element.attr(self.config.attr.component);
				var componentConstructor = self.register.getComponentConstructor(module, componentName);
				if(isFunction(componentConstructor))
				{
					var componentConfig = isObject(componentConstructor.config) ? componentConstructor.config : {};
					var data = {};
					var attrData = element.attr(self.config.attr.data);
					if(isSet(attrData))
					{
						data = ObjectUtil.parse(decodeURIComponent(attrData));
					}
					var component = self.register.constructView(componentConstructor, data, self);
					if(isSet(component))
					{
						component.element = element;
						component.parent = view;
						self._loadComponent(component, false, loadId);
						view._components.push(component);
						var reference = element.attr(self.config.attr.reference);
						if(isValidString(reference))
						{
							if(!isSet(view[reference]))
							{
								view[reference] = component;
							}
							else
							{
								console.error(reference + " name is already used on view");
							}
						}
					}
				}
			}
		});
	};


	Web.prototype._loadComponent = function(component, hide, loadId)
	{
		var self = this;
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
		self._translate(component._temp, component.constructor._module + ".component." + component.constructor._name + ".");
		self._defaults(component._temp);
		self._bind(component);
		self._loadComponents(component, loadId);
		if(!isFalse(hide))
		{
			component.element.hide();
		}
		component.element.empty().append(component._temp.contents().detach());
	};


	Web.prototype.service = function(service, method, request, success, error, complete, group, view)
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


	Web.prototype._serviceFile = function(service, method, request, success, error, complete, group, view)
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


	Web.prototype._serviceCall = function(service, method, request, success, error, complete, group, view, scenario, endpoints)
	{
		var self = this;
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var url = null;
		var endpoint = null;
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
			var csrfToken = localStorage.getItem(this.config.csrfToken);
			if(isSet(csrfToken))
			{
				path += "?csrfToken=" + encodeURIComponent(csrfToken);
			}
			if(!isArray(endpoints))
			{
				endpoints = this._endpoints();
			}
			endpoint = this._endpoint(endpoints);
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
		if(isSet(url))
		{
			var errored = false;
			$.ajax(
			{
				type		: type,
				url			: url,
				data		: !isMock() ? JSON.stringify(request) : null,
				contentType	: "text/plain",
				dataType	: "json",
				cache		: false,
				xhrFields	:
				{
					withCredentials : true
				},
				success		: function(response, status, xhr)
				{
					var csrfTokenHeader = xhr.getResponseHeader(self.config.xCsrfToken);
					if(isSet(csrfTokenHeader))
					{
						localStorage.setItem(self.config.csrfToken, csrfTokenHeader);
					}
					self._serviceLog(service, method, url, request, response);
					if(isEmpty(response.errors))
					{
						if(isFunction(success))
						{
							success(response, status, xhr);
						}
					}
					else
					{
						var handled = false;
						var groupElement = isSet(group) ? $("[" + self.config.attr.group + "='" + group + "']") : $();
						forEach(response.errors, function(error)
						{
							switch(error.type)
							{
								case "DATABASE_CONNECTION_EXCEPTION":
								{
									endpoints = self._removeEndpoint(endpoints, endpoint);
									if(isArray(endpoints) && !isEmpty(endpoints))
									{
										self._serviceCall(service, method, request, success, error, complete, group, view, scenario, endpoints);
										handled = true;
									}
									return false;
								}
								case "SERVICE_AJAX_NOT_AUTHENTICATED":
								case "SERVICE_CSRF_TOKEN_INVALID":
								{
									var authRedirector = self.handler.redirector[self._pageConfig.authRedirector];
									if(!isFunction(authRedirector))
									{
										authRedirector = self.handler.redirector.auth;
									}
									if(isFunction(authRedirector))
									{
										authRedirector();
										handled = true;
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
						if(!handled && isFunction(error))
						{
							error(response.errors, status, xhr);
						}
					}
				},
				error		: function(xhr, status, errorMessage)
				{
					if(!errored)
					{
						self._serviceLog(service, method, url, request, status + " - " + errorMessage);
						errored = true;
						endpoints = self._removeEndpoint(endpoints, endpoint);
						if(isArray(endpoints) && !isEmpty(endpoints))
						{
							self._serviceCall(service, method, request, success, error, complete, group, view, scenario, endpoints);
						}
						else if(isFunction(error))
						{
							error({}, status, xhr);
						}
					}
				},
				complete	: function(xhr, status)
				{
					if("success" != status && !errored)
					{
						self._serviceLog(service, method, url, request, status);
						errored = true;
						endpoints = self._removeEndpoint(endpoints, endpoint);
						if(isArray(endpoints) && !isEmpty(endpoints))
						{
							self._serviceCall(service, method, request, success, error, complete, group, view, scenario, endpoints);
						}
						else if(isFunction(error))
						{
							error({}, status, xhr);
						}
					}
					if(isFunction(complete))
					{
						complete(status, xhr);
					}
				}
			});
		}
		else
		{
			// endpoint error stop retrying
		}
	};
	
	
	Web.prototype._serviceLog = function(service, method, url, request, response)
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
	
	
	Web.prototype._endpoints = function()
	{
		var endpoints = this.handler.endpoint[getEnvironment()];
		return isArray(endpoints) ? endpoints.slice() : [];
	};
	
	
	Web.prototype._endpoint = function(endpoints)
	{
		var endpoint = null;
		if(isArray(endpoints) && !isEmpty(endpoints))
		{
			endpoint = sessionStorage.getItem(this.config.endpoint);
			if(!inArray(endpoint, endpoints))
			{
				endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
				sessionStorage.setItem(this.config.endpoint, endpoint);
			}
		}
		return endpoint;
	};

	
	Web.prototype._removeEndpoint = function(endpoints, endpoint)
	{
		if(isArray(endpoints) && !isEmpty(endpoints) && isValidString(endpoint))
		{
			var index = endpoints.indexOf(endpoint);
			if(index > -1)
			{
				endpoints.splice(index, 1);
			}
		}
		sessionStorage.removeItem(this.config.endpoint);
		return endpoints;
	};
	
	
	Web.prototype._translate = function(viewElement, prefix)
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


	Web.prototype._translation = function(path, text, prefix, param)
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


	Web.prototype._defaults = function(viewElement)
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
				var values = [];
				var matches = value.match(/^\[(.*?)\]$/);
				if(!isEmpty(matches))
				{
					values = matches[1].split(",");
				}
				else
				{
					values.push(value);
				}
				forEach(values, function(value)
				{
					var option = element.find("option[value='" + value + "']");
					if(option.length > 0)
					{
						option.first().prop("selected", true);
						selected = true;
					}
				});
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
	
	
	Web.prototype._bind = function(view)
	{
		var self = this;
		view._temp.find("[" + this.config.attr.field + "]").each(function()
		{
			var element = $(this);
			var field = element.attr(self.config.attr.field);
			if(isValidString(field))
			{
				if(!isSet(view[field]))
				{
					view[field] = element;
				}
				else
				{
					console.error(field + " name is already used on view");
				}
			}
		});
		this._bindEvent(view, "click", this.config.attr.onclick);
		this._bindEvent(view, "dblclick", this.config.attr.ondblclick);
		this._bindEvent(view, "change", this.config.attr.onchange);
		this._bindEvent(view, "blur", this.config.attr.onblur);
		this._bindEvent(view, "focus", this.config.attr.onfocus);
		this._bindEvent(view, "scroll", this.config.attr.onscroll);
		this._bindEvent(view, "input", this.config.attr.oninput);
		this._bindEvent(view, "paste", this.config.attr.onpaste);
		this._bindEvent(view, "keypress", this.config.attr.onkeypress);
		this._bindEvent(view, "keyup", this.config.attr.onkeyup);
		this._bindEvent(view, "keyup", this.config.attr.onenter, 13);
		this._bindEvent(view, "keyup", this.config.attr.onescape, 27);
		this._bindEvent(view, "keyup", this.config.attr.onbackspace, 8);
	};
	
	
	Web.prototype._bindEvent = function(view, eventType, eventAttr, key)
	{
		var self = this;
		view._temp.find("[" + eventAttr + "]").each(function()
		{
			var element = $(this);
			var code = element.attr(eventAttr);
			element.on(eventType, function(event)
			{
				if(!isSet(key) || view.key(event, key))
				{
					var scope =
					{
						data : isSet(view.data) ? view.data : {},
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
					view.eval(code, scope);
				}
			});
		});
	};
	
	return Web;
	
})();




