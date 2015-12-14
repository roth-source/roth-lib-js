

/**
 * @class
 */
roth.lib.js.client.Client = roth.lib.js.client.Client || function()
{
	/**
	 * @lends Client.prototype
	 */
	
	var self = this;
	var inited = false;
	
	/**
	 * The clients instance of the config.
	 * @member {Config}
	 */
	this.config = new roth.lib.js.client.Config();
	
	/**
	 * The clients instance of the current hash.
	 * @member {Hash}
	 */
	this.hash = new roth.lib.js.client.Hash();
	
	/**
	 * The clients instance of the queue.
	 * @member {Queue}
	 */
	this.queue = new roth.lib.js.client.Queue();
	
	/**
	 * The clients instance of the dev only class.
	 * @member {Dev}
	 */
	this.dev = null;
	
	/**
	 * A scope object for storing text for current lang translation
	 * @member {Object}
	 */
	this.text = {};
	
	/**
	 * A scope object for functions and variables in the current layout scope.
	 * @member {Object}
	 */
	this.layout = {};
	
	/**
	 * A scope object for functions and variables in the current page scope.
	 * @member {Object}
	 */
	this.page = {};
	
	/**
	 * A scope object for functions and variables manually managed by the application.
	 * @member {Object}
	 */
	this.context = {};
	
	/**
	 * inits the client framework
	 * @method
	 */
	this.init = function()
	{
		this.checkJquery();
		this.checkDev();
		window.addEventListener("hashchange", function()
		{
			self.load();
		},
		false);
		document.addEventListener("DOMContentLoaded", function()
		{
			if(!inited)
			{
				inited = true;
				self.loadConfig(function()
				{
					self.initConsole();
					self.initJquery();
					self.initConfig();
					self.initDev();
					self.load();
				});
			}
		});
	}
	
	/**
	 * loads jquery if not loaded
	 * @method
	 */
	this.checkJquery = function()
	{
		if(!isSet(jQuery))
		{
			document.write('<script src="' + this.config.getJqueryScript() + '"></script>');
		}
	};
	
	/**
	 * loads dev related assets if dev environment
	 * @method
	 */
	this.checkDev = function()
	{
		if(isDev())
		{
			if(typeof roth.lib.js.template == "undefined" || typeof roth.lib.js.template.Template == "undefined")
			{
				document.write('<script src="' + this.config.getDevTemplateScript() + '"></script>');
			}
			if(typeof roth.lib.js.client.dev == "undefined" || typeof roth.lib.js.client.dev.Dev == "undefined")
			{
				document.write('<link href="' + this.config.getDevStyle() + '" rel="stylesheet" type="text/css" />');
				document.write('<script src="' + this.config.getDevScript() + '"></script>');
			}
		}
	};
	
	/**
	 * loads the application config.json data into framework and loads init callback
	 * @method
	 * @param {Function} init
	 */
	this.loadConfig = function(init)
	{
		var configId = this.queue.config(function()
		{
			self.loadResource(self.config.getConfigDataPath(), "json",
			function(data)
			{
				if(isObject(data))
				{
					if(isArray(data.langs))
					{
						self.config.langs = data.langs.concat(self.config.langs);
						self.config.validateLangs();
					}
					if(isObject(data.endpoint))
					{
						$.extend(true, self.config.endpoint, data.endpoint);
					}
					if(isObject(data.layout))
					{
						$.extend(true, self.config.layout, data.layout);
					}
					if(isObject(data.module))
					{
						$.extend(true, self.config.module, data.module);
					}
				}
				self.queue.complete(configId);
			},
			function(errors)
			{
				self.queue.complete(configId);
			});
		});
		if(isDev())
		{
			var devConfigId = this.queue.config(function()
			{
				self.loadResource(self.config.getDevConfigDataPath(), "json",
				function(data)
				{
					if(isObject(data))
					{
						self.config.dev = data;
					}
					self.queue.complete(devConfigId);
				},
				function(errors)
				{
					self.queue.complete(devConfigId);
				});
			});
		}
		var initId = this.queue.callback(function()
		{
			self.queue.complete(initId);
			init();
		});
		this.queue.execute();
	};
	
	/**
	 * removes console functions if not a dev or debug env
	 * @method
	 */
	this.initConsole = function()
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
	
	/**
	 * customizes jquery
	 * @method
	 */
	this.initJquery = function()
	{
		jQuery.expr[":"].notDefaultedValue = function(node, index, match)
		{
			return !isSet($(node).prop("defaulted-value"));
		};
		jQuery.expr[":"].include = function(node, index, match)
		{
			var element = $(node);
			return element.is(":enabled") && (element.is(":visible") || isTrue(element.attr(self.config.fieldIncludeAttribute)));
		};
	};
	
	/**
	 * sets defaults from config object to other objects
	 * @method
	 */
	this.initConfig = function()
	{
		this.hash.defaultModule = this.config.defaultModule;
		this.hash.defaultPage = this.config.defaultPage;
		this.hash.langStorage = this.config.langStorage;
	};
	
	/**
	 * creates instance of dev object if dev environment
	 * @method
	 */
	this.initDev = function()
	{
		if(isDev())
		{
			this.dev = new roth.lib.js.client.dev.Dev(this.config);
		}
	};
	
	/**
	 * loads the application if it is determined to be loadable based on parsed hash and config
	 * @method
	 */
	this.load = function()
	{
		if(this.isLoadable())
		{
			this.hide();
			this.queueText();
			if(this.hash.isNewLayout())
			{
				this.queueLayoutInit();
				this.queueLayout();
				this.queueLayoutReady();
			}
			this.queuePageInit();
			this.queuePage();
			this.queuePageReady();
			this.queueShow();
			this.queue.execute();
		}
	};
	
	/**
	 * checks valid hash, sets lang, checks changed params, and validates param scenarios
	 * @method
	 * @returns {Boolean}
	 */
	this.isLoadable = function()
	{
		var loadable = this.hash.isValid();
		if(loadable)
		{
			var module = this.hash.getModule();
			var page = this.hash.getPage();
			var layout = this.config.getLayout(module, page);
			this.hash.setLayout(layout);
			var text = this.config.getModuleText(module);
			this.hash.setText(text);
			if(!(isSet(this.hash.lang) && this.config.isValidLang(this.hash.lang)))
			{
				var lang = localStorage.getItem(this.hash.langStorage);
				if(this.config.isValidLang(lang))
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
					lang = this.config.isValidLang(lang) ? lang : this.config.defultLang;
					this.hash.setLang(lang);
					localStorage.setItem(this.hash.langStorage, lang);
				}
			}
			if(!this.hash.isNewModule() && !this.hash.isNewPage())
			{
				var changeParams = this.config.getChangeParams(module, page);
				if(isNotEmpty(changeParams))
				{
					var changed = false;
					var loadedParam = this.hash.cloneLoadedParam();
					for(var name in this.hash.param)
					{
						changed = changeParams.indexOf(name) > -1;
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
							this.layout.change(this.layout.init);
						}
						if(isFunction(this.page.change))
						{
							this.page.change(this.page.init);
						}
						loadable = false;
					}
				}
			}
			if(loadable)
			{
				var params = this.config.getParams(module, page);
				if(isNotEmpty(params))
				{
					var errorParamsRedirector = this.config.getErrorParamsRedirector(module, page);
					if(isFunction(errorParamsRedirector))
					{
						for(var i in params)
						{
							var valid = true;
							var param = params[i];
							for(var name in param)
							{
								if(!this.hash.hasParam(name))
								{
									valid = false;
									break;
								}
							}
							if(valid)
							{
								loadable = true;
								break;
							}
						}
						if(!loadable)
						{
							errorParamsRedirector();
						}
					}
				}
			}
		}
		return loadable;
	};
	
	/**
	 * gets the jquery layout container
	 * @method
	 * @returns {jQuery}
	 */
	this.layoutElement = function()
	{
		return $("#" + this.config.layoutId);
	};
	
	/**
	 * gets the jquery page container
	 * @method
	 * @returns {jQuery}
	 */
	this.pageElement = function()
	{
		return $("#" + this.config.pageId);
	};
	
	/**
	 * hides and empties the portion of the app that will be changed
	 * @method
	 */
	this.hide = function()
	{
		this.hash.log();
		this.hash.loadedParam();
		var layout = this.hash.layout;
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var layoutElement = this.layoutElement();
		var pageElement = this.pageElement();
		if(isSet(this.hash.loaded.value) && isSet(this.hash.loaded.layout) && this.hash.isNewLayout())
		{
			layoutElement.hide();
			pageElement.hide();
			pageElement.empty();
			layoutElement.empty();
		}
		else if(isSet(this.hash.loaded.value) && isSet(this.hash.loaded.page))
		{
			pageElement.hide();
			pageElement.empty();
		}
		else
		{
			layoutElement.hide();
			pageElement.hide();
		}
		if(this.hash.isNewLayout())
		{
			this.layout = {};
		}
		this.page = {};
	};
	
	/**
	 * queues loading of text translation
	 * @method
	 */
	this.queueText = function()
	{
		if(this.hash.isNewText() || this.hash.isNewLang())
		{
			var id = this.queue.text(function()
			{
				self.loadText(id);
			});
		}
	};
	
	/**
	 * loads language translation file into text scope object
	 * @method
	 * @param {String} [id]
	 */
	this.loadText = function(id)
	{
		var modulePath = this.config.getModuleTextPath(this.hash.module, this.hash.lang);
		var moduleSuccess = function(text)
		{
			$.extend(true, self.text, text);
			if(isSet(id))
			{
				self.hash.loadedText();
				self.queue.complete(id);
			}
		};
		var moduleError = function(jqXHR, textStatus, errorThrown)
		{
			if(isSet(id))
			{
				self.hash.loadedText();
				self.queue.complete(id);
			}
		};
		var path = this.config.getTextPath("text", this.hash.lang);
		var success = function(text)
		{
			self.text = text;
			if(isSet(modulePath))
			{
				self.loadTextResource(modulePath, moduleSuccess, moduleError);
			}
			else if(isSet(id))
			{
				self.hash.loadedText();
				self.queue.complete(id);
			}
		};
		var error = function(jqXHR, textStatus, errorThrown)
		{
			self.text = {};
			if(isSet(modulePath))
			{
				self.loadTextResource(modulePath, moduleSuccess, moduleError);
			}
			else if(isSet(id))
			{
				self.hash.loadedText();
				self.queue.complete(id);
			}
		};
		this.loadTextResource(path, success, error);
	};
	
	/**
	 * convenience function for loading text resource
	 * @method
	 * @param {String} lang
	 * @param {Function} success
	 * @param {Function} error
	 */
	this.loadTextResource = function(path, success, error)
	{
		this.loadResource(path, "json", success, error);
	};
	
	/**
	 * queues loading of layout init
	 * @method
	 */
	this.queueLayoutInit = function()
	{
		var id = this.queue.init(function()
		{
			self.loadLayoutInit(id);
		});
	};
	
	/**
	 * calls the layout init method and saves response to layout.init
	 * @method
	 * @param {String} id
	 */
	this.loadLayoutInit = function(id)
	{
		var init = this.config.getLayoutInit(this.hash.layout);
		if(isObject(init))
		{
			var request = isObject(init.request) ? init.request : this.hash.param;
			var success = function(data)
			{
				if(isFunction(init.success))
				{
					init.success(data);
				}
				self.layout.init = data || {};
				self.queue.complete(id);
			};
			var error = function(errors)
			{
				if(isFunction(init.error))
				{
					init.error(errors);
				}
				self.layout.init = {};
				self.queue.complete(id);
			};
			this.service(init.service, init.method, request, success, error);
		}
		else
		{
			self.queue.complete(id);
		}
	};
	
	/**
	 * queues loading of page init
	 * @method
	 */
	this.queuePageInit = function()
	{
		var id = this.queue.init(function()
		{
			self.loadPageInit(id);
		});
	};
	
	/**
	 * calls the page init method and saves response to page.init
	 * @method
	 * @param {String} id
	 */
	this.loadPageInit = function(id)
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var init = this.config.getPageInit(module, page);
		if(isObject(init))
		{
			var request = isObject(init.request) ? init.request : this.hash.param;
			var success = function(data)
			{
				if(isFunction(init.success))
				{
					init.success(data);
				}
				self.page.init = data || {};
				self.queue.complete(id);
			};
			var error = function(errors)
			{
				if(isFunction(init.error))
				{
					init.error(errors);
				}
				self.page.init = {};
				self.queue.complete(id);
			};
			this.service(init.service, init.method, request, success, error);
		}
		else
		{
			self.queue.complete(id);
		}
	};
	
	/**
	 * an ajax call to load a static resource
	 * @method
	 * @param {String} path
	 * @param {String} dataType
	 * @param {Function} success
	 * @param {Function} error
	 */
	this.loadResource = function(path, dataType, success, error)
	{
		$.ajax(
		{
			type		: "GET",
			url			: path,
			dataType	: dataType,
			cache		: false,
			ifModified	: false,
			success		: success,
			error		: error
		});
	};
	
	/**
	 * queues loading of layout template
	 * @method
	 */
	this.queueLayout = function()
	{
		var id = this.queue.layout(function()
		{
			self.loadLayout(id);
		});
	};
	
	/**
	 * gets layout template, renders it and loads into dom
	 * @method
	 * @param {String} id
	 */
	this.loadLayout = function(id)
	{
		var layout = this.hash.layout;
		if(isValidString(layout))
		{
			var success = function(html)
			{
				var layoutRenderer = self.config.getLayoutRenderer(layout);
				if(isFunction(layoutRenderer))
				{
					html = layoutRenderer(html,
					{
						data : self.layout.init,
						config : self.config,
						hash : self.hash,
						text : self.text,
						layout	: self.layout,
						page : self.page,
						context : self.context
					});
				}
				var prefex = "layout." + layout + ".";
				var layoutElement = self.layoutElement();
				layoutElement.html(html);
				self.translate(layoutElement, prefex);
				self.defaults(layoutElement);
				self.hash.loadedLayout();
				self.queue.complete(id);
			};
			var error = function(jqXHR, textStatus, errorThrown)
			{
				self.layoutElement().html("<div id=\"" + self.config.pageId + "\"></div");
				self.hash.loadedLayout();
				self.queue.complete(id);
			};
			this.loadLayoutResource(layout, success, error);
		}
		else
		{
			this.layoutElement().html("<div id=\"" + this.config.pageId + "\"></div");
			this.hash.loadedLayout();
		}
	};
	
	/**
	 * convenience function for loading layout resource
	 * @method
	 * @param {String} layout
	 * @param {Function} success
	 * @param {Function} error
	 */
	this.loadLayoutResource = function(layout, success, error)
	{
		this.loadResource(this.config.getLayoutPath(layout), "text", success, error);
	};
	
	/**
	 * queues loading of page template
	 * @method
	 */
	this.queuePage = function()
	{
		var id = this.queue.page(function()
		{
			self.loadPage(id);
		});
	};
	
	/**
	 * gets page template, renders it and loads into dom
	 * @method
	 * @param {String} id
	 */
	this.loadPage = function(id)
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var success = function(html)
		{
			var pageRenderer = self.config.getPageRenderer(module, page);
			if(isFunction(pageRenderer))
			{
				html = pageRenderer(html,
				{
					data : self.page.init,
					config : self.config,
					hash : self.hash,
					text : self.text,
					layout	: self.layout,
					page : self.page,
					context : self.context
				});
			}
			var prefex = "page." + module + "." + page + ".";
			var pageElement = self.pageElement();
			pageElement.html(html);
			self.translate(pageElement, prefex);
			self.defaults(pageElement);
			self.hash.loadedModule();
			self.hash.loadedPage();
			self.hash.loadedValue();
			self.queueSections();
			self.queueComponents();
			self.queue.complete(id);
		};
		var error = function(jqXHR, textStatus, errorThrown)
		{
			var errorPageRedirector = self.config.getErrorPageRedirector();
			if(isFunction(errorPageRedirector))
			{
				errorPageRedirector();
			}
		};
		this.loadPageResource(module, page, success, error);
	};
	
	/**
	 * convenience function for loading page resource
	 * @method
	 * @param {String} module
	 * @param {String} page
	 * @param {Function} success
	 * @param {Function} error
	 */
	this.loadPageResource = function(module, page, success, error)
	{
		this.loadResource(this.config.getPagePath(module, page), "text", success, error);
	};
	
	/**
	 * queues loading of sections
	 * @method
	 */
	this.queueSections = function()
	{
		$("[" + self.config.sectionAttribute + "]").each(function()
		{
			var element = $(this);
			var section = element.attr(self.config.sectionAttribute);
			self.queueSection(element, section);
		});
	};
	
	/**
	 * searches dom for section attributes to load
	 * @method
	 */
	this.loadSections = function()
	{
		$("[" + this.config.sectionAttribute + "]").each(function()
		{
			var element = $(this);
			var section = element.attr(self.config.sectionAttribute);
			self.loadSection(element, section);
		});
	};
	
	/**
	 * queues section loading
	 * @method
	 */
	this.queueSection = function(element, section)
	{
		var id = this.queue.section(function()
		{
			self.loadSection(element, section, id);
		});
	};
	
	/**
	 * loads a section template into jquery element
	 * @method
	 * @param {jQuery} element
	 * @param {String} section
	 * @param {String} [id]
	 */
	this.loadSection = function(element, section, id)
	{
		var section = isValidString(section) ? section : element.attr(this.config.sectionAttribute);
		var success = function(html)
		{
			var sectionRenderer = self.config.getSectionRenderer();
			if(isFunction(sectionRenderer))
			{
				html = sectionRenderer(html,
				{
					data : self.page.init,
					config : self.config,
					hash : self.hash,
					text : self.text,
					layout	: self.layout,
					page : self.page,
					context : self.context
				});
			}
			var prefex = "section." + (section.replace(/\//g, ".")) + ".";
			element.html(html);
			self.translate(element, prefex);
			self.defaults(element);
			if(!self.config.isFieldKeep(element))
			{
				element.removeAttr(self.config.sectionAttribute);
			}
			if(isSet(id))
			{
				self.queue.complete(id);
			}
		};
		var error = function(jqXHR, textStatus, errorThrown)
		{
			element.html("");
			element.removeAttr(self.config.sectionAttribute);
			if(isSet(id))
			{
				self.queue.complete(id);
			}
		};
		this.loadSectionResource(section, success, error);
	};
	
	/**
	 * convenience for loading section resource
	 * @method
	 * @param {String} section
	 * @param {Function} success
	 * @param {Function} error
	 */
	this.loadSectionResource = function(section, success, error)
	{
		this.loadResource(this.config.getSectionPath(section), "text", success, error);
	};
	
	/**
	 * queues loading of components
	 * @method
	 * @param {jQuery} [element]
	 * @param {Object} [data]
	 */
	this.queueComponents = function(element, data)
	{
		if(!isSet(element))
		{
			element = this.hash.isNewLayout() ? this.layoutElement() : this.pageElement();
		}
		if(!isSet(data))
		{
			data = {};
		}
		element.find("[" + self.config.componentAttribute + "]").each(function()
		{
			var fieldElement = $(this);
			var component = fieldElement.attr(self.config.componentAttribute);
			self.queueComponent(fieldElement, component, data);
		});
	};
	
	/**
	 * searches dom for component attributes to load
	 * @method
	 * @param {jQuery} [element]
	 * @param {Object} [data]
	 */
	this.loadComponents = function(element, data)
	{
		if(!isSet(element))
		{
			element = this.hash.isNewLayout() ? this.layoutElement() : this.pageElement();
		}
		if(!isSet(data))
		{
			data = {};
		}
		element.find("[" + this.config.componentAttribute + "]").each(function()
		{
			var fieldElement = $(this);
			var component = fieldElement.attr(self.config.componentAttribute);
			self.loadComponentInit(fieldElement, component, data);
		});
	};
	
	/**
	 * queues loading of component
	 * @method
	 * @param {jQuery} element
	 * @param {String} component
	 * @param {Object} [data]
	 * @param {Function} [callback]
	 */
	this.queueComponent = function(element, component, data, callback)
	{
		var id = this.queue.component(function()
		{
			self.loadComponentInit(element, component, data, callback, null, null, null, id);
		});
	};
	
	/**
	 * call init service then load component template into jquery element
	 * @method
	 * @param {jQuery} element
	 * @param {String} component
	 * @param {Object} [data]
	 * @param {Function} [callback]
	 * @param {String} [service]
	 * @param {String} [method]
	 * @param {Object} [request]
	 * @param {String} [id]
	 */
	this.loadComponentInit = function(element, component, data, callback, service, method, request, id)
	{
		if(!isSet(data))
		{
			data = {};
		}
		var service = isValidString(service) ? service : element.attr(this.config.fieldServiceAttribute);
		var method = isValidString(method) ? method : element.attr(this.config.fieldMethodAttribute);
		if(isValidString(service) && isValidString(method))
		{
			var request = isObject(request) ? request : {};
			$.extend(true, request, this.hash.cloneParam(), ObjectUtil.parse(element.attr(this.config.fieldRequestAttribute)));
			var success = function(response)
			{
				$.extend(true, data, response);
				self.loadComponent(element, component, data, callback, id);
			};
			var error = function(errors)
			{
				self.loadComponent(element, component, data, callback, id);
			};
			this.service(service, method, request, success, error);
		}
		else
		{
			this.loadComponent(element, component, data, callback, id);
		}
	};
	
	/**
	 * loads component template into jquery element
	 * @method
	 * @param {jQuery} element
	 * @param {String} component
	 * @param {Object} [data]
	 * @param {Function} [callback]
	 * @param {String} [id]
	 */
	this.loadComponent = function(element, component, data, callback, id)
	{
		var success = function(html)
		{
			var componentRenderer = self.config.getComponentRenderer();
			if(isFunction(componentRenderer))
			{
				html = componentRenderer(html,
				{
					data : data,
					config : self.config,
					hash : self.hash,
					text : self.text,
					layout	: self.layout,
					page : self.page,
					context : self.context
				});
			}
			var prefex = "component." + (component.replace(/\//g, ".")) + ".";
			element.html(html);
			self.translate(element, prefex);
			self.defaults(element);
			if(!self.config.isFieldKeep(element))
			{
				element.removeAttr(self.config.componentAttribute);
			}
			if(isFunction(callback))
			{
				callback();
			}
			if(isSet(id))
			{
				self.queue.complete(id);
			}
		};
		var error = function(jqXHR, textStatus, errorThrown)
		{
			element.html("");
			self.queue.complete(id);
		};
		this.loadComponentResource(component, success, error);
	};
	
	/**
	 * convenience for loading component resource
	 * @method
	 * @param {String} component
	 * @param {Function} success
	 * @param {Function} error
	 */
	this.loadComponentResource = function(component, success, error)
	{
		this.loadResource(this.config.getComponentPath(component), "text", success, error);
	};
	
	/**
	 * loads translations into dom elements
	 * @method
	 * @param {jQuery} resourceElement
	 * @param {String} [prefix]
	 */
	this.translate = function(resourceElement, prefix)
	{
		resourceElement.find("[" + self.config.textAttribute + "] > [" + self.config.langAttribute + "]").each(function()
		{
			var element = $(this);
			var lang = element.attr(self.config.langAttribute);
			if(lang == self.hash.lang)
			{
				element.show();
			}
			else
			{
				element.hide();
			}
		});
		resourceElement.find("select[" + self.config.textAttribute + "]").each(function()
		{
			var element = $(this);
			var path = element.attr(self.config.textAttribute);
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
				var options = self.translation(path, prefix);
				if(isObject(options))
				{
					for(var value in options)
					{
						var text = options[value];
						var option = element.find("option[" + self.config.langAttribute + "='" + self.hash.lang + "'][value='" + value + "']");
						if(option.length == 0)
						{
							option = $("<option />");
							option.attr(self.config.langAttribute, self.hash.lang);
							option.val(value);
							option.text(text);
							element.append(option);
						}
					}
				}
			}
		});
		resourceElement.find("[" + self.config.textAttribute + "]:not([" + self.config.textAttribute + "]:has(> [" + self.config.langAttribute + "='" + self.hash.lang + "']))").each(function()
		{
			var element = $(this);
			var path = element.attr(self.config.textAttribute);
			if(path != "true")
			{
				var value = self.translation(path, prefix);
				value = isSet(value) ? value : "";
				element.append("<span lang=\"" + self.hash.lang + "\">" + value + "</span>");
			}
		});
		resourceElement.find("[" + self.config.textAttrAttribute + "]").each(function()
		{
			var element = $(this);
			var attrString = element.attr(self.config.textAttrAttribute);
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
							var value = self.translation(path, prefix);
							value = isSet(value) ? value : "";
						}
						element.attr(attr, value);
					}
				}
			}
		});
		self.hash.loadedLang();
	};
	
	/**
	 * finds translation in text file
	 * @method
	 * @param {String} path
	 * @param {String} [prefix]
	 * @returns {*}
	 */
	this.translation = function(path, prefix)
	{
		var object = null;
		if(isValidString(prefix))
		{
			object = ObjectUtil.find(self.text, prefix + path);
		}
		if(isNull(object))
		{
			object = ObjectUtil.find(self.text, path);
		}
		return object;
	};
	
	/**
	 * adds default value to select, radio, and checkbox, and add placeholder to select
	 * @method
	 * @param {jQuery} resourceElement
	 */
	this.defaults = function(resourceElement)
	{
		// select value
		resourceElement.find("select[value]:notDefaultedValue, select[placeholder]:notDefaultedValue").each(function()
		{
			var element = $(this);
			var selected = false;
			var value = element.attr("value");
			if(value)
			{
				var option = element.find("option[value='" + value + "']");
				if(option.length > 0)
				{
					option.first().prop("selected", true);
					selected = true;
				}
			}
			var placeholder = element.attr("placeholder");
			if(placeholder)
			{
				var color = element.css("color");
				element.prepend("<option" + (!selected ? " selected=\"selected\"" : "") + " value=\"\" style=\"display:none;\">" + placeholder + "</option>");
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
			element.prop("defaulted-value", "true");
		});
		// radio group value
		resourceElement.find("[" + self.config.fieldRadioValueAttribute + "]:notDefaultedValue").each(function()
		{
			var element = $(this);
			var value = element.attr(self.config.fieldRadioValueAttribute);
			var radio = element.find("input[type=radio][value='" + value + "']");
			if(radio.length > 0)
			{
				radio.first().prop("checked", true);
			}
			else
			{
				element.find("input[type=radio]").first().prop("checked", true);
			}
			element.prop("defaulted-value", "true");
		});
		// checkbox value
		resourceElement.find("input[type=checkbox][" + self.config.fieldCheckboxValueAttribute + "]:notDefaultedValue").each(function()
		{
			var element = $(this);
			var value = element.attr(self.config.fieldCheckboxValueAttribute);
			if(isSet(value) && value.toLowerCase() == "true")
			{
				element.prop("checked", true);
			}
			element.prop("defaulted-value", "true");
		});
	};
	
	/**
	 * queues loading of layout ready function
	 * @method
	 */
	this.queueLayoutReady = function()
	{
		var id = this.queue.ready(function()
		{
			self.loadLayoutReady();
			self.queue.complete(id);
		});
	};
	
	/**
	 * calls layout ready function if set
	 * @method
	 */
	this.loadLayoutReady = function()
	{
		if(isFunction(self.layout.ready))
		{
			self.layout.ready(self.layout.init);
		}
	};
	
	/**
	 * queues loading of page ready function
	 * @method
	 */
	this.queuePageReady = function()
	{
		var id = this.queue.ready(function()
		{
			self.loadPageReady();
			self.queue.complete(id);
		});
	};
	
	/**
	 * calls page ready function if set
	 * @method
	 */
	this.loadPageReady = function()
	{
		if(isFunction(self.page.ready))
		{
			self.page.ready(self.page.init);
		}
	};
	
	/**
	 * queues showing of dom elements
	 * @method
	 */
	this.queueShow = function()
	{
		var id = this.queue.show(function()
		{
			self.show();
			self.queue.complete(id);
		});
	};
	
	/**
	 * shows dom elements after all manipulation is done
	 * @method
	 */
	this.show = function()
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var layoutElement = self.layoutElement();
		var pageElement = self.pageElement();
		if(layoutElement.is(":hidden"))
		{
			pageElement.show();
			layoutElement.show();
		}
		else
		{
			pageElement.show();
		}
		self.hash.state = null;
	};
	
	/**
	 * adds a callback to the execution queue
	 * @method
	 * @param {Function} callback
	 */
	this.queueCallback = function(callback)
	{
		var id = this.queue.callback(function()
		{
			if(isFunction(callback))
			{
				callback();
			}
			self.queue.complete(id);
		});
	};
	
	/**
	 * creates a jquery selector for finding request fields and execute search
	 * @method
	 * @param {jQuery} element
	 * @returns {jQuery}
	 */
	this.groupElements = function(element, active)
	{
		active = isSet(active) ? active : true;
		var selector = "";
		selector += "input[name][type=hidden]" + (active ? ":enabled" : "") + ", ";
		selector += "input[name][type!=hidden][type!=radio][" + this.config.fieldRequiredAttribute + "]" + (active ? ":include" : "") + ", ";
		selector += "select[name][" + this.config.fieldRequiredAttribute + "]" + (active ? ":include" : "") + ", ";
		selector += "textarea[name][" + this.config.fieldRequiredAttribute + "]" + (active ? ":include" : "") + ", ";
		selector += "[" + this.config.fieldRadioGroupAttribute + "][" + this.config.fieldRequiredAttribute + "]:has(input[name][type=radio]" + (active ? ":include" : "") + ") ";
		return element.find(selector);
	}
	
	/**
	 * create a json request object based on url param and form fields for service call
	 * @method
	 * @param {jQuery} element
	 * @returns {object}
	 */
	this.request = function(element)
	{
		var elementRegExp = new RegExp("^(\\w+)(?:\\[|$)");
		var indexRegExp = new RegExp("\\[(\\d+)?\\]", "g");
		var valid = true;
		var request = this.hash.cloneParam();
		this.groupElements(element).each(function()
		{
			var field = self.validate($(this));
			if(!field.valid)
			{
				valid = false;
			}
			if(isValidString(field.name) && isValid(field.value))
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
		if(isDebug())
		{
			console.json(request);
		}
		return { request : request, valid : valid };
	};
	
	/**
	 * call a service method to update the value of a single field
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.update = function(element)
	{
		element = this.element(element);
		var field = this.validate(element);
		if(field.valid && field.name)
		{
			var updateValue = element.attr(this.config.fieldUpdateValueAttribute);
			if(field.value != updateValue)
			{
				var request = this.hash.cloneParam();
				request.name = field.name;
				request.value = field.value;
				this.submit(element, request, function()
				{
					element.attr(self.config.fieldUpdateValueAttribute, field.value);
				},
				function()
				{
					element.val(element.attr(self.config.fieldUpdateValueAttribute));
				});
			}
		}
	};
	
	/**
	 * creates a request and submits form to service call
	 * @method
	 * @param {Node|jQuery|String} element
	 * @param {Object} [request]
	 * @param {Function} [success]
	 * @param {Function} [error]
	 */
	this.submit = function(element, request, success, error)
	{
		element = this.element(element);
		var disabler = this.config.getDisabler(element);
		var submitGroup = element.attr(this.config.fieldSubmitGroupAttribute);
		var prerequest = element.attr(this.config.fieldPrerequestAttribute);
		var presubmit = element.attr(this.config.fieldPresubmitAttribute);
		var service = element.attr(this.config.fieldServiceAttribute);
		var method = element.attr(this.config.fieldMethodAttribute);
		var successAttr = element.attr(this.config.fieldSuccessAttribute);
		var errorAttr = element.attr(this.config.fieldErrorAttribute);
		disabler(element, true);
		if(isValidString(prerequest))
		{
			if(new Function("element", "return " + prerequest)(element) === false)
			{
				disabler(element, false);
				return;
			}
		}
		var valid = true;
		if(!isObject(request))
		{
			submitGroup = isValidString(submitGroup) ? submitGroup : method;
			var result = this.request($("[" + this.config.fieldGroupAttribute + "='" + submitGroup + "']"));
			valid = result.valid;
			request = result.request;
		}
		if(valid)
		{
			$.extend(true, request, ObjectUtil.parse(element.attr(this.config.fieldRequestAttribute)));
			if(isValidString(presubmit))
			{
				if(new Function("request", "element", "return " + presubmit)(request, element) === false)
				{
					disabler(element, false);
					return;
				}
			}
			if(isValidString(service) && isValidString(method))
			{
				this.service(service, method, request, function(data)
				{
					disabler(element, false);
					if(isFunction(success))
					{
						success(data, request, element);
					}
					if(isValidString(successAttr))
					{
						new Function("data", "request", "element", successAttr)(data, request, element);
					}
				},
				function(errors)
				{
					disabler(element, false);
					if(isFunction(error))
					{
						error(errors, request, element);
					}
					if(isValidString(errorAttr))
					{
						new Function("errors", "request", "element", errorAttr)(errors, request, element);
					}
				});
			}
		}
		else
		{
			disabler(element, false);
		}
	};
	
	/**
	 * turns a string or dom node into a jquery element
	 * @method
	 * @param {Node|jQuery|String} element
	 * @param {String} [selector]
	 */
	this.element = function(element, selector)
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
	
	/**
	 * calls filters for a request field and creates a field object for tracking state
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.filter = function(element)
	{
		element = this.element(element);
		var field = {};
		field.element = element;
		field.tag = element.prop("tagName").toLowerCase();
		field.type = null;
		field.name = element.attr(this.config.fieldRadioGroupAttribute);
		field.filter = element.attr(this.config.fieldFilterAttribute);
		field.formValue = null;
		field.value = null;
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
				field.value = element.is(":checked");
			}
			else if(field.type == "file")
			{
				field.value = element.attr(this.config.fieldFileValueAttribute);
			}
			else
			{
				field.formValue = element.val();
				field.value = field.formValue;
				if(isValidString(field.value))
				{
					field.value = field.value.trim();
					if(isValidString(field.filter))
					{
						field.filter = field.filter.trim();
						var builder = "";
						for(var name in this.config.filterer)
						{
							builder += "var " + name + " = $_filterer[\"" + name + "\"];\n";
						}
						builder += "return " + field.filter + ";"
						field.value = new Function("field", "value", "$_filterer", builder)(field, field.value, this.config.filterer);
					}
				}
			}
		}
		return field;
	};
	
	/**
	 * validate a group of fields
	 * @method
	 * @param {jQuery} element
	 */
	this.validateGroup = function(element)
	{
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
	
	/**
	 * validate a field value and add to the field object for tracking state
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.validate = function(element)
	{
		element = this.element(element);
		var field = this.filter(element);
		field.visible = element.is(":visible");
		field.required =  StringUtil.equals(element.attr(this.config.fieldRequiredAttribute), "true");
		field.defined = isNotEmpty(field.value);
		field.valid = !(field.required && !field.defined) ? true : false;
		field.validate = element.attr(this.config.fieldValidateAttribute);
		if(field.visible && (field.required || field.defined))
		{
			if(isValidString(field.validate))
			{
				field.validate = field.validate.trim();
				var builder = "";
				for(var name in this.config.validator)
				{
					builder += "var " + name + " = $_validator[\"" + name + "\"];\n";
				}
				builder += "return " + field.validate + ";"
				field.valid = new Function("field", "value", "$_validator", builder)(field, field.value, this.config.validator);
			}
		}
		if(field.visible)
		{
			this.feedback(element, field);
		}
		return field;
	};
	
	/**
	 * read file contents into a base64 string
	 * @method
	 * @param {Node|jQuery|String} element
	 * @param {Function} [callback]
	 */
	this.file = function(element, callback)
	{
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
					element.attr(self.config.fieldFileValueAttribute, reader.result);
					if(isFunction(callback))
					{
						callback(reader.result);
					}
				};
				reader.readAsDataURL(file);
			}
		}
	};
	
	/**
	 * applies validation feedback to the field
	 * @method
	 * @param {Node|jQuery|String} element
	 * @param {String} field
	 */
	this.feedback = function(element, field)
	{
		element = this.element(element);
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var feedbacker = this.config.getFeedbacker(element, module, page);
		if(isFunction(feedbacker))
		{
			feedbacker(element, field);
		}
	};
	
	/**
	 * calls resetGroupsValidation and resetGroupsValue
	 * @method
	 */
	this.resetGroups = function()
	{
		this.resetGroupsValidation();
		this.resetGroupsValue();
	};
	
	/**
	 * calls resetGroupValidation and resetGroupValue
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.resetGroup = function(element)
	{
		this.resetGroupValidation(element);
		this.resetGroupValue(element);
	};
	
	/**
	 * calls resetValidation and resetValue
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.reset = function(element)
	{
		this.resetValidation(element);
		this.resetValue(element);
	};
	
	/**
	 * resets all groups validation
	 * @method
	 */
	this.resetGroupsValidation = function()
	{
		$("[" + this.config.fieldGroupAttribute + "]").each(function()
		{
			self.resetGroupValidation($(this));
		});
	};
	
	/**
	 * resets a groups validation
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.resetGroupValidation = function(element)
	{
		element = this.element(element, "[" + this.config.fieldGroupAttribute + "='{name}']");
		this.groupElements(element, false).each(function()
		{
			self.resetValidation($(this));
		});
	};
	
	/**
	 * resets a fields validation
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.resetValidation = function(element)
	{
		this.feedback(element);
	};
	
	/**
	 * resets all groups values
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.resetGroupsValue = function()
	{
		$("[" + this.config.fieldGroupAttribute + "]").each(function()
		{
			self.resetGroupValue($(this));
		});
	};
	
	/**
	 * resets a groups values
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.resetGroupValue = function(element)
	{
		element = this.element(element, "[" + this.config.fieldGroupAttribute + "='{name}']");
		this.groupElements(element, false).each(function()
		{
			self.resetValue($(this));
		});
	};
	
	/**
	 * resets a fields value
	 * @method
	 * @param {Node|jQuery|String} element
	 */
	this.resetValue = function(element)
	{
		this.feedback(element);
		var tag = element.prop("tagName").toLowerCase();
		var type = element.attr("type");
		element.val("");
		if(type == "file")
		{
			element.attr(this.config.fieldFileValueAttribute, "");
		}
	};
	
	/**
	 * finds the endpoint for the current environment
	 * @method
	 * @returns {String}
	 */
	this.endpoint = function()
	{
		var endpoint = localStorage.getItem(this.config.getEndpointStorage());
		if(!isSet(endpoint))
		{
			var endpoints = this.config.endpoint[getEnvironment()];
			if(isArray(endpoints) && isNotEmpty(endpoints))
			{
				endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
				localStorage.setItem(this.config.getEndpointStorage(), endpoint);
			}
		}
		return endpoint;
	};
	
	/**
	 * removes the current endpoint from local storage
	 * @method
	 */
	this.resetEndpoint = function()
	{
		localStorage.removeItem(this.config.getEndpointStorage());
	};
	
	/**
	 * calls service file if mock env or calls service endpoint
	 * @method
	 * @param {String} service
	 * @param {String} method
	 * @param {Object} request
	 * @param {Function} success
	 * @param {Function} [error]
	 */
	this.service = function(service, method, request, success, error)
	{
		if(isMock())
		{
			this.serviceFile(service, method, request, success, error);
		}
		else
		{
			var endpoint = this.endpoint();
			this.serviceCall(service, method, request, success, error);
		}
	};
	
	/**
	 * creates select modal for choosing response scenario
	 * @method
	 * @param {String} service
	 * @param {String} method
	 * @param {Object} request
	 * @param {Function} success
	 * @param {Function} [error]
	 */
	this.serviceFile = function(service, method, request, success, error)
	{
		var scenarios = this.config.getDevServiceResponseScenarios(service, method);
		if(scenarios.length > 0)
		{
			this.dev.select(service + "/" + method, scenarios, function(scenario)
			{
				self.serviceCall(service, method, request, success, error, scenario);
			});
		}
		else
		{
			this.serviceCall(service, method, request, success, error);
		}
	};
	
	/**
	 * calls the endpoint or file to get a json response
	 * @method
	 * @param {String} path
	 * @param {Object} request
	 * @param {Function} success
	 * @param {Function} [error]
	 * @param {String} [scenario]
	 */
	this.serviceCall = function(service, method, request, success, error, scenario)
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var url = null;
		if(isMock())
		{
			url = this.config.getDevServiceResponsePath(service, method, scenario);
		}
		else
		{
			path = this.config.getServicePath(service, method);
			if(isLocal())
			{
				var sessionId = localStorage.getItem(this.config.devSessionId);
				if(isSet(sessionId))
				{
					path += ";" + this.config.devSessionId + "=" + encodeURIComponent(sessionId);
				}
			}
			var csrfToken = localStorage.getItem(this.config.csrfTokenStorage);
			if(isSet(csrfToken))
			{
				path += "?" + this.config.csrfTokenParam + "=" + encodeURIComponent(csrfToken);
			}
			var endpoint = this.endpoint();
			if(isSet(endpoint))
			{
				var context = isValidString(this.hash.context) ? this.hash.context + "/" : "";
				url = "https://" + endpoint + "/" + context + this.config.endpointPath + path;
			}
			else
			{
				// TODO: error
			}
		}
		var errored = false;
		$.ajax(
		{
			type		: "POST",
			url			: url,
			data		: JSON.stringify(request),
			contentType	: "text/plain",
			dataType	: "json",
			cache		: false,
			success		: function(response, textStatus, jqXHR)
			{
				if(isSet(response.dev))
				{
					if(isSet(response.dev[self.config.devSessionId]))
					{
						localStorage.setItem(self.config.devSessionId, response.dev[self.config.devSessionId]);
					}
					if(isSet(response.dev[self.config.devCsrfToken]))
					{
						localStorage.setItem(self.config.csrfTokenStorage, response.dev[self.config.devCsrfToken]);
					}
				}
				var csrfTokenHeader = jqXHR.getResponseHeader(self.config.csrfTokenHeader);
				if(isSet(csrfTokenHeader))
				{
					localStorage.setItem(self.config.csrfTokenStorage, csrfTokenHeader);
				}
				if(isSet(response.errors) && response.errors.length > 0)
				{
					console.info("RESPONSE : " + url, response.errors);
					forEach(response.errors, function(error)
					{
						switch(error.type)
						{
							case "SERVICE_AJAX_NOT_AUTHENTICATED":
							case "SERVICE_CSRF_TOKEN_INVALID":
							{
								var redirector = self.config.getErrorAuthRedirector(module, page);
								if(isFunction(redirector))
								{
									self.queue.stop();
									redirector();
								}
								break;
							}
						}
					});
					error(response.errors);
				}
				else
				{
					self.serviceLog(service, method, url, request, response);
					success(response);
				}
			},
			error		: function(jqXHR, textStatus, errorThrow)
			{
				if(!errored)
				{
					self.serviceLog(service, method, url, request, "connection error");
					errored = true;
					error();
				}
			},
			complete	: function(jqXHR, textStatus)
			{
				if("success" != textStatus && !errored)
				{
					self.serviceLog(service, method, url, request, "connection error");
					errored = true;
					error();
				}
			}
		});
	};
	
	this.serviceLog = function(service, method, url, request, response)
	{
		var log = "SERVICE : " + service + " / " + method + "\n";
		log += url + "\n\n";
		log += "REQUEST" + "\n";
		log += JSON.stringify(request, null, 4) + "\n\n";
		log += "RESPONSE" + "\n";
		log += JSON.stringify(response, null, 4) + "\n\n";
		console.log(log);
	};
	
};



