
roth.lib.js.client.Client = roth.lib.js.client.Client || function()
{
	var self = this;
	var inited = false;
	
	this.config = new roth.lib.js.client.Config();
	this.hash = new roth.lib.js.client.Hash();
	this.endpoint = new roth.lib.js.client.Endpoint();
	this.queue = new roth.lib.js.client.Queue();
	this.cache = new roth.lib.js.client.Cache();
	this.dev = null;
	
	this.text = {};
	this.layout = {};
	this.page = {};
	this.context = {};
	
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
				self.initConsole();
				self.initJquery();
				self.initConfig();
				self.initDev();
				self.load();
			}
		});
	};
	
	this.checkJquery = function()
	{
		if(!isSet(window.jQuery))
		{
			document.write('<script src="' + this.config.jgetJqueryScript() + '"></script>');
		}
	};
	
	this.checkDev = function()
	{
		if(isDev())
		{
			if(!(isSet(window.jQuery) && isSet(window.jQuery.fn) && isSet(window.jQuery.fn.modal)))
			{
				document.write('<link rel="stylesheet" type="text/css" href="' + this.config.getBootstrapStyle() + '"/>');
				document.write('<script src="' + this.config.getBootstrapScript() + '"></script>');
			}
			if(typeof roth.lib.js.template == "undefined" || typeof roth.lib.js.template.Template == "undefined")
			{
				document.write('<script src="' + this.config.getDevTemplateScript() + '"></script>');
			}
			if(isSet(this.config.devConfigScript))
			{
				document.write('<script src="' + this.config.devConfigScript + '"></script>');
			}
			if(typeof roth.lib.js.client.dev == "undefined" || typeof roth.lib.js.client.dev.Dev == "undefined")
			{
				document.write('<script src="' + this.config.getDevScript() + '"></script>');
			}
		}
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
		jQuery.expr[":"].notInitedValue = function(element, index, match)
		{
			return !isSet($(element).prop("inited-value"));
		};
	};
	
	this.initConfig = function()
	{
		this.hash.defaultModule = this.config.defaultModule;
		this.hash.defaultPage = this.config.defaultPage;
		this.hash.langStorage = this.config.langStorage;
		this.endpoint.currentStorage = this.config.endpointCurrentStorage;
		this.endpoint.availableStorage = this.config.endpointAvailableStorage;
		if(!isSet(this.config.endpoint[getEnvironment()]) && isHyperTextProtocol())
		{
			var endpoint = "https://";
			endpoint += window.location.host;
			endpoint += window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1);
			this.config.endpoint[getEnvironment()] = [endpoint];
		}
	};
	
	this.initDev = function()
	{
		if(isDev())
		{
			this.dev = new roth.lib.js.client.dev.Dev(this.config);
		}
	};
	
	this.load = function()
	{
		if(this.isValidHash() && !this.isChangedParam())
		{
			this.hide();
			this.queueEndpoints();
			this.queueText();
			if(this.hash.isNewLayout())
			{
				this.queueLayoutInitializer();
				this.queueLayout();
				this.queueLayoutReady();
			}
			this.queuePageInitializer();
			this.queuePage();
			this.queuePageReady();
			this.queueSections();
			this.queueComponents();
			this.queueTranslation();
			this.queueFields();
			this.queueShow();
			this.queue.execute();
		}
	};
	
	this.isValidHash = function()
	{
		var valid = this.hash.isValid();
		if(valid)
		{
			var module = this.hash.getModule();
			var page = this.hash.getPage();
			this.hash.setLayout(this.config.getLayout(module, page));
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
			var errorParamsRedirector = this.config.getErrorParamsRedirector(module, page);
			if(isFunction(errorParamsRedirector))
			{
				if(this.hash.isNewLayout())
				{
					var layoutChecker = this.config.getLayoutChecker(this.hash.layout);
					if(isFunction(layoutChecker))
					{
						if(!layoutChecker())
						{
							errorParamsRedirector();
							valid = false;
						}
					}
				}
				var pageChecker = this.config.getPageChecker(module, page);
				if(isFunction(pageChecker))
				{
					if(!pageChecker())
					{
						errorParamsRedirector();
						valid = false;
					}
				}
			}
		}
		return valid;
	};
	
	this.isChangedParam = function()
	{
		var changed = false;
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		if(!this.hash.isNewPage() && isSet(this.hash.loaded.param))
		{
			var loadedParams = this.hash.cloneLoadedParams();
			var changeParams = this.config.getPageChangeParams(module, page);
			for(var name in this.hash.param)
			{
				changed = changeParams.indexOf(name) > -1;
				if(!changed)
				{
					changed = this.hash.param[name] == loadedParams[name];
					if(!changed)
					{
						break;
					}
					else
					{
						delete loadedParams[name];
					}
				}
				else
				{
					delete loadedParams[name];
				}
			}
			if(changed)
			{
				changed = Object.keys(loadedParams).length == 0;
			}
		}
		if(changed)
		{
			if(isFunction(this.layout.change))
			{
				this.layout.change(this.layout.response);
			}
			if(isFunction(this.page.change))
			{
				this.page.change(this.page.response);
			}
		}
		return changed;
	};
	
	this.changeLang = function(lang)
	{
		this.cache.clearView();
		this.hash.setLang(lang);
		this.hash.reload();
	};
	
	this.getLayoutElement = function()
	{
		return $("#" + this.config.layoutId);
	};
	
	this.getPageElement = function()
	{
		return $("#" + this.config.pageId);
	};
	
	this.hide = function()
	{
		this.hash.log();
		this.hash.loadedParam();
		var layout = this.hash.layout;
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var layoutElement = this.getLayoutElement();
		var pageElement = this.getPageElement();
		var hideTransitioner = this.config.getHideTransitioner(module, page, this.hash.state);
		var layoutCache = this.config.getLayoutCache(layout);
		var pageCache = this.config.getPageCache(module, page);
		if(isSet(this.hash.loaded.value) && isSet(this.hash.loaded.layout) && this.hash.isNewLayout())
		{
			if(isFunction(hideTransitioner))
			{
				hideTransitioner(layoutElement);
			}
			else
			{
				layoutElement.hide();
			}
			pageElement.hide();
			if(pageCache)
			{
				this.cache.setPage(hash, pageElement);
			}
			pageElement.empty();
			if(layoutCache)
			{
				this.cache.setLayout(hash, layoutElement);
			}
			layoutElement.empty();
		}
		else if(isSet(this.hash.loaded.value) && isSet(this.hash.loaded.page))
		{
			if(isFunction(hideTransitioner))
			{
				hideTransitioner(layoutElement);
			}
			else
			{
				pageElement.hide();
			}
			if(pageCache)
			{
				this.cache.setPage(hash, pageElement);
			}
			pageElement.empty();
		}
		else
		{
			if(isFunction(hideTransitioner))
			{
				hideTransitioner(layoutElement);
			}
			else
			{
				layoutElement.hide();
			}
			pageElement.hide();
		}
		if(this.hash.isNewLayout())
		{
			this.layout = {};
		}
		this.page = {};
	};
	
	this.queueEndpoints = function()
	{
		var endpoints = sessionStorage.getItem(this.config.endpointAvailableStorage);
		var id = IdUtil.generate();
		this.queue.endpoints(id, function()
		{
			self.loadEndpoints(endpoints, id);
		});
	};
	
	this.loadEndpoints = function(endpoints, id)
	{
		if(!isSet(endpoints))
		{
			self.callEndpointList(self.config.endpoint[getEnvironment()],
			function()
			{
				self.queue.complete(id);
			},
			function()
			{
				console.info("error");
			});
		}
		else
		{
			self.queue.complete(id);
		}
	};
	
	this.callEndpointList = function(endpoints, success, error)
	{
		if(isArray(endpoints) && endpoints.length > 0)
		{
			var endpoint = endpoints.shift();
			$.ajax(
			{
				type		: "POST",
				url			: this.config.getEndpointListUrl(endpoint),
				dataType	: "json",
				cache		: false,
				success		: function(response)
				{
					if(isDev())
					{
						self.endpoint.set([endpoint]);
						success();
					}
					else if(isArray(response.endpoints))
					{
						self.endpoint.set(response.endpoints);
						success();
					}
					else
					{
						self.loadEndpoint(endpoints, success, error);
					}
				},
				complete	: function(jqXHR, textStatus)
				{
					if("success" != textStatus)
					{
						self.callEndpointList(endpoints, success, error);
					}
				}
			});
		}
		else
		{
			if(isDev())
			{
				this.endpoint.clear();
				success();
			}
			else
			{
				error();
			}
		}
	};
	
	this.queueLayoutInitializer = function()
	{
		var id = IdUtil.generate();
		this.queue.initializer(id, function()
		{
			self.loadLayoutInitializer(id);
		});
	};
	
	this.loadLayoutInitializer = function(id)
	{
		var initializer = this.config.getLayoutInitializer(this.hash.layout);
		if(isFunction(initializer))
		{
			var success = function(response)
			{
				self.layout.response = response || {};
				self.queue.complete(id);
			};
			var error = function(errors)
			{
				self.layout.response = {};
				self.queue.complete(id);
			};
			initializer(success, error);
		}
		else
		{
			self.queue.complete(id);
		}
	};
	
	this.queuePageInitializer = function()
	{
		var id = IdUtil.generate();
		this.queue.initializer(id, function()
		{
			self.loadPageInitializer(id);
		});
	};
	
	this.loadPageInitializer = function(id)
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var initializer = this.config.getPageInitializer(module, page);
		if(!isFunction(initializer))
		{
			var initializers = this.config.getPageConfig(module, page, "initializers");
			if(isValidString(initializers))
			{
				var capitalPage = page.charAt(0).toUpperCase() + page.slice(1);
				initializer = this.Initializer.params(initializers, "init" + capitalPage);
			}
		}
		if(isFunction(initializer))
		{
			var success = function(response)
			{
				self.page.response = response || {};
				self.queue.complete(id);
			};
			var error = function(errors)
			{
				self.page.response = {};
				self.queue.complete(id);
			};
			initializer(success, error);
		}
		else
		{
			self.queue.complete(id);
		}
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
		if(this.hash.isNewLang())
		{
			var id = IdUtil.generate();
			this.queue.text(id, function()
			{
				self.loadText(id);
			});
		}
	};
	
	this.loadText = function(id)
	{
		var success = function(text)
		{
			self.text = text;
			self.queue.complete(id);
		};
		var error = function(jqXHR, textStatus, errorThrown)
		{
			self.text = {};
			self.queue.complete(id);
		};
		this.loadTextResource(this.hash.lang, success, error);
	};
	
	this.loadTextResource = function(lang, success, error)
	{
		this.loadResource(this.config.getTextPath(lang), "json", success, error);
	};
	
	this.queueLayout = function()
	{
		var id = IdUtil.generate();
		this.queue.layout(id, function()
		{
			self.loadLayout(id);
		});
	};
	
	this.loadLayout = function(id)
	{
		var layout = this.hash.layout;
		if(isValidString(layout))
		{
			if(this.cache.hasLayout(this.hash.value))
			{
				this.getLayoutElement().append(this.cache.getLayout(this.hash.value));
				this.hash.loadedLayout(layout);
				this.queue.complete(id);
			}
			else
			{
				var success = function(html)
				{
					var layoutRenderer = self.config.getLayoutRenderer(layout);
					if(isFunction(layoutRenderer))
					{
						html = layoutRenderer(html,
						{
							data : self.layout.response,
							hash : self.hash,
							text : self.text,
							layout	: self.layout,
							page : self.page,
							context : self.context
						});
					}
					self.getLayoutElement().html(html);
					self.hash.loadedLayout(layout);
					self.queue.complete(id);
				};
				var error = function(jqXHR, textStatus, errorThrown)
				{
					self.getLayoutElement().html("<div id=\"" + self.config.pageId + "\"></div");
					self.hash.loadedLayout(layout);
					self.queue.complete(id);
				};
				this.loadLayoutResource(layout, success, error);
			}
		}
		else
		{
			this.getLayoutElement().html("<div id=\"" + this.config.pageId + "\"></div");
			this.hash.loadedLayout(layout);
		}
	};
	
	this.loadLayoutResource = function(layout, success, error)
	{
		this.loadResource(this.config.getLayoutPath(layout), "text", success, error);
	};
	
	this.queuePage = function()
	{
		var id = IdUtil.generate();
		this.queue.page(id, function()
		{
			self.loadPage(id);
		});
	};
	
	this.loadPage = function(id)
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		if(this.cache.hasPage(this.hash.value))
		{
			this.getPageElement().append(this.cache.getPage(this.hash.value));
			this.hash.loadedModule(module);
			this.hash.loadedPage(page);
			this.hash.loadedValue();
			this.queue.complete(id);
		}
		else
		{
			var success = function(html)
			{
				var pageRenderer = self.config.getPageRenderer(module, page);
				if(isFunction(pageRenderer))
				{
					html = pageRenderer(html,
					{
						data : self.page.response,
						hash : self.hash,
						text : self.text,
						layout	: self.layout,
						page : self.page,
						context : self.context
					});
				}
				self.getPageElement().html(html);
				self.hash.loadedModule(module);
				self.hash.loadedPage(page);
				self.hash.loadedValue();
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
		}
	};
	
	this.loadPageResource = function(module, page, success, error)
	{
		this.loadResource(this.config.getPagePath(module, page), "text", success, error);
	};
	
	this.queueSections = function()
	{
		var id = IdUtil.generate();
		this.queue.sections(id, function()
		{
			$("[" + self.config.sectionAttribute + "]").each(function()
			{
				var element = $(this);
				var section = element.attr(self.config.sectionAttribute);
				self.queueSection(element, section);
			});
			self.queue.complete(id);
		});
	};
	
	this.loadSections = function()
	{
		$("[" + this.config.sectionAttribute + "]").each(function()
		{
			var element = $(this);
			var section = element.attr(self.config.sectionAttribute);
			self.loadSection(element, section);
		});
	};
	
	this.queueSection = function(element, section)
	{
		var id = IdUtil.generate();
		this.queue.section(id, function()
		{
			self.loadSection(element, section, id);
		});
	};
	
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
					data : self.page.response,
					hash : self.hash,
					text : self.text,
					layout	: self.layout,
					page : self.page,
					context : self.context
				});
			}
			element.html(html);
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
	
	this.loadSectionResource = function(section, success, error)
	{
		this.loadResource(this.config.getSectionPath(section), "text", success, error);
	};
	
	this.queueComponents = function(element, data)
	{
		if(!isSet(element))
		{
			element = this.hash.isNewLayout() ? this.getLayoutElement() : this.getPageElement();
		}
		if(!isSet(data))
		{
			data = {};
		}
		var id = IdUtil.generate();
		this.queue.components(id, function()
		{
			element.find("[" + self.config.componentAttribute + "]").each(function()
			{
				var fieldElement = $(this);
				var component = fieldElement.attr(self.config.componentAttribute);
				self.queueComponent(fieldElement, component, data);
			});
			self.queue.complete(id);
		});
	};
	
	this.loadComponents = function(element, data)
	{
		if(!isSet(element))
		{
			element = this.hash.isNewLayout() ? this.getLayoutElement() : this.getPageElement();
		}
		if(!isSet(data))
		{
			data = {};
		}
		element.find("[" + this.config.componentAttribute + "]").each(function()
		{
			var fieldElement = $(this);
			var component = fieldElement.attr(self.config.componentAttribute);
			self.loadComponent(fieldElement, component, data);
		});
	};

	this.queueComponent = function(element, component, data)
	{
		var id = IdUtil.generate();
		this.queue.component(id, function()
		{
			self.loadComponent(element, component, data, id);
		});
	};
	
	this.loadComponent = function(element, component, data, id)
	{
		var success = function(html)
		{
			var componentRenderer = self.config.getComponentRenderer();
			if(isFunction(componentRenderer))
			{
				html = componentRenderer(html,
				{
					data : data,
					hash : self.hash,
					text : self.text,
					layout	: self.layout,
					page : self.page,
					context : self.context
				});
			}
			element.html(html);
			if(!self.config.isFieldKeep(element))
			{
				element.removeAttr(self.config.componentAttribute);
			}
			self.queue.complete(id);
		};
		var error = function(jqXHR, textStatus, errorThrown)
		{
			element.html("");
			self.queue.complete(id);
		};
		this.loadComponentResource(component, success, error);
	};
	
	this.loadComponentResource = function(component, success, error)
	{
		this.loadResource(this.config.getComponentPath(component), "text", success, error);
	};
	
	this.queueTranslation = function()
	{
		var id = IdUtil.generate();
		this.queue.translation(id, function()
		{
			self.loadTranslation();
			self.queue.complete(id);
		});
	};
	
	this.loadTranslation = function()
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var translated = this.config.isTranslated(module, page);
		if(translated)
		{
			$("[" + self.config.textAttribute + "] > [" + self.config.langAttribute + "]").each(function()
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
			$("select[" + self.config.textAttribute + "]").each(function()
			{
				var element = $(this);
				element.find("option").each(function()
				{
					var optionElement = $(this);
					if(optionElement.css("display") != "none")
					{
						optionElement.prop("selected", true);
						return false;
					}
				});
			});
			$("[" + self.config.textAttribute + "]:not([" + self.config.textAttribute + "]:has(> [" + self.config.langAttribute + "='" + self.hash.lang + "']))").each(function()
			{
				var element = $(this);
				var path = element.attr(self.config.textAttribute);
				if(path != "true")
				{
					var value = ObjectUtil.getValue(self.text, path);
					value = isSet(value) ? value : "";
					element.append("<span lang=\"" + self.hash.lang + "\">" + value + "</span>");
				}
			});
			$("[" + self.config.textAttrAttribute + "]").each(function()
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
								var value = ObjectUtil.getValue(self.text, path);
								value = isSet(value) ? value : "";
							}
							element.attr(attr, value);
						}
					}
				}
			});
		}
		self.hash.loadedLang();
	};
	
	this.queueFields = function()
	{
		var id = IdUtil.generate();
		this.queue.fields(id, function()
		{
			self.loadFields();
			self.queue.complete(id);
		});
	};
	
	this.loadFields = function()
	{
		// select value
		$("select[value]:notInitedValue, select[placeholder]:notInitedValue").each(function()
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
			element.prop("inited-value", "true");
		});
		// radio group value
		$("[" + self.config.fieldRadioValueAttribute + "]:notInitedValue").each(function()
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
			element.prop("inited-value", "true");
		});
		// checkbox value
		$("input[type=checkbox][" + self.config.fieldCheckboxValueAttribute + "]:notInitedValue").each(function()
		{
			var element = $(this);
			var value = element.attr(self.config.fieldCheckboxValueAttribute);
			if(isSet(value) && value.toLowerCase() == "true")
			{
				element.prop("checked", true);
			}
			element.prop("inited-value", "true");
		});
	};
	
	this.queueLayoutReady = function()
	{
		var id = IdUtil.generate();
		this.queue.ready(id, function()
		{
			self.loadLayoutReady();
			self.queue.complete(id);
		});
	};
	
	this.loadLayoutReady = function()
	{
		if(isFunction(self.layout.ready))
		{
			self.layout.ready(self.layout.response);
		}
	};
	
	this.queuePageReady = function()
	{
		var id = IdUtil.generate();
		this.queue.ready(id, function()
		{
			self.loadPageReady();
			self.queue.complete(id);
		});
	};
	
	this.loadPageReady = function()
	{
		if(isFunction(self.page.ready))
		{
			self.page.ready(self.page.response);
		}
	};
	
	this.queueShow = function()
	{
		var id = IdUtil.generate();
		this.queue.show(id, function()
		{
			self.show();
			self.queue.complete(id);
		});
	};
	
	this.show = function()
	{
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var showTransitioner = this.config.getShowTransitioner(module, page, this.hash.state);
		var layoutElement = self.getLayoutElement();
		var pageElement = self.getPageElement();
		if(layoutElement.is(":hidden"))
		{
			pageElement.show();
			if(isFunction(showTransitioner))
			{
				showTransitioner(layoutElement);
			}
			else
			{
				layoutElement.show();
			}
		}
		else
		{
			if(isFunction(showTransitioner))
			{
				showTransitioner(pageElement);
			}
			else
			{
				pageElement.show();
			}
		}
		var devPrefill = self.config.getDevPrefill(module, page);
		if(isDev() && isSet(devPrefill))
		{
			self.dev.select("prefillFields", ["true", "false"], function(value)
			{
				var prefillFields = (value == "true");
				$("input[" + self.config.fieldRequiredAttribute + "]:not([value])").each(function()
				{
					var element = $(this);
					var name = element.attr("name");
					if(isSet(self.hash.param[name]))
					{
						element.val(self.hash.param[name]);
						self.validate(element);
					}
					else if(prefillFields && isSet(devPrefill[name]))
					{
						element.val(devPrefill[name]);
						self.validate(element);
					}
				});
			});
		}
		else
		{
			$("input[" + self.config.fieldRequiredAttribute + "]:not([value])").each(function()
			{
				var element = $(this);
				var name = element.attr("name");
				if(isSet(self.hash.param[name]))
				{
					element.val(self.hash.param[name]);
					self.validate(element);
				}
			});
		}
		self.hash.state = null;
	};
	
	this.queueCallback = function(callback)
	{
		var id = IdUtil.generate();
		this.queue.callback(id, function()
		{
			if(isFunction(callback))
			{
				callback();
			}
			self.queue.complete(id);
		});
	};
	
	this.findGroupElements = function(element, active)
	{
		active = isSet(active) ? active : true;
		var selector = "";
		selector += "input[name][type=hidden]" + (active ? ":enabled" : "") + ", ";
		selector += "input[name][type!=hidden][type!=radio][" + this.config.fieldRequiredAttribute + "]" + (active ? ":enabled:visible" : "") + ", ";
		selector += "select[name][" + this.config.fieldRequiredAttribute + "]" + (active ? ":enabled:visible" : "") + ", ";
		selector += "textarea[name][" + this.config.fieldRequiredAttribute + "]" + (active ? ":enabled:visible" : "") + ", ";
		selector += "[" + this.config.fieldRadioGroupAttribute + "][" + this.config.fieldRequiredAttribute + "]:has(input[name][type=radio]" + (active ? ":enabled:visible" : "") + ") ";
		return element.find(selector);
	}
	
	this.createRequest = function(element)
	{
		var elementRegExp = new RegExp("^(\\w+)(?:\\[|$)");
		var indexRegExp = new RegExp("\\[(\\d+)?\\]", "g");
		var valid = true;
		var request = this.hash.cloneParams();
		this.findGroupElements(element).each(function()
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
		//console.json(request);
		return { request : request, valid : valid };
	};
	
	this.validateGroup = function(element)
	{
		var validGroup = true;
		this.findGroupElements(element).each(function()
		{
			var field = self.validate($(this));
			if(!field.valid)
			{
				validGroup = false;
			}
		});
		return validGroup;
	};
	
	this.update = function(element)
	{
		element = this.getJqueryElement(element);
		var field = this.validate(element);
		if(field.valid && field.name)
		{
			var updateValue = element.attr(this.config.fieldUpdateValueAttribute);
			if(field.value != updateValue)
			{
				var request = this.hash.cloneParams();
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
		element = this.getJqueryElement(element);
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
			var result = this.createRequest($("[" + this.config.fieldGroupAttribute + "='" + submitGroup + "']"));
			valid = result.valid;
			request = result.request;
		}
		if(valid)
		{
			request = $.extend(request, ObjectUtil.parse(element.attr(this.config.fieldRequestAttribute)));
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
	
	this.getJqueryElement = function(element, selector)
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
		element = this.getJqueryElement(element);
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
			field.formValue = element.find("input[type=radio][name='" + field.name + "']:visible:enabled:checked").val();
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
	
	this.validate = function(element)
	{
		element = this.getJqueryElement(element);
		var field = this.filter(element);
		field.visible = element.is(":visible");
		field.required =  StringUtil.equals(element.attr(this.config.fieldRequiredAttribute), "true");
		field.defined = isNotEmpty(field.value);
		field.valid = !(field.required && !field.defined) ? true : false;
		field.validate = element.attr(this.config.fieldValidateAttribute);
		if(field.visible && field.valid)
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
		element = this.getJqueryElement(element);
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
		element = this.getJqueryElement(element);
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
		$("[" + this.config.fieldGroupAttribute + "]").each(function()
		{
			self.resetGroup($(this));
		});
	};
	
	this.resetGroup = function(element)
	{
		element = this.getJqueryElement(element, "[" + this.config.fieldGroupAttribute + "='{name}']");
		this.findGroupElements(element, false).each(function()
		{
			self.reset($(this));
		});
	};
	
	this.reset = function(element)
	{
		this.feedback(element);
	};
	
	this.clearGroup = function(element)
	{
		element = this.getJqueryElement(element, "[" + this.config.fieldGroupAttribute + "='{name}']");
		this.findGroupElements(element, false).each(function()
		{
			self.clear($(this));
		});
	};
	
	this.clear = function(element)
	{
		var tag = element.prop("tagName").toLowerCase();
		var type = element.attr("type");
		element.val("");
		if(type == "file")
		{
			element.attr(this.config.fieldFileValueAttribute, "");
		}
	};
	
	this.service = function(service, method, request, success, error)
	{
		if(isFileProtocol() && !isSet(this.endpoint.current()))
		{
			this.serviceFile(service, method, request, success, error);
		}
		else
		{
			var url = this.endpoint.current() + this.config.getServicePath(service, method);
			this.serviceCall(url, request, success, error);
		}
	};
	
	this.serviceFile = function(service, method, request, success, error)
	{
		var scenarios = this.config.getDevServiceResponseScenarios(service, method);
		if(scenarios.length > 0)
		{
			this.dev.select(service + "/" + method, scenarios, function(scenario)
			{
				var url = self.config.getDevServiceResponsePath(service, method, scenario);
				self.serviceCall(url, request, success, error);
			});
		}
		else
		{
			var url = self.config.getDevServiceResponsePath(service, method);
			self.serviceCall(url, request, success, error);
		}
	};
	
	this.serviceCall = function(url, request, success, error)
	{
		if(url.substring(0, 4) == "http")
		{
			var sessionId = localStorage.getItem(this.config.devSessionId);
			if(isSet(sessionId))
			{
				url += ";" + this.config.devSessionId + "=" + encodeURIComponent(sessionId);
			}
			var csrfToken = localStorage.getItem(this.config.csrfTokenStorage);
			if(isSet(csrfToken))
			{
				url += "?" + this.config.csrfTokenParam + "=" + encodeURIComponent(csrfToken);
			}
		}
		console.info(" REQUEST : " + url, request);
		var errored = false;
		$.ajax(
		{
			type		: "POST",
			url			: url,
			data		: JSON.stringify(request),
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
					error(response.errors);
				}
				else
				{
					console.info("RESPONSE : " + url, response);
					success(response);
				}
			},
			error		: function(jqXHR, textStatus, errorThrow)
			{
				if(!errored)
				{
					console.info("RESPONSE : " + url, "connection error");
					errored = true;
					error();
				}
			},
			complete	: function(jqXHR, textStatus)
			{
				if("success" != textStatus && !errored)
				{
					console.info("RESPONSE : " + url, "connection error");
					errored = true;
					error();
				}
			}
		});
	};
	
	this.Checker =
	{
		param : function(param)
		{
			return function()
			{
				return self.hash.hasParam(param);
			};
		},
		allParams : function(params)
		{
			params = isArray(params) ? params : [];
			return function()
			{
				for(var i = 0; i < params.length; i++)
				{
					if(!self.hash.hasParam(params[i]))
					{
						return false;
					}
				}
				return true;
			};
		},
		anyParams : function(params)
		{
			params = isArray(params) ? params : [];
			return function()
			{
				for(var i = 0; i < params.length; i++)
				{
					if(self.hash.hasParam(params[i]))
					{
						return true;
					}
				}
				return false;
			};
		}
		
	};
	
	this.Initializer =
	{
		params : function(service, method, successOverride, errorOverride)
		{
			return function(success, error)
			{
				success = isFunction(successOverride) ? successOverride : success;
				error = isFunction(errorOverride) ? errorOverride : error;
				self.service(service, method, self.hash.param, success, error);
			};
		}
	};
	
	this.Transitioner =
	{
		hide : function(effect)
		{
			return function(element)
			{
				element.hide(effect);
			};
		},
		show : function(effect)
		{
			return function(element)
			{
				element.show(effect);
			};
		}
	};
	
	this.Redirector =
	{
		replace : function(module, page, params)
		{
			return function()
			{
				self.hash.replace(module, page, params);
			};
		},
		next : function(module, page, params)
		{
			return function()
			{
				self.hash.next(module, page, params);
			};
		},
		back : function()
		{
			return function()
			{
				self.hash.back();
			};
		},
		refresh : function()
		{
			return function()
			{
				self.hash.refresh();
			};
		},
		reload : function()
		{
			return function()
			{
				self.hash.reload();
			};
		}
	};
	
	this.Filterer =
	{
		replace : function(regexp, replacement)
		{
			replacement = isSet(replacement) ? replacement : "";
			return function(value)
			{
				return value.replace(regexp, replacement);
			};
		}
	};
	
	this.config.filterer.number		= this.Filterer.replace(/[^0-9]/g);
	this.config.filterer.decimal	= this.Filterer.replace(/[^0-9.]/g);
	this.config.filterer.int		= function(value)
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
	this.config.filterer.float		= function(value)
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
	this.config.filterer.currency	= function(value)
	{
		return CurrencyUtil.parse(value);
	};
	
	this.Validator =
	{
		test : function(regexp)
		{
			return function(value)
			{
				return regexp.test(value);
			};
		}
	};
	
	this.config.validator.email		= this.Validator.test(/^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]+$/);
	this.config.validator.phone		= this.Validator.test(/^[0-9]{10}$/);
	this.config.validator.zip		= this.Validator.test(/^[0-9]{5}$/);
	this.config.validator.number	= this.Validator.test(/^[0-9]+(\.[0-9]{1,2})?$/);
	this.config.validator.confirm	= function(value, id)
	{
		var value2 = $("#" + id).val();
		return value == value2;
	};
	this.config.validator.date		= function(value, pattern)
	{
		return DateUtil.isValid(pattern, value);
	};
	
};



