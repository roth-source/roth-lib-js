

var roth = roth || {};
roth.lib = roth.lib || {};
roth.lib.js = roth.lib.js || {};
roth.lib.js.client = roth.lib.js.client || {};


roth.lib.js.client.Client = roth.lib.js.client.Client || function()
{
	
	
	var self = this;
	var inited = false;
	
	
	this.config = new roth.lib.js.client.Config();
	
	
	this.hash = new roth.lib.js.client.Hash();
	
	
	this.queue = new roth.lib.js.client.Queue();
	
	
	this.template = new roth.lib.js.template.Template();
	
	
	this.dev = null;
	
	
	this.text = {};
	
	
	this.layout = {};
	
	
	this.page = {};
	
	
	this.context = {};
	
	
	this._layoutElement = $("<div></div>");
	
	
	this._pageElement = $("<div></div>");
	
	
	this.init = function()
	{
		this.checkJquery();
		this.checkDev();
		window.addEventListener("hashchange", function()
		{
			if(self.isLoadable())
			{
				self.load();
			}
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
					if(self.isLoadable())
					{
						self.load();
					}
				});
			}
		});
	}
	
	
	this.checkJquery = function()
	{
		if(!isSet(jQuery))
		{
			document.write('<script src="' + this.config.getJqueryScript() + '"></script>');
		}
	};
	
	
	this.checkDev = function()
	{
		if(isFileProtocol())
		{
			if(typeof roth.lib.js.client.dev == "undefined" || typeof roth.lib.js.client.dev.Dev == "undefined")
			{
				document.write('<link href="' + this.config.getDevStyle() + '" rel="stylesheet" type="text/css" />');
				document.write('<script src="' + this.config.getDevScript() + '"></script>');
			}
		}
	};
	
	
	this.loadConfig = function(init)
	{
		var devConfig = function()
		{
			if(isDev())
			{
				self.loadResource(self.config.getDevConfigDataPath(), "json",
				function(data)
				{
					if(isObject(data))
					{
						self.config.dev = data;
					}
					init();
				},
				function(errors)
				{
					console.error("couldn't load dev.json")
				});
			}
			else
			{
				init();
			}
		};
		this.loadResource(self.config.getConfigDataPath(), "json",
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
			devConfig();
		},
		function(errors)
		{
			
		});
	};
	
	
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
	
	
	this.initConfig = function()
	{
		this.hash.defaultModule = this.config.defaultModule;
		this.hash.defaultPage = this.config.defaultPage;
		this.hash.langStorage = this.config.langStorage;
	};
	
	
	this.initDev = function()
	{
		if(isFileProtocol())
		{
			this.dev = new roth.lib.js.client.dev.Dev(this.config, this.template);
		}
	};
	
	
	this.reload = function()
	{
		// TODO : what does else does it need to do
		this.load();
	};
	
	
	this.load = function()
	{
		this.queueText();
		this.queueLayout();
		this.queuePage();
		this.queue.execute();
	};
	
	
	this.isLoadable = function()
	{
		var loadable = this.hash.isValid();
		if(loadable)
		{
			var module = this.hash.getModule();
			var page = this.hash.getPage();
			var layout = this.config.getLayout(module, page);
			var text = this.config.getModuleText(module);
			this.hash.setLayout(layout);
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
					lang = this.config.isValidLang(lang) ? lang : this.config.defaultLang;
					this.hash.setLang(lang);
					localStorage.setItem(this.hash.langStorage, lang);
				}
			}
			if(loadable)
			{
				// SET DEFAULT PARAMS
				forEach(this.config.getDefaultParams(module, page), function(value, name)
				{
					if(!self.hash.hasParam(name))
					{
						self.hash.param[name] = value;
						loadable = false;
					}
				});
				// CHECK FOR ALLOWED PARAMS
				var allowedParams = this.config.getAllowedParams(module, page);
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
			if(loadable && !this.hash.isNewModule() && !this.hash.isNewPage())
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
			// CHECK FOR VALID PARAM SCENARIO
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
			if(loadable)
			{
				this.hash.log();
				this.hash.loadedParam();
			}
		}
		return loadable;
	};
	
	
	this.layoutElement = function()
	{
		return $("#" + this.config.layoutId);
	};
	
	
	this.pageElement = function()
	{
		return $("#" + this.config.pageId);
	};
	
	
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
				self.loadResource(modulePath, "json", moduleSuccess, moduleError);
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
				self.loadResource(modulePath, "json", moduleSuccess, moduleError);
			}
			else if(isSet(id))
			{
				self.hash.loadedText();
				self.queue.complete(id);
			}
		};
		this.loadResource(path, "json", success, error);
	};
	
	
	this.queueLayout = function()
	{
		if(isSet(this.hash.layout) && this.hash.isNewLayout())
		{
			this.layout = {};
			this.queueLayoutInit();
			this.queueLayoutResource();
			this.queueLayoutReady();
		}
	};
	
	
	this.queueLayoutInit = function()
	{
		var id = this.queue.layoutInit(function()
		{
			self.loadLayoutInit(id);
		});
	};
	
	
	this.loadLayoutInit = function(id)
	{
		var init = this.config.getLayoutInit(this.hash.layout);
		if(isObject(init) && this.hash.getModule() != "dev")
		{
			var request = isObject(init.request) ? init.request : this.hash.param;
			var success = function(data)
			{
				if(isFunction(init.success))
				{
					init.success(data);
				}
				self.layout.data = data || {};
				self.queue.complete(id);
			};
			var error = function(errors)
			{
				if(isFunction(init.error))
				{
					init.error(errors);
				}
				self.layout.data = {};
				self.queue.complete(id);
			};
			this.service(init.service, init.method, request, success, error);
		}
		else
		{
			self.queue.complete(id);
		}
	};
	
	
	this.queueLayoutResource = function()
	{
		var id = this.queue.layoutResource(function()
		{
			self.loadLayoutResource(id);
		});
	};
	
	
	this.loadLayoutResource = function(id)
	{
		var layout = this.hash.layout;
		if(isValidString(layout))
		{
			var success = function(html)
			{
				html = self.template.render(html,
				{
					data : self.layout.data,
					config : self.config,
					hash : self.hash,
					text : self.text,
					layout	: self.layout,
					page : self.page,
					context : self.context
				});
				var prefex = "layout." + layout + ".";
				self._layoutElement.html(html);
				self.translate(self._layoutElement, prefex);
				self.defaults(self._layoutElement);
				self.hash.loadedLayout();
				self.queueLayoutComponents();
				self.queue.complete(id);
			};
			var error = function(jqXHR, textStatus, errorThrown)
			{
				self._layoutElement.html("<div id=\"" + self.config.pageId + "\"></div");
				self.hash.loadedLayout();
				self.queue.complete(id);
			};
			this.loadResource(this.config.getLayoutPath(layout), "text", success, error);
		}
		else
		{
			this._layoutElement.html("<div id=\"" + this.config.pageId + "\"></div");
			this.hash.loadedLayout();
		}
	};
	
	
	this.queueLayoutComponents = function()
	{
		this._layoutElement.find("[" + self.config.componentAttribute + "]").each(function()
		{
			var element = $(this);
			var component = element.attr(self.config.componentAttribute);
			self.queueLayoutComponent(element, component);
		});
	};
	
	
	this.queueLayoutComponent = function(element, component)
	{
		var id = this.queue.layoutComponent(function()
		{
			self.loadComponentInit(element, component, null, null, null, null, function() { self.queueLayoutComponents(); }, id);
		});
	};
	
	
	this.queueLayoutReady = function()
	{
		var id = this.queue.layoutReady(function()
		{
			self.loadLayoutReady();
			self.queue.complete(id);
		});
	};
	
	
	this.loadLayoutReady = function()
	{
		var layoutElement = this.layoutElement();
		if(!layoutElement.is(":hidden"))
		{
			layoutElement.hide();
		}
		layoutElement.empty().append(this._layoutElement.children().detach());
		if(isFunction(this.layout.ready))
		{
			this.layout.ready(this.layout.data);
		}
		layoutElement.show();
		if(isFunction(this.layout.show))
		{
			this.layout.show(this.layout.data);
		}
		if(isFunction(this.config.pageLoader))
		{
			this.config.pageLoader(this.pageElement(), true);
		}
	};
	
	
	this.queuePage = function()
	{
		if(!this.hash.isNewLayout() && isFunction(this.config.pageLoader))
		{
			this.config.pageLoader(this.pageElement(), true);
		}
		this.page = {};
		this.queuePageInit();
		this.queuePageResource();
		this.queuePageReady();
	};
	
	
	this.queuePageInit = function()
	{
		var id = this.queue.pageInit(function()
		{
			self.loadPageInit(id);
		});
	};
	
	
	this.loadPageInit = function(id)
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var init = this.config.getPageInit(module, page);
		if(isObject(init) && module != "dev")
		{
			var request = isObject(init.request) ? init.request : this.hash.param;
			var success = function(data)
			{
				if(isFunction(init.success))
				{
					init.success(data);
				}
				self.page.data = data || {};
				self.queue.complete(id);
			};
			var error = function(errors)
			{
				if(isFunction(init.error))
				{
					init.error(errors);
				}
				self.page.data = {};
				self.queue.complete(id);
			};
			this.service(init.service, init.method, request, success, error);
		}
		else
		{
			self.queue.complete(id);
		}
	};
	
	
	this.queuePageResource = function()
	{
		var id = this.queue.pageResource(function()
		{
			self.loadPageResource(id);
		});
	};
	
	
	this.loadPageResource = function(id)
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var success = function(html)
		{
			html = self.template.render(html,
			{
				data : self.page.data,
				config : self.config,
				hash : self.hash,
				text : self.text,
				layout	: self.layout,
				page : self.page,
				context : self.context
			});
			var prefex = "page." + module + "." + page + ".";
			self._pageElement.html(html);
			self.translate(self._pageElement, prefex);
			self.defaults(self._pageElement);
			self.hash.loadedModule();
			self.hash.loadedPage();
			self.hash.loadedValue();
			self.queuePageComponents();
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
		this.loadResource(this.config.getPagePath(module, page), "text", success, error);
	};

	
	this.queuePageComponents = function()
	{
		this._pageElement.find("[" + self.config.componentAttribute + "]").each(function()
		{
			var element = $(this);
			var component = element.attr(self.config.componentAttribute);
			self.queuePageComponent(element, component);
		});
	};
	
	
	this.queuePageComponent = function(element, component)
	{
		var id = this.queue.pageComponent(function()
		{
			self.loadComponentInit(element, component, null, null, null, null, function() { self.queuePageComponents(); }, id);
		});
	};
	
	
	this.queuePageReady = function()
	{
		var id = this.queue.pageReady(function()
		{
			self.loadPageReady();
			self.queue.complete(id);
		});
	};
	
	
	this.loadPageReady = function()
	{
		var pageElement = isSet(this.hash.layout) ? this.pageElement() : this.layoutElement();
		if(!pageElement.is(":hidden"))
		{
			pageElement.hide();
		}
		pageElement.empty().append(this._pageElement.children().detach());
		if(isFunction(this.page.ready))
		{
			this.page.ready(this.page.data);
		}
		if(isFunction(this.config.pageLoader))
		{
			this.config.pageLoader(this.pageElement(), false);
		}
		pageElement.show();
		if(isFunction(this.page.show))
		{
			this.page.show(this.page.data);
		}
	};
	
	
	this.loadComponentInit = function(element, component, service, method, request, data, callback, id)
	{
		var service = isValidString(service) ? service : element.attr(this.config.fieldServiceAttribute);
		var method = isValidString(method) ? method : element.attr(this.config.fieldMethodAttribute);
		if(isValidString(service) && isValidString(method))
		{
			request = isObject(request) ? request : {};
			$.extend(true, request, this.hash.cloneParam(), ObjectUtil.parse(element.attr(this.config.fieldRequestAttribute)));
			var success = function(response)
			{
				data = isObject(data) ? data : {};
				$.extend(true, data, response);
				self.loadComponent(element, component, data, callback, id);
			};
			var error = function(errors)
			{
				self.loadComponent(element, component, {}, callback, id);
			};
			this.service(service, method, request, success, error);
		}
		else
		{
			this.loadComponent(element, component, null, callback, id);
		}
	};
	
	
	this.loadComponent = function(element, component, data, callback, id)
	{
		if(!isObject(data))
		{
			data = self.page.data;
		}
		var success = function(html)
		{
			html = self.template.render(html,
			{
				data : data,
				config : self.config,
				hash : self.hash,
				text : self.text,
				layout	: self.layout,
				page : self.page,
				context : self.context
			});
			var prefex = "component." + (component.replace(/\//g, ".")) + ".";
			element.html(html);
			self.translate(element, prefex);
			self.defaults(element);
			element.removeAttr(self.config.componentAttribute);
			if(isFunction(callback))
			{
				callback(data, element);
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
		this.loadResource(this.config.getComponentPath(component), "text", success, error);
	};
	
	
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
				var param = ObjectUtil.parse(element.attr(self.config.textParamAttribute));
				var options = self.translation(path, self.text, prefix, param);
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
				var param = ObjectUtil.parse(element.attr(self.config.textParamAttribute));
				var value = self.translation(path, self.text, prefix, param);
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
							var param = ObjectUtil.parse(element.attr(self.config.textParamAttribute));
							var value = self.translation(path, self.text, prefix, param);
							value = isSet(value) ? value : "";
						}
						element.attr(attr, value);
					}
				}
			}
		});
		self.hash.loadedLang();
	};
	
	
	this.translation = function(path, text, prefix, param)
	{
		var object = null;
		if(isValidString(prefix))
		{
			object = ObjectUtil.find(text, prefix + path);
		}
		if(isNull(object))
		{
			object = ObjectUtil.find(text, path);
		}
		if(isNotEmpty(param))
		{
			if(isString(object))
			{
				object = StringUtil.replace(object, param);
			}
			else if(isObject(object))
			{
				forEach(object, function(value, name)
				{
					object[name] = StringUtil.replace(value, param);
				});
			}
		}
		return object;
	};
	
	
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
				if(!selected)
				{
					selected = element.find("option[selected]").length > 0;
				}
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
	
	
	this.request = function(element, service, method)
	{
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
		if(!isObject(request))
		{
			submitGroup = isValidString(submitGroup) ? submitGroup : method;
			request = this.request($("[" + this.config.fieldGroupAttribute + "='" + submitGroup + "']"), service, method);
		}
		if(isObject(request))
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
				},
				submitGroup);
			}
		}
		else
		{
			disabler(element, false);
		}
	};
	
	
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
	
	
	this.filter = function(element)
	{
		element = this.element(element);
		var field = {};
		field.element = element;
		field.name = element.attr(this.config.fieldRadioGroupAttribute);
		field.value = null;
		field.formValue = null;
		field.tag = element.prop("tagName").toLowerCase();
		field.type = null;
		field.filter = element.attr(this.config.fieldFilterAttribute);
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
	
	
	this.resetGroups = function()
	{
		this.resetGroupsValidation();
		this.resetGroupsValue();
	};
	
	
	this.resetGroup = function(element)
	{
		this.resetGroupValidation(element);
		this.resetGroupValue(element);
	};
	
	
	this.reset = function(element)
	{
		this.resetValidation(element);
		this.resetValue(element);
	};
	
	
	this.resetGroupsValidation = function()
	{
		$("[" + this.config.fieldGroupAttribute + "]").each(function()
		{
			self.resetGroupValidation($(this));
		});
	};
	
	
	this.resetGroupValidation = function(element)
	{
		element = this.element(element, "[" + this.config.fieldGroupAttribute + "='{name}']");
		this.groupElements(element, false).each(function()
		{
			self.resetValidation($(this));
		});
	};
	
	
	this.resetValidation = function(element)
	{
		this.feedback(element);
	};
	
	
	this.resetGroupsValue = function()
	{
		$("[" + this.config.fieldGroupAttribute + "]").each(function()
		{
			self.resetGroupValue($(this));
		});
	};
	
	
	this.resetGroupValue = function(element)
	{
		element = this.element(element, "[" + this.config.fieldGroupAttribute + "='{name}']");
		this.groupElements(element, false).each(function()
		{
			self.resetValue($(this));
		});
	};
	
	
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
	
	
	this.resetEndpoint = function()
	{
		localStorage.removeItem(this.config.getEndpointStorage());
	};
	
	
	this.service = function(service, method, request, success, error, group)
	{
		if(isMock())
		{
			this.serviceFile(service, method, request, success, error, group);
		}
		else
		{
			var endpoint = this.endpoint();
			this.serviceCall(service, method, request, success, error, group);
		}
	};
	
	
	this.serviceFile = function(service, method, request, success, error, group)
	{
		var scenarios = this.config.getDevServiceResponseScenarios(service, method);
		if(scenarios.length > 0)
		{
			if(isMockDemo())
			{
				this.serviceCall(service, method, request, success, error, group, scenarios[0]);
			}
			else
			{
				this.dev.select(service + "/" + method, scenarios, function(scenario)
				{
					self.serviceCall(service, method, request, success, error, group, scenario);
				});
			}
		}
		else
		{
			this.serviceCall(service, method, request, success, error, group);
		}
	};
	
	
	this.serviceCall = function(service, method, request, success, error, group, scenario)
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
			if(isFileProtocol())
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
			xhrFields	:
			{
				withCredentials : true
			},
			success		: function(response, textStatus, jqXHR)
			{
				if(isSet(response.dev))
				{
					if(isSet(response.dev[self.config.devSessionId]))
					{
						localStorage.setItem(self.config.devSessionId, response.dev[self.config.devSessionId]);
					}
				}
				var csrfTokenHeader = jqXHR.getResponseHeader(self.config.csrfTokenHeader);
				if(isSet(csrfTokenHeader))
				{
					localStorage.setItem(self.config.csrfTokenStorage, csrfTokenHeader);
				}
				self.serviceLog(service, method, url, request, response);
				if(isSet(response.errors) && response.errors.length > 0)
				{
					var groupElement = isSet(group) ? $("[" + self.config.fieldGroupAttribute + "='" + group + "']") : $();
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
					error(response.errors);
				}
				else
				{
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
	
	
	this.key = function(key, event, callback)
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
	
	
	this.escape = function(event, callback)
	{
		this.key(27, event, callback);
	};
	
	
	this.enter = function(event, callback)
	{
		this.key(13, event, callback);
	};
	
	
	this.enterSubmit = function(event)
	{
		var callback = function(element)
		{
			var groupElement = element.closest("[" + self.config.fieldGroupAttribute + "]");
			if(groupElement.length > 0)
			{
				var group = groupElement.attr(self.config.fieldGroupAttribute);
				if(isSet(group))
				{
					var submitElement = groupElement.find("[" + self.config.fieldSubmitGroupAttribute + "='" + group + "'], [" + self.config.fieldMethodAttribute + "='" + group + "']");
					if(submitElement.length > 0)
					{
						self.submit(submitElement);
					}
				}
			}
		};
		this.key(13, event, callback);
	};
	
};



