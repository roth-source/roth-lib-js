
/**
 * 
 * 
 */
window.roth.js.Client = function()
{
	var self = this;
	var inited = false;
	
	this.config = new roth.js.Config();
	this.request = new roth.js.Request();
	this.endpoint = new roth.js.Endpoint();
	this.queue = new roth.js.Queue();
	this.cache = new roth.js.Cache();
	this.dev = null;
	
	this.text = {};
	this.layout = {};
	this.page = {};
	this.context = {};
	this.response = {};
	
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
				initConsole();
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
			if(!isSet(nunjucks))
			{
				document.write('<script src="' + this.config.getNunjucksScript() + '"></script>');
			}
			if(isSet(this.config.devConfigScript))
			{
				document.write('<script src="' + this.config.devConfigScript + '"></script>');
			}
			document.write('<script src="' + this.config.getDevScript() + '"></script>');
		}
	};
	
	this.initJquery = function()
	{
		jQuery.expr[":"].notInitedValidation = function(element, index, match)
		{
			return !isSet($(element).prop("inited-validation"));
		};
		jQuery.expr[":"].notInitedPlaceholder = function(element, index, match)
		{
			return !isSet($(element).prop("inited-placeholder"));
		};
		jQuery.expr[":"].notInitedSubmitter = function(element, index, match)
		{
			return !isSet($(element).prop("inited-submitter"));
		};
		jQuery.expr[":"].notInitedEditable = function(element, index, match)
		{
			return !isSet($(element).prop("inited-editable"));
		};
	};
	
	this.initConfig = function()
	{
		this.request.defaultModule = this.config.defaultModule;
		this.request.defaultPage = this.config.defaultPage;
		this.request.langStorage = this.config.langStorage;
		this.endpoint.currentStorage = this.config.endpointCurrentStorage;
		this.endpoint.availableStorage = this.config.endpointAvailableStorage;
		if(!isSet(this.config.endpoint[environment]) && isHyperTextProtocol())
		{
			var endpoint = "https://";
			endpoint += window.location.host;
			endpoint += window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1);
			this.config.endpoint[environment] = [endpoint];
		}
	};
	
	this.initDev = function()
	{
		if(isDev())
		{
			this.dev = new roth.js.Dev(this.config);
		}
	};
	
	this.load = function()
	{
		if(this.request.parse() && this.checkRequest())
		{
			this.request.log();
			this.hideView();
			this.loadEndpoints();
			this.loadInitializers();
			this.loadText();
			this.loadLayout();
			this.loadPage();
			this.loadSections();
			this.loadComponents();
			this.initText();
			this.initHandlers();
			this.initLayout();
			this.initPage();
			this.showView();
			this.queue.execute();
		}
	};
	
	this.checkRequest = function()
	{
		var valid = true;
		var module = this.request.getModule();
		var page = this.request.getPage();
		this.request.setLayout(this.config.getLayout(module, page));
		if(!(isSet(this.request.lang) && this.config.isValidLang(this.request.lang)))
		{
			var lang = localStorage.getItem(this.request.langStorage);
			if(this.config.isValidLang(lang))
			{
				this.request.setLang(lang);
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
				this.request.setLang(lang);
				localStorage.setItem(this.request.langStorage, lang);
			}
		}
		var errorParamsRedirector = this.config.getErrorParamsRedirector(module, page);
		if(isFunction(errorParamsRedirector))
		{
			if(this.request.newLayout)
			{
				var layoutChecker = this.config.getLayoutChecker(this.request.layout);
				if(isFunction(layoutChecker))
				{
					if(isFalse(layoutChecker()))
					{
						errorParamsRedirector();
						valid = false;
					}
				}
			}
			var pageChecker = this.config.getPageChecker(module, page);
			if(isFunction(pageChecker))
			{
				if(isFalse(pageChecker()))
				{
					errorParamsRedirector();
					valid = false;
				}
			}
		}
		return valid;
	};
	
	this.changeLang = function(lang)
	{
		this.cache.clearView();
		this.request.setLang(lang);
		this.request.reload();
	};
	
	this.hideView = function()
	{
		var hash = this.request.loaded.hash;
		var layout = this.request.layout;
		var module = this.request.getModule();
		var page = this.request.getPage();
		var layoutElement = this.getLayoutElement();
		var pageElement = this.getPageElement();
		var hideTransitioner = this.config.getHideTransitioner(module, page, this.request.state);
		var layoutCache = this.config.getLayoutCache(layout);
		var pageCache = this.config.getPageCache(module, page);
		if(isSet(this.request.loaded.hash) && isSet(this.request.loaded.layout) && this.request.newLayout)
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
		else if(isSet(this.request.loaded.hash) && isSet(this.request.loaded.page))
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
	};
	
	this.loadEndpoints = function()
	{
		var endpoints = sessionStorage.getItem(this.config.endpointAvailableStorage);
		if(!isSet(endpoints))
		{
			var id = Id.generate();
			this.queue.loadEndpoints(id, function()
			{
				self.callEndpointList(self.config.endpoint[environment],
				function()
				{
					self.queue.complete(id);
				},
				function()
				{
					console.info("error");
				});
			});
		}
		else
		{
			//console.info(endpoints);
		}
	}
	
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
	
	this.loadInitializers = function()
	{
		this.response = {};
		this.loadLayoutInitializer();
		this.loadPageInitializer();
	};
	
	this.loadLayoutInitializer = function(newLayout)
	{
		this.response.layout = null;
		var layout = this.request.layout;
		if(this.request.newLayout || newLayout)
		{
			var initializer = this.config.getLayoutInitializer(layout);
			if(isFunction(initializer))
			{
				var id = Id.generate();
				this.queue.loadInitializer(id, function()
				{
					initializer(function(response)
					{
						self.response.layout = response;
						self.queue.complete(id);
					},
					function(errors)
					{
						self.response.layout = null;
						self.queue.complete(id);
					});
				});
			}
		}
	};
	
	this.loadPageInitializer = function()
	{
		this.response.page = null;
		var module = this.request.getModule();
		var page = this.request.getPage();
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
			var id = Id.generate();
			this.queue.loadInitializer(id, function()
			{
				initializer(function(response)
				{
					self.response.page = response;
					self.queue.complete(id);
				},
				function(errors)
				{
					self.response.page = null;
					self.queue.complete(id);
				});
			});
		}
	};
	
	this.loadText = function()
	{
		var lang = this.request.lang;
		if(this.request.newLang)
		{
			var id = Id.generate();
			this.queue.loadText(id, function()
			{
				$.ajax(
				{
					type		: "GET",
					url			: self.config.getTextPath(lang),
					dataType	: "json",
					cache		: false,
					ifModified	: true,
					success		: function(text)
					{
						self.text = text;
						self.queue.complete(id);
					},
					error		: function(jqXHR, textStatus, errorThrown)
					{
						self.text = {};
						self.queue.complete(id);
					}
				});
			});
		}
	};
	
	this.loadLayout = function()
	{
		var layout = this.request.layout;
		var hash = this.request.hash;
		if(this.request.newLayout)
		{
			this.layout = {};
			if(isValidString(layout))
			{
				var id = Id.generate();
				this.queue.loadLayout(id, function()
				{
					if(self.cache.hasLayout(hash))
					{
						self.getLayoutElement().append(self.cache.getLayout(hash));
						self.request.loaded.layout = layout;
						self.queue.complete(id);
					}
					else
					{
						$.ajax(
						{
							type		: "GET",
							url			: self.config.getLayoutPath(layout),
							dataType	: "html",
							cache		: false,
							ifModified	: true,
							success		: function(html)
							{
								var layoutRenderer = self.config.getLayoutRenderer(layout);
								if(isFunction(layoutRenderer))
								{
									var data =
									{
										layout : self.response.layout,
										page : self.response.page,
										text : self.text
									};
									html = layoutRenderer(html, data);
								}
								self.getLayoutElement().html(html);
								self.request.loaded.layout = layout;
								self.queue.complete(id);
							},
							error		: function(jqXHR, textStatus, errorThrown)
							{
								self.getLayoutElement().html("<div id=\"" + self.config.pageId + "\"></div");
								self.request.loaded.layout = layout;
								self.queue.complete(id);
							}
						});
					}
				});
			}
			else
			{
				this.getLayoutElement().html("<div id=\"" + self.config.pageId + "\"></div");
				this.request.loaded.layout = layout;
			}
		}
	};
	
	this.loadPage = function()
	{
		var module = this.request.getModule();
		var page = this.request.getPage();
		var hash = this.request.hash;
		this.page = {};
		var id = Id.generate();
		this.queue.loadPage(id, function()
		{
			if(self.cache.hasPage(hash))
			{
				self.getPageElement().append(self.cache.getPage(hash));
				self.request.loaded.module = module;
				self.request.loaded.page = page;
				self.request.loaded.hash = self.request.hash
				self.queue.complete(id);
			}
			else
			{
				$.ajax(
				{
					type		: "GET",
					url			: self.config.getPagePath(module, page),
					dataType	: "html",
					cache		: false,
					ifModified	: true,
					success		: function(html)
					{
						var pageRenderer = self.config.getPageRenderer(module, page);
						if(isFunction(pageRenderer))
						{
							var data =
							{
								layout : self.response.layout,
								page : self.response.page,
								text : self.text
							};
							html = pageRenderer(html, data);
						}
						self.getPageElement().html(html);
						self.request.loaded.module = module;
						self.request.loaded.page = page;
						self.request.loaded.hash = self.request.hash
						self.queue.complete(id);
					},
					error		: function(jqXHR, textStatus, errorThrown)
					{
						var errorPageRedirector = self.config.getErrorPageRedirector();
						if(isFunction(errorPageRedirector))
						{
							errorPageRedirector();
						}
					}
				});
			}
		});
	};
	
	this.loadSections = function()
	{
		var sectionsId = Id.generate();
		this.queue.loadSections(sectionsId, function()
		{
			$("[" + self.config.sectionAttribute + "]").each(function()
			{
				var element = $(this);
				var section = element.attr(self.config.sectionAttribute);
				var sectionId = Id.generate();
				self.queue.loadSection(sectionId, function()
				{
					self.loadSection(element, section, sectionId);
				});
			});
			self.queue.complete(sectionsId);
		});
	};
	
	this.loadSection = function(element, section, id)
	{
		var section = isValidString(section) ? section : element.attr(this.config.sectionAttribute);
		$.ajax(
		{
			type		: "GET",
			url			: this.config.getSectionPath(section),
			dataType	: "html",
			cache		: false,
			ifModified	: true,
			success		: function(html)
			{
				var sectionRenderer = self.config.getSectionRenderer();
				if(isTrue(sectionRenderer))
				{
					html = sectionRenderer(html);
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
			},
			error		: function(jqXHR, textStatus, errorThrown)
			{
				element.html("");
				element.removeAttr(self.config.sectionAttribute);
				if(isSet(id))
				{
					self.queue.complete(id);
				}
			}
		});
	};
	
	this.loadComponents = function(element)
	{
		if(!isSet(element))
		{
			element = this.request.newLayout ? this.getLayoutElement() : this.getPageElement();
		}
		var componentsId = Id.generate();
		this.queue.loadComponents(componentsId, function()
		{
			element.find("[" + self.config.componentAttribute + "]").each(function()
			{
				var fieldElement = $(this);
				var component = fieldElement.attr(self.config.componentAttribute);
				var data =
				{
					layout : self.response.layout,
					page : self.response.page,
					text : self.text,
					params : self.request.params
				};
				var componentId = Id.generate();
				self.queue.loadComponent(componentId, function()
				{
					self.loadComponent(fieldElement, component, data, componentId);
				});
			});
			self.queue.complete(componentsId);
		});
	};
	
	this.loadComponent = function(element, component, data, id)
	{
		$.ajax(
		{
			type		: "GET",
			url			: this.config.getComponentPath(component),
			dataType	: "html",
			cache		: false,
			ifModified	: true,
			success		: function(html)
			{
				var componentRenderer = self.config.getComponentRenderer();
				if(isFunction(componentRenderer))
				{
					html = componentRenderer(html, data);
				}
				element.html(html);
				if(!self.config.isFieldKeep(element))
				{
					element.removeAttr(self.config.componentAttribute);
				}
				if(isSet(id))
				{
					self.queue.complete(id);
				}
			},
			error		: function(jqXHR, textStatus, errorThrown)
			{
				element.html("");
				if(isSet(id))
				{
					self.queue.complete(id);
				}
			}
		});
	};
	
	this.reloadComponents = function()
	{
		this.loadLayoutInitializer(true);
		this.loadPageInitializer();
		this.loadComponents(this.getLayoutElement());
		this.initHandlers();
		this.queue.execute();
	};
	
	this.reloadPageComponents = function()
	{
		this.loadPageInitializer();
		this.loadComponents(this.getPageElement());
		this.initHandlers();
		this.queue.execute();
	};
	
	this.initText = function()
	{
		var id = Id.generate();
		this.queue.initText(id, function()
		{
			$("[" + self.config.textAttribute + "] > [" + self.config.langAttribute + "]").each(function()
			{
				var element = $(this);
				var lang = element.attr(self.config.langAttribute);
				if(lang == self.request.lang)
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
			$("[" + self.config.textAttribute + "]:not([" + self.config.textAttribute + "]:has(> [" + self.config.langAttribute + "='" + self.request.lang + "']))").each(function()
			{
				var element = $(this);
				var path = element.attr(self.config.textAttribute);
				if(path != "true")
				{
					var value = self.getTextValue(path);
					element.append("<span lang=\"" + self.request.lang + "\">" + value + "</span>");
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
							var value = element.attr("data-" + attr + "-" + self.request.lang);
							if(!isValidString(value) && path != "true")
							{
								value = self.getTextValue(path);
							}
							element.attr(attr, value);
						}
					}
				}
			});
			self.request.loaded.lang = self.request.lang;
			self.queue.complete(id);
		});
	};
	
	this.initHandlers = function()
	{
		var id = Id.generate();
		this.queue.initHandlers(id, function()
		{
			// validation
			$("input[" + self.config.fieldRequiredAttribute + "]:notInitedValidation, " + 
			  "select[" + self.config.fieldRequiredAttribute + "]:notInitedValidation, " +
			  "textarea[" + self.config.fieldRequiredAttribute + "]:notInitedValidation"
			).each(function()
			{
				var element = $(this);
				var type = element.attr(self.config.fieldTypeAttribute);
				if(type == "date")
				{
					element.change(function()
					{
						self.validateField(element);
					});
				}
				else
				{
					element.blur(function()
					{
						self.validateField(element);
					});
				}
				element.prop("inited-validation", "true");
			});
			/// placeholder
			$("select[placeholder]:notInitedPlaceholder").each(function()
			{
				var element = $(this);
				var color = element.css("color");
				element.css("color", "#999");
				element.find("option, optgroup").css("color", color);
				element.prepend('<option selected="selected" value="" style="display:none;">' + element.attr("placeholder") + '</option>');
				element.change(function()
				{
					element.css("color", color);
				});
				element.prop("inited-placeholder", "true");
			});
			// submitter
			$("[" + self.config.fieldSubmitAttribute + "]:notInitedSubmitter").each(function()
			{
				var element = $(this);
				self.initSubmitter(element);
				element.prop("inited-submitter", "true");
			});
			// editable
			$("[" + self.config.fieldEditableAttribute + "]:notInitedEditable").each(function()
			{
				var element = $(this);
				self.initEditable(element);
				element.prop("inited-editable", "true");
			});
			self.queue.complete(id);
		});
	};
	
	this.initSubmitter = function(element)
	{
		var submit = element.attr(this.config.fieldSubmitAttribute);
		var disable = element.attr(this.config.fieldDisableAttribute);
		var disabler = this.config.disabler[disable];
		var presubmit = element.attr(this.config.fieldPresubmitAttribute);
		var service = element.attr(this.config.fieldServiceAttribute);
		var method = element.attr(this.config.fieldMethodAttribute);
		var success = element.attr(this.config.fieldSuccessAttribute);
		var error = element.attr(this.config.fieldErrorAttribute);
		element.click(function()
		{
			disabler = isFunction(disabler) ? disabler : noop;
			disabler(element, true);
			var groupElement = self.submitterGroupElement(element);
			if(groupElement.length > 0 && self.validateGroup(groupElement))
			{
				if(isValidString(presubmit))
				{
					eval(presubmit);
				}
				var request = self.createRequest(groupElement);
				self.service(service, method, request, function(response)
				{
					disabler(element, false);
					if(isValidString(success))
					{
						eval(success);
					}
				},
				function(errors)
				{
					disabler(element, false);
					if(isValidString(error))
					{
						eval(error);
					}
				});
			}
			else
			{
				disabler(element, false);
			}
		});
	};
	
	this.initEditable = function(element)
	{
		var editable = element.attr(this.config.fieldEditableAttribute);
		var editor = element.attr(this.config.fieldEditorAttribute);
		var editorElement = $("#" + editor);
		if(editable == "text" || editable == "date" || editable == "select")
		{
			element.click(function()
			{
				element.hide();
				editorElement.show();
				editorElement.focus();
				var value = $.trim(element.text());
				if(editable == "text" || editable == "date")
				{
					editorElement.val(value);
				}
				else if(editable == "select")
				{
					editorElement.find("option:contains('" + value + "')").attr("selected", "selected");
				}
			});
			if(editable == "text" || editable == "date")
			{
				editorElement.keypress(function(event)
				{
					if(event.keyCode == 13)
					{
						self.submitEditable(element);
					}
					else if(event.keyCode == 27)
					{
						editorElement.hide();
						element.show();
					}
				});
			}
			else if(editable == "select")
			{
				editorElement.change(function()
				{
					if(editorElement.is(":visible"))
					{
						self.submitEditable(element);
					}
				});
			}
			editorElement.blur(function()
			{
				if(editorElement.is(":visible"))
				{
					editorElement.hide();
					element.show();
				}
			});
		}
		else if(editable == "checkbox")
		{
			element.change(function()
			{
				self.submitEditable(element);
			});
		}
	};
	
	this.submitEditable = function(element, editorElement)
	{
		var editable = element.attr(this.config.fieldEditableAttribute);
		var service = element.attr(this.config.fieldServiceAttribute);
		var method = element.attr(this.config.fieldMethodAttribute);
		var name = element.attr(this.config.fieldNameAttribute);
		var key = element.attr(this.config.fieldKeyAttribute);
		var editor = element.attr(this.config.fieldEditorAttribute);
		var editorElement = isValidString(editor) ? $("#" + editor) : $();
		if(editable == "text" || editable == "select" || editable == "date" || editable == "checkbox")
		{
			var oldValue = null;
			var value = null;
			var text = null;
			if(editable == "checkbox")
			{
				value = element.is(":checked");
			}
			else if(editable == "select")
			{
				oldValue = $.trim(element.text());
				value = editorElement.val();
				text = editorElement.find("option:selected").text();
			}
			else
			{
				oldValue = $.trim(element.text());
				value = editorElement.val();
				text = value;
			}
			if(value != oldValue)
			{
				var request = this.request.cloneParams();
				request.key = key;
				request.name = name;
				request.value = value;
				this.service(service, method, request,
				function(response)
				{
					if(editable == "text" || editable == "date" || editable == "select")
					{
						editorElement.hide();
						if(isValidString(text))
						{
							element.text(text);
						}
						else
						{
							element.html("&nbsp;")
						}
						element.show();
					}
				},
				function(errors)
				{
					if(editable == "text" || editable == "date" || editable == "select")
					{
						editorElement.hide();
						element.show();
					}
				});
			}
			else
			{
				if(editable == "text" || editable == "date" || editable == "select")
				{
					editorElement.hide();
					element.show();
				}
			}
		}
	};
	
	this.getTextValue = function(path)
	{
		var value = this.getObjectValue(this.text, path);
		return isString(value) ? value : "";
	};
	
	this.getObjectValue = function(object, path)
	{
		var paths = path.split(".");
		for(var i in paths)
		{
			if(isTrue(object[paths[i]]))
			{
				object = object[paths[i]];
			}
			else
			{
				object = null;
				break;
			}
		}
		return object;
	};
	
	this.getLayoutElement = function()
	{
		return $("#" + this.config.layoutId);
	};
	
	this.getPageElement = function()
	{
		return $("#" + this.config.pageId);
	};
	
	this.initLayout = function()
	{
		var id = Id.generate();
		this.queue.initLayout(id, function()
		{
			if(self.request.newLayout && isFunction(self.layout.init))
			{
				self.layout.init(self.response.layout);
			}
			self.queue.complete(id);
		});
	};
	
	this.initPage = function()
	{
		var id = Id.generate();
		this.queue.initPage(id, function()
		{
			if(isFunction(self.page.init))
			{
				self.page.init(self.response.page);
			}
			self.queue.complete(id);
		});
	};
	
	this.showView = function()
	{
		var module = this.request.getModule();
		var page = this.request.getPage();
		var showTransitioner = this.config.getShowTransitioner(module, page, this.request.state);
		var id = Id.generate();
		this.queue.showView(id, function()
		{
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
						if(isSet(self.request.params[name]))
						{
							element.val(self.request.params[name]);
							self.validateField(element);
						}
						else if(prefillFields && isSet(devPrefill[name]))
						{
							element.val(devPrefill[name]);
							self.validateField(element);
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
					if(isSet(self.request.params[name]))
					{
						element.val(self.request.params[name]);
						self.validateField(element);
					}
				});
			}
			self.request.state = null;
			self.queue.complete(id);
		});
	};
	
	this.submitterGroupElement = function(element)
	{
		return element.closest("[" + this.config.fieldGroupAttribute + "], #" + this.config.pageId + ", #" + this.config.layoutId).first();
	};
	
	this.createRequest = function(element)
	{
		var request = this.request.cloneParams();
		element.find("input[type='hidden']").each(function()
		{
			var element = $(this);
			var name = element.attr("name"); 
			var value = element.val();
			if(isTrue(name) && isTrue(value))
			{
				request[name] = value;
			}
		});
		element.find("input[" + this.config.fieldRequiredAttribute + "], textarea[" + self.config.fieldRequiredAttribute + "]").each(function()
		{
			var element = $(this);
			if(element.is(":visible") || element.attr("type") != "hidden")
			{
				var name = element.attr("name");
				var type = element.attr("type");
				if(isTrue(name))
				{
					if(type == "checkbox")
					{
						var value = element.is(":checked");
						request[name] = value;
					}
					else
					{
						var value = self.filterField(element);
						if(isTrue(value))
						{
							request[name] = value;
						}
					}
				}
			}
		});
		element.find("select[" + this.config.fieldRequiredAttribute + "]").each(function()
		{
			var element = $(this);
			if(element.is(":visible"))
			{
				var name = element.attr("name");
				if(isTrue(name))
				{
					var value = element.val();
					request[name] = value;
				}
			}
		});
		return request;
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
		if(isString(element))
		{
			element = $("[" + this.config.fieldGroupAttribute + "='" + element + "']");
		}
		element.find("input[" + this.config.fieldRequiredAttribute + "], textarea[" + self.config.fieldRequiredAttribute + "]").each(function()
		{
			var fieldElement = $(this);
			fieldElement.val("");
			self.displayField(fieldElement, "reset");
		});
		element.find("select[" + self.config.fieldRequiredAttribute + "]").each(function()
		{
			var fieldElement = $(this);
			fieldElement[0].selectedIndex = 0;
			var placeholder = fieldElement.attr("placeholder");
			if(isSet(placeholder))
			{
				fieldElement.css("color", "#999");
			}
			self.displayField(fieldElement, "reset");
		});
	}
	
	this.validateGroup = function(element)
	{
		var validGroup = true;
		element.find("input[" + this.config.fieldRequiredAttribute + "]:visible, select[" + self.config.fieldRequiredAttribute + "]:visible, textarea[" + self.config.fieldRequiredAttribute + "]:visible").each(function()
		{
			if(!self.validateField($(this)))
			{
				validGroup = false;
			}
		});
		return validGroup;
	};
	
	this.filterField = function(element)
	{
		var value = element.val();
		if(isValidString(value))
		{
			value = value.trim();
			var filterer = this.config.getFilterer(element);
			if(isFunction(filterer))
			{
				value = filterer(value);
			}
		}
		return value;
	};
	
	this.validateField = function(element)
	{
		var valid = true;
		var value = this.filterField(element);
		var required = element.attr(this.config.fieldRequiredAttribute);
		if(isTrue(element.attr("multiple")))
		{
			if(isArray(value))
			{
				for(var i in value)
				{
					valid = isValidString(value[i]);
					if(isTrue(valid))
					{
						break;
					}
				}
			}
			else
			{
				valid = false;
			}
		}
		else
		{
			valid = isTrue(value);
		}
		if(valid)
		{
			var validators = this.config.getValidators(element);
			if(isArray(validators))
			{
				for(var i in validators)
				{
					var validator = validators[i];
					var validate = element.attr(this.config.fieldValidateAttribute);
					var context = "";
					var index = validate.indexOf(":");
					if(index > 0)
					{
						context = validate.slice(index + 1);
					}
					valid = validator(value, context);
					if(!valid)
					{
						break;
					}
				}
			}
		}
		else if(!valid && !(isTrue(required) && required.toLowerCase() == "true"))
		{
			valid = true;
		}
		this.displayField(element, isTrue(valid) ? "valid" : "invalid");
		return valid;
	};
	
	this.displayField = function(element, status)
	{
		var displayor = this.config.getDisplayor(element);
		if(isFunction(displayor))
		{
			displayor(element, status);
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
		var responses = this.config.getDevServiceResponses(service, method);
		if(responses.length > 1)
		{
			this.dev.select(service + "/" + method, responses, function(response)
			{
				var url = self.config.getDevServiceResponsePath(service, method, response);
				self.serviceCall(url, request, success, error);
			});
		}
		else
		{
			var url = self.config.getDevServiceResponsePath(service, method, responses[0]);
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
				return self.request.hasParam(param);
			};
		},
		allParams : function(params)
		{
			params = isArray(params) ? params : [];
			return function()
			{
				for(var i = 0; i < params.length; i++)
				{
					if(!self.request.hasParam(params[i]))
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
					if(self.request.hasParam(params[i]))
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
				self.service(service, method, self.request.params, success, error);
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
				self.request.replace(module, page, params);
			};
		},
		next : function(module, page, params)
		{
			return function()
			{
				self.request.next(module, page, params);
			};
		},
		back : function()
		{
			return function()
			{
				self.request.back();
			};
		},
		refresh : function()
		{
			return function()
			{
				self.request.refresh();
			};
		},
		reload : function()
		{
			return function()
			{
				self.request.reload();
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
	this.config.validator.confirm	= function(value, context)
	{
		var value2 = $("#" + context).val();
		return value == value2;
	};
	
};
