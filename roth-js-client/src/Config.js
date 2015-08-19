
roth.js.client.Config = function()
{
	this.versionToken				= "{version}";
	
	this.jqueryScript				= "https://cdnjs.cloudflare.com/ajax/libs/jquery/" + this.versionToken + "/jquery.min.js";
	this.jqueryVersion				= "1.11.2";
	
	this.bootstrapStyle				= "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/" + this.versionToken + "/css/bootstrap.min.css";
	this.bootstrapScript			= "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/" + this.versionToken + "/js/bootstrap.min.js";
	this.bootstrapVersion			= "3.3.4";
	
	this.nunjucksScript				= "https://mozilla.github.io/nunjucks/files/nunjucks.min.js";
	this.nunjucksVersion			= "1.3.3";
	
	this.devPath					= "http://dist.roth.cm/roth/js/roth-js-client-dev/" + this.versionToken + "/";
	this.devScript					= "roth-js-client-dev.js";
	this.devConfigScript			= null;
	this.devViewPath				= "view/";
	this.devViewExtension			= ".html";
	this.devLayoutPath				= "layout/";
	this.devLayout					= "dev";
	this.devComponentPath			= "component/";
	this.devSelectComponent			= "select";
	this.devPagePath				= "page/";
	this.devModule					= "dev";
	this.devLinksPage				= "links";
	this.devServicesPage			= "services";
	this.devConfigPage				= "config";
	this.devServicePath				= "dev/service/";
	this.devServiceRequest			= "request";
	this.devServiceExtension		= ".json";
	this.devSessionId				= "jsessionid";
	this.devCsrfToken				= "csrfToken";
	
	this.defaultLang				= "en";
	this.defaultModule				= "index";
	this.defaultPage				= "index";
	
	this.endpointCurrentStorage		= "endpointCurrent";
	this.endpointAvailableStorage	= "endpointAvailable";
	this.endpointListPath			= "service/endpoint/list"
	
	this.langStorage				= "lang";
	this.langAttribute				= "lang";
	
	this.textPath					= "text/";
	this.textExtension				= ".json";
	this.textAttribute				= "data-text";
	this.textAttrAttribute			= "data-text-attr";
	
	this.viewPath					= "view/";
	this.viewExtension				= ".html";
	this.viewRenderer				= null;
	
	this.layoutPath					= "layout/";
	this.layoutExtension			= null;
	this.layoutId					= "layout";
	this.layoutRenderer				= null;
	
	this.pagePath					= "page/";
	this.pageExtension				= null;
	this.pageId						= "page";
	this.pageRenderer				= null;
	
	this.sectionPath				= "section/";
	this.sectionExtension			= null;
	this.sectionAttribute			= "data-section";
	this.sectionRenderer			= null;
	
	this.componentPath				= "component/";
	this.componentExtension			= null;
	this.componentAttribute			= "data-component";
	this.componentRenderer			= null;
	
	this.errorEndpointRedirector	= null;
	this.errorParamsRedirector		= null;
	this.errorPageRedirector		= null;
	
	this.fieldDisplayor				= null;
	this.fieldGroupAttribute		= "data-group";
	this.fieldRequiredAttribute		= "data-required";
	this.fieldFilterAttribute		= "data-filter";
	this.fieldValidateAttribute		= "data-validate";
	this.fieldDisplayAttribute		= "data-display";
	this.fieldSubmitAttribute		= "data-submit";
	this.fieldDisableAttribute		= "data-disable";
	this.fieldPresubmitAttribute	= "data-presubmit";
	this.fieldServiceAttribute		= "data-service";
	this.fieldMethodAttribute		= "data-method";
	this.fieldSuccessAttribute		= "data-success";
	this.fieldErrorAttribute		= "data-error";
	this.fieldKeepAttribute			= "data-keep";
	this.fieldEditableAttribute		= "data-editable";
	this.fieldNameAttribute			= "data-name";
	this.fieldKeyAttribute			= "data-key";
	this.fieldEditorAttribute		= "data-editor";
	this.fieldTypeAttribute			= "data-type";
	
	this.servicePath				= "service/";
	this.csrfTokenParam				= "csrfToken";
	this.csrfTokenStorage			= "csrfToken";
	this.csrfTokenHeader			= "X-Csrf-Token";
	
	this.replaceHideTransitioner	= null;
	this.replaceShowTransitioner	= null;
	this.nextHideTransitioner		= null;
	this.nextShowTransitioner		= null;
	this.backHideTransitioner		= null;
	this.backShowTransitioner		= null;
	
	this.endpoint 					= {};
	this.text 						= {};
	this.layout 					= {};
	this.module 					= {};
	this.section 					= {};
	this.component 					= {};
	this.dev						=
	{
		link 						: {},
		service 					: {}
	};
	
	// registries
	this.checker					= {};
	this.initializer				= {};
	this.transitioner				= {};
	this.renderer					= {};
	this.redirector					= {};
	this.filterer 					= {};
	this.validator 					= {};
	this.displayor 					= {};
	this.disabler					= {};
	
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
		return isTrue(this.layoutExtension) ? this.layoutExtension : this.viewExtension;
	};
	
	this.getPageExtension = function()
	{
		return isTrue(this.pageExtension) ? this.pageExtension : this.viewExtension;
	};
	
	this.getSectionExtension = function()
	{
		return isTrue(this.sectionExtension) ? this.sectionExtension : this.viewExtension;
	};
	
	this.getComponentExtension = function()
	{
		return isTrue(this.componentExtension) ? this.componentExtension : this.viewExtension;
	};
	
	this.getPageConfig = function(module, page, config)
	{
		var value = null;
		if(isSet(this.module[module]))
		{
			if(isSet(this.module[module].page) && isSet(this.module[module].page[page]) && isSet(this.module[module].page[page][config]))
			{
				value = this.module[module].page[page][config];
			}
			else if(isSet(this.module[module][config]))
			{
				value = this.module[module][config];
			}
		}
		return value;
	};
	
	this.getLayoutConfig = function(layout, config)
	{
		var value = null;
		if(isSet(this.layout[layout]) && isSet(this.layout[layout][config]))
		{
			value = this.layout[layout][config];
		}
		return value;
	};
	
	this.getLayout = function(module, page)
	{
		return this.getPageConfig(module, page, "layout");
	};
	
	this.getErrorParamsRedirector = function(module, page)
	{
		var redirector = this.getPageConfig(module, page, "errorParamsRedirector");
		if(isFalse(redirector))
		{
			redirector = this.errorParamsRedirector;
		}
		return isString(redirector) ? this.redirector[redirector] : redirector;
	};
	
	this.getErrorPageRedirector = function(module, page)
	{
		var redirector = this.getPageConfig(module, page, "errorPageRedirector");
		if(isFalse(redirector))
		{
			redirector = this.errorPageRedirector;
		}
		return isString(redirector) ? this.redirector[redirector] : redirector;
	};
	
	this.getPageChecker = function(module, page)
	{
		var checker = this.getPageConfig(module, page, "checker");
		return isString(checker) ? this.checker[checker] : checker;
	};
	
	this.getLayoutChecker = function(layout)
	{
		var checker = this.getLayoutConfig(layout, "checker");
		return isString(checker) ? this.checker[checker] : checker;
	};
	
	this.getLayoutRenderer = function(layout)
	{
		var renderer = this.getLayoutConfig(layout, "renderer");
		if(isFalse(renderer))
		{
			renderer = isTrue(this.layoutRenderer) ? this.layoutRenderer : this.viewRenderer;
		}
		return isString(renderer) ? this.renderer[renderer] : renderer;
	};
	
	this.getPageRenderer = function(module, page)
	{
		var renderer = this.getPageConfig(module, page, "renderer");
		if(isFalse(renderer))
		{
			renderer = isTrue(this.pageRenderer) ? this.pageRenderer : this.viewRenderer;
		}
		return isString(renderer) ? this.renderer[renderer] : renderer;
	};
	
	this.getSectionRenderer = function()
	{
		var renderer = isTrue(this.sectionRenderer) ? this.sectionRenderer : this.viewRenderer;
		return isString(renderer) ? this.renderer[renderer] : renderer;
	};
	
	this.getComponentRenderer = function()
	{
		var renderer = isTrue(this.componentRenderer) ? this.componentRenderer : this.viewRenderer;
		return isString(renderer) ? this.renderer[renderer] : renderer;
	};
	
	this.getHideTransitioner = function(module, page, state)
	{
		var transitioner = null;
		if("next" == state)
		{
			transitioner = this.getNextHideTransitioner(module, page);
		}
		else if("back" == state)
		{
			transitioner = this.getBackHideTransitioner(module, page);
		}
		else
		{
			transitioner = this.getReplaceHideTransitioner(module, page);
		}
		return transitioner;
	};
	
	this.getShowTransitioner = function(module, page, state)
	{
		var transitioner = null;
		if("next" == state)
		{
			transitioner = this.getNextShowTransitioner(module, page);
		}
		else if("back" == state)
		{
			transitioner = this.getBackShowTransitioner(module, page);
		}
		else
		{
			transitioner = this.getReplaceShowTransitioner(module, page);
		}
		return transitioner;
	};
	
	this.getReplaceHideTransitioner = function(module, page)
	{
		var transitioner = this.getPageConfig(module, page, "replaceHideTransitioner");
		if(isFalse(transitioner))
		{
			transitioner = this.replaceHideTransitioner;
		}
		return isString(transitioner) ? this.transitioner[transitioner] : transitioner;
	};
	
	this.getReplaceShowTransitioner = function(module, page)
	{
		var transitioner = this.getPageConfig(module, page, "replaceShowTransitioner");
		if(isFalse(transitioner))
		{
			transitioner = this.replaceShowTransitioner;
		}
		return isString(transitioner) ? this.transitioner[transitioner] : transitioner;
	};
	
	this.getNextHideTransitioner = function(module, page)
	{
		var transitioner = this.getPageConfig(module, page, "nextHideTransitioner");
		if(isFalse(transitioner))
		{
			transitioner = this.nextHideTransitioner;
		}
		return isString(transitioner) ? this.transitioner[transitioner] : transitioner;
	};
	
	this.getNextShowTransitioner = function(module, page)
	{
		var transitioner = this.getPageConfig(module, page, "nextShowTransitioner");
		if(isFalse(transitioner))
		{
			transitioner = this.nextShowTransitioner;
		}
		return isString(transitioner) ? this.transitioner[transitioner] : transitioner;
	};
	
	this.getBackHideTransitioner = function(module, page)
	{
		var transitioner = this.getPageConfig(module, page, "backHideTransitioner");
		if(isFalse(transitioner))
		{
			transitioner = this.backHideTransitioner;
		}
		return isString(transitioner) ? this.transitioner[transitioner] : transitioner;
	};
	
	this.getBackShowTransitioner = function(module, page)
	{
		var transitioner = this.getPageConfig(module, page, "backShowTransitioner");
		if(isFalse(transitioner))
		{
			transitioner = this.backShowTransitioner;
		}
		return isString(transitioner) ? this.transitioner[transitioner] : transitioner;
	};
	
	this.getLayoutInitializer = function(layout)
	{
		var initializer = this.getLayoutConfig(layout, "initializer");
		return isString(initializer) ? this.initializer[initializer] : initializer;
	};
	
	this.getPageInitializer = function(module, page)
	{
		var initializer = this.getPageConfig(module, page, "initializer");
		return isString(initializer) ? this.initializer[initializer] : initializer;
	};
	
	this.getFilterer = function(element)
	{
		var filterer = element.attr(this.fieldFilterAttribute);
		return isString(filterer) ? this.filterer[filterer] : filterer;
	};
	
	this.getValidators = function(element)
	{
		var validators = [];
		var validate = element.attr(this.fieldValidateAttribute);
		if(isSet(validate))
		{
			var validates = validate.split(",");
			for(var i in validates)
			{
				var validator = this.getValidator(validates[i]);
				if(isFunction(validator))
				{
					validators.push(validator);
				}
			}
		}
		return validators;
	};
	
	this.getValidator = function(validator)
	{
		if(isSet(validator))
		{
			var index = validator.indexOf(":");
			if(index > 0)
			{
				validator = validator.slice(0, index);
			}
		}
		return isString(validator) ? this.validator[validator] : validator;
	};
	
	this.getDisplayor = function(element)
	{
		var displayor = element.attr(this.fieldDisplayAttribute);
		if(isFalse(displayor))
		{
			displayor = this.fieldDisplayor;
		}
		return isString(displayor) ? this.displayor[displayor] : displayor;
	};
	
	this.getDevPrefill = function(module, page)
	{
		var devPrefill = this.getPageConfig(module, page, "devPrefill");
		return isObject(devPrefill) ? devPrefill : null;
	};
	
	this.getLayoutCache = function(layout)
	{
		var cache = this.getLayoutConfig(layout, "cache");
		return isBoolean(cache) ? cache : false;
	};
	
	this.getPageCache = function(module, page)
	{
		var cache = this.getPageConfig(module, page, "cache");
		return isBoolean(cache) ? cache : false;
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
		path += this.devServicePath;
		path += service;
		path += "/";
		path += method;
		path += "/";
		return path;
	};
	
	this.getDevServiceRequestPath = function(service, method)
	{
		var path = "";
		path += this.getDevServicePath(service, method);
		path += this.devServiceRequest;
		path += this.devServiceExtension;
		return path;
	};
	
	this.getDevServiceResponsePath = function(service, method, response)
	{
		var path = "";
		path += this.getDevServicePath(service, method);
		path += response;
		path += this.devServiceExtension;
		return path;
	};
	
	this.getDevServiceResponses = function(service, method)
	{
		var responses = ["success"];
		if(isObject(this.dev.service[service]) && isArray(this.dev.service[service][method]))
		{
			responses = this.dev.service[service][method];
		}
		return responses;
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
	
	this.getNunjucksScript = function()
	{
		return this.nunjucksScript.replace(this.getVersionRegExp(), this.nunjucksVersion);
	};
	
	this.getDevPath = function()
	{
		return this.devPath.replace(this.getVersionRegExp(), roth.js.client.version);
	};
	
	this.getDevScript = function()
	{
		return this.getDevPath() + this.devScript;
	};
	
	this.getDevLayoutPath = function()
	{
		return this.getDevPath() + this.devViewPath + this.devLayoutPath + this.devLayout + this.devViewExtension;
	};
	
	this.getDevModulePath = function()
	{
		return this.getDevPath() + this.devViewPath + this.devPagePath + this.devModule + "/";
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
	
	this.getDevSelectPath = function()
	{
		return this.getDevPath() + this.devViewPath + this.devComponentPath + this.devSelectComponent + this.devViewExtension;
	};
	
	this.isFieldKeep = function(element)
	{
		var keep = element.attr(this.fieldKeepAttribute);
		return "true" == keep;
	};
	
	this.getPageChangeParams = function(module, page)
	{
		var changeParams = this.getPageConfig(module, page, "changeParams");
		return isArray(changeParams) ? changeParams : [];
	};
	
};
