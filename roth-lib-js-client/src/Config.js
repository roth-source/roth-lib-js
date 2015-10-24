
roth.lib.js.client.Config = roth.lib.js.client.Config || function()
{
	this.versionToken					= "{version}";
	
	this.jqueryScript					= "https://cdnjs.cloudflare.com/ajax/libs/jquery/" + this.versionToken + "/jquery.min.js";
	this.jqueryVersion					= "1.11.2";
	
	this.devTemplateScript				= "http://dist.roth.cm/roth/js/roth-lib-js-template/" + this.versionToken + "/roth-lib-js-template.js";
	this.devAppPath						= "http://dist.roth.cm/roth/js/roth-lib-js-client-dev/" + this.versionToken + "/";
	this.devScript						= "roth-lib-js-client-dev.js";
	this.devStyle						= "style/dev.css";
	this.devDataPath					= "dev/"
	this.devConfigData					= "dev";
	this.devConfigExtension				= ".json";
	this.devViewPath					= "view/";
	this.devViewExtension				= ".html";
	this.devLayoutPath					= "layout/";
	this.devLayout						= "dev";
	this.devComponentPath				= "component/";
	this.devSelectsComponent			= "selects";
	this.devSelectComponent				= "select";
	this.devPagePath					= "page/";
	this.devModule						= "dev";
	this.devLinksPage					= "links";
	this.devServicesPage				= "services";
	this.devConfigPage					= "config";
	this.devServicePath					= "service/";
	this.devServiceRequest				= "request";
	this.devServiceResponse				= "response";
	this.devServiceExtension			= ".json";
	this.devSessionId					= "jsessionid";
	this.devCsrfToken					= "csrfToken";
	
	this.defaultLang					= "en";
	this.defaultModule					= "index";
	this.defaultPage					= "index";
	
	this.endpointCurrentStorage			= "endpointCurrent";
	this.endpointAvailableStorage		= "endpointAvailable";
	this.endpointListPath				= "service/endpoint/list"
	
	this.langStorage					= "lang";
	this.langAttribute					= "lang";
	
	this.configData						= "config";
	this.configExtension				= ".json";
	
	this.textPath						= "text/";
	this.textExtension					= ".json";
	this.textAttribute					= "data-text";
	this.textAttrAttribute				= "data-text-attr";
	
	this.viewPath						= "view/";
	this.viewExtension					= ".html";
	this.viewRenderer					= null;
	
	this.layoutPath						= "layout/";
	this.layoutExtension				= null;
	this.layoutId						= "layout";
	this.layoutRenderer					= null;
	
	this.pagePath						= "page/";
	this.pageExtension					= null;
	this.pageId							= "page";
	this.pageRenderer					= null;
	
	this.sectionPath					= "section/";
	this.sectionExtension				= null;
	this.sectionAttribute				= "data-section";
	this.sectionRenderer				= null;
	
	this.componentPath					= "component/";
	this.componentExtension				= null;
	this.componentAttribute				= "data-component";
	this.componentRenderer				= null;
	
	this.errorEndpointRedirector		= null;
	this.errorParamsRedirector			= null;
	this.errorPageRedirector			= null;
	this.errorAuthRedirector			= null;
	
	this.fieldFeedbacker				= null;
	this.fieldGroupAttribute			= "data-group";
	this.fieldRequiredAttribute			= "data-required";
	this.fieldIncludeAttribute			= "data-include";
	this.fieldFilterAttribute			= "data-filter";
	this.fieldValidateAttribute			= "data-validate";
	this.fieldFeedbackAttribute			= "data-feedback";
	this.fieldSubmitGroupAttribute		= "data-submit-group";
	this.fieldDisableAttribute			= "data-disable";
	this.fieldPrerequestAttribute		= "data-prerequest";
	this.fieldPresubmitAttribute		= "data-presubmit";
	this.fieldServiceAttribute			= "data-service";
	this.fieldMethodAttribute			= "data-method";
	this.fieldSuccessAttribute			= "data-success";
	this.fieldErrorAttribute			= "data-error";
	this.fieldRequestAttribute			= "data-request";
	this.fieldUpdateValueAttribute		= "data-update-value";
	this.fieldKeepAttribute				= "data-keep";
	this.fieldEditableAttribute			= "data-editable";
	this.fieldNameAttribute				= "data-name";
	this.fieldKeyAttribute				= "data-key";
	this.fieldEditorAttribute			= "data-editor";
	this.fieldTypeAttribute				= "data-type";
	this.fieldRadioGroupAttribute		= "data-radio-group";
	this.fieldRadioValueAttribute		= "data-radio-value";
	this.fieldCheckboxValueAttribute	= "data-checkbox-value";
	this.fieldFileValueAttribute		= "data-file-value";
	
	this.servicePath					= "service/";
	this.csrfTokenParam					= "csrfToken";
	this.csrfTokenStorage				= "csrfToken";
	this.csrfTokenHeader				= "X-Csrf-Token";
	
	this.endpoint 						= {};
	this.text 							= {};
	this.layout 						= {};
	this.module 						= {};
	this.section 						= {};
	this.component 						= {};
	this.dev							= {};
	
	// registries
	this.renderer						= {};
	this.redirector						= {};
	this.filterer 						= {};
	this.validator 						= {};
	this.feedbacker 					= {};
	this.disabler						= {};
	
	this.getConfigDataPath = function()
	{
		var path = "";
		path += this.configData;
		path += this.configExtension;
		return path;
	};
	
	this.getDevConfigDataPath = function()
	{
		var path = "";
		path += this.devDataPath;
		path += this.devConfigData;
		path += this.devConfigExtension;
		return path;
	};
	
	this.isValidLang = function(lang)
	{
		return isSet(this.text[lang]);
	};
	
	this.getTextPath = function(lang)
	{
		var path = "";
		path += this.textPath;
		path += this.text[lang];
		path += this.textExtension;
		return path;
	};
	
	this.getLayoutPath = function(layout)
	{
		var path = this.getLayoutConfig(layout, "path");
		if(!isSet(path))
		{
			path = "";
			path += this.viewPath;
			path += this.layoutPath;
			path += layout;
			path += this.getLayoutExtension();
		}
		return path;
	};
	
	this.getPagePath = function(module, page)
	{
		var path =  this.getPageConfig(module, page, "path");
		if(!isSet(path))
		{
			path = "";
			path += this.viewPath;
			path += this.pagePath;
			path += module;
			path += "/";
			path += page;
			path += this.getPageExtension();
		}
		return path;
	};
	
	this.getSectionPath = function(section)
	{
		var path = "";
		path += this.viewPath;
		path += this.sectionPath;
		path += section;
		path += this.getSectionExtension();
		return path;
	};
	
	this.getComponentPath = function(component)
	{
		var path = "";
		path += this.viewPath;
		path += this.componentPath;
		path += component;
		path += this.getComponentExtension();
		return path;
	};
	
	this.getLayoutExtension = function()
	{
		return isSet(this.layoutExtension) ? this.layoutExtension : this.viewExtension;
	};
	
	this.getPageExtension = function()
	{
		return isSet(this.pageExtension) ? this.pageExtension : this.viewExtension;
	};
	
	this.getSectionExtension = function()
	{
		return isSet(this.sectionExtension) ? this.sectionExtension : this.viewExtension;
	};
	
	this.getComponentExtension = function()
	{
		return isSet(this.componentExtension) ? this.componentExtension : this.viewExtension;
	};
	
	this.getPageConfig = function(module, page, config)
	{
		var value = undefined;
		if(isSet(this.module[module]))
		{
			if(isDefined(this.module[module].page) && isDefined(this.module[module].page[page]) && isDefined(this.module[module].page[page][config]))
			{
				value = this.module[module].page[page][config];
			}
			else if(isDefined(this.module[module][config]))
			{
				value = this.module[module][config];
			}
		}
		return value;
	};
	
	this.getLayoutConfig = function(layout, config)
	{
		var value = undefined;
		if(isDefined(this.layout[layout]) && isDefined(this.layout[layout][config]))
		{
			value = this.layout[layout][config];
		}
		return value;
	};
	
	this.getLayout = function(module, page)
	{
		var layout = this.getPageConfig(module, page, "layout");
		return isValidString(layout) ? layout : module;
	};
	
	this.getErrorParamsRedirector = function(module, page)
	{
		var redirector = this.getPageConfig(module, page, "errorParamsRedirector");
		if(!isSet(redirector))
		{
			redirector = this.errorParamsRedirector;
		}
		return isString(redirector) ? this.redirector[redirector] : redirector;
	};
	
	this.getErrorPageRedirector = function(module, page)
	{
		var redirector = this.getPageConfig(module, page, "errorPageRedirector");
		if(!isSet(redirector))
		{
			redirector = this.errorPageRedirector;
		}
		return isString(redirector) ? this.redirector[redirector] : redirector;
	};
	
	this.getErrorAuthRedirector = function(module, page)
	{
		var redirector = this.getPageConfig(module, page, "errorAuthRedirector");
		if(!isSet(redirector))
		{
			redirector = this.errorPageRedirector;
		}
		return isString(redirector) ? this.redirector[redirector] : redirector;
	};
	
	this.getParams = function(module, page)
	{
		var params = this.getPageConfig(module, page, "params");
		return isArray(params) ? params : [];
	};
	
	this.getChangeParams = function(module, page)
	{
		var changeParams = this.getPageConfig(module, page, "changeParams");
		return isArray(changeParams) ? changeParams : [];
	};
	
	this.getLayoutRenderer = function(layout)
	{
		var renderer = this.getLayoutConfig(layout, "renderer");
		if(isUndefined(renderer))
		{
			renderer = isSet(this.layoutRenderer) ? this.layoutRenderer : this.viewRenderer;
		}
		return isString(renderer) ? this.renderer[renderer] : renderer;
	};
	
	this.getPageRenderer = function(module, page)
	{
		var renderer = this.getPageConfig(module, page, "renderer");
		if(isUndefined(renderer))
		{
			renderer = isSet(this.pageRenderer) ? this.pageRenderer : this.viewRenderer;
		}
		return isString(renderer) ? this.renderer[renderer] : renderer;
	};
	
	this.getSectionRenderer = function()
	{
		var renderer = isSet(this.sectionRenderer) ? this.sectionRenderer : this.viewRenderer;
		return isString(renderer) ? this.renderer[renderer] : renderer;
	};
	
	this.getComponentRenderer = function()
	{
		var renderer = isSet(this.componentRenderer) ? this.componentRenderer : this.viewRenderer;
		return isString(renderer) ? this.renderer[renderer] : renderer;
	};
	
	this.getLayoutInit = function(layout)
	{
		var init = this.getLayoutConfig(layout, "init");
		if(!isFalse(init))
		{
			if(!isObject(init))
			{
				init = {};
				init.service = this.getLayoutConfig(layout, "service");
				if(!isValidString(init.service))
				{
					init.service = layout;
				}
				init.method = "init" + StringUtil.capitalize(layout);
			}
		}
		return init;
	};
	
	this.getPageInit = function(module, page)
	{
		var init = this.getPageConfig(module, page, "init");
		if(!isFalse(init))
		{
			if(!isObject(init))
			{
				init = {};
				init.service = this.getPageConfig(module, page, "service");
				if(!isValidString(init.service))
				{
					init.service = module;
				}
				init.method = "init" + StringUtil.capitalize(page);
			}
		}
		return init;
	};
	
	this.getFeedbacker = function(element, module, page)
	{
		var feedbacker = element.attr(this.fieldFeedbackAttribute);
		if(!isValidString(feedbacker))
		{
			feedbacker = this.getPageConfig(module, page, "feedbacker");
			if(!isValidString(feedbacker) && !isFunction(feedbacker))
			{
				feedbacker = this.fieldFeedbacker;
			}
		}
		return isString(feedbacker) ? this.feedbacker[feedbacker] : feedbacker;
	};
	
	this.getDisabler = function(element)
	{
		var disable = element.attr(this.fieldDisableAttribute);
		var disabler = this.disabler[disable];
		return isFunction(disabler) ? disabler : function(){};
	};
	
	this.getServicePath = function(service, method)
	{
		var path = "";
		path += this.servicePath;
		path += service;
		if(isSet(method))
		{
			path += "/";
			path += method;
		}
		return path;
	};
	
	this.getDevServicePath = function(service, method)
	{
		var path = "";
		path += this.devDataPath;
		path += this.devServicePath;
		path += service;
		path += "/";
		path += method;
		path += "/";
		return path;
	};
	
	this.getDevServiceRequestPath = function(service, method, scenario)
	{
		var path = "";
		path += this.getDevServicePath(service, method);
		path += method;
		path += "-";
		path += this.devServiceRequest;
		if(scenario)
		{
			path += "-";
			path += scenario;
		}
		path += this.devServiceExtension;
		return path;
	};
	
	this.getDevServiceResponsePath = function(service, method, scenario)
	{
		var path = "";
		path += this.getDevServicePath(service, method);
		path += method;
		path += "-";
		path += this.devServiceResponse;
		if(scenario)
		{
			path += "-";
			path += scenario;
		}
		path += this.devServiceExtension;
		return path;
	};
	
	this.getDevServiceRequestScenarios = function(service, method)
	{
		var scenarios = [];
		if(isObject(this.dev.service) && isObject(this.dev.service[service]) && isObject(this.dev.service[service][method]) && isArray(this.dev.service[service][method].request))
		{
			scenarios = this.dev.service[service][method].request;
		}
		return scenarios;
	};
	
	this.getDevServiceResponseScenarios = function(service, method)
	{
		var scenarios = [];
		if(isObject(this.dev.service) && isObject(this.dev.service[service]) && isObject(this.dev.service[service][method]) && isArray(this.dev.service[service][method].response))
		{
			scenarios = this.dev.service[service][method].response;
		}
		return scenarios;
	};
	
	this.getEndpointListUrl = function(endpoint)
	{
		var url = endpoint;
		url += this.endpointListPath;
		return url;
	};
	
	this.getVersionRegExp = function()
	{
		return new RegExp(this.versionToken);
	}
	
	this.getJqueryScript = function()
	{
		return this.jqueryScript.replace(this.getVersionRegExp(), this.jqueryVersion);
	};
	
	this.getBootstrapStyle = function()
	{
		return this.bootstrapStyle.replace(this.getVersionRegExp(), this.bootstrapVersion);
	};
	
	this.getBootstrapScript = function()
	{
		return this.bootstrapScript.replace(this.getVersionRegExp(), this.bootstrapVersion);
	};
	
	this.getDevTemplateScript = function()
	{
		return this.devTemplateScript.replace(this.getVersionRegExp(), roth.lib.js.client.version);
	};
	
	this.getDevAppPath = function()
	{
		return this.devAppPath.replace(this.getVersionRegExp(), roth.lib.js.client.version);
	};
	
	this.getDevScript = function()
	{
		return this.getDevAppPath() + this.devScript;
	};
	
	this.getDevStyle = function()
	{
		return this.getDevAppPath() + this.devStyle;
	};
	
	this.getDevLayoutPath = function()
	{
		return this.getDevAppPath() + this.devViewPath + this.devLayoutPath + this.devLayout + this.devViewExtension;
	};
	
	this.getDevModulePath = function()
	{
		return this.getDevAppPath() + this.devViewPath + this.devPagePath + this.devModule + "/";
	};
	
	this.getDevLinksPath = function()
	{
		return this.getDevModulePath() + this.devLinksPage + this.devViewExtension;
	};
	
	this.getDevServicesPath = function()
	{
		return this.getDevModulePath() + this.devServicesPage + this.devViewExtension;
	};
	
	this.getDevConfigPath = function()
	{
		return this.getDevModulePath() + this.devConfigPage + this.devViewExtension;
	};
	
	this.getDevSelectsPath = function()
	{
		return this.getDevAppPath() + this.devViewPath + this.devComponentPath + this.devSelectsComponent + this.devViewExtension;
	};
	
	this.getDevSelectPath = function()
	{
		return this.getDevAppPath() + this.devViewPath + this.devComponentPath + this.devSelectComponent + this.devViewExtension;
	};
	
	this.isFieldKeep = function(element)
	{
		var keep = element.attr(this.fieldKeepAttribute);
		return "true" == keep;
	};
	
	this.isTranslated = function(module, page)
	{
		var translated = this.getPageConfig(module, page, "translated");
		return isBoolean(translated) ? translated : false;
	};
	
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



