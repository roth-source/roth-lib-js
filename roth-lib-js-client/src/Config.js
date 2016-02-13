

/**
 * @class
 */
roth.lib.js.client.Config = roth.lib.js.client.Config || function()
{
	/**
	 * @lends Config.prototype
	 */
	
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
	
	this.langStorage					= "lang";
	this.langAttribute					= "lang";
	
	this.configData						= "config";
	this.configExtension				= ".json";
	
	this.textPath						= "text/";
	this.textExtension					= ".json";
	this.textAttribute					= "data-text";
	this.textAttrAttribute				= "data-text-attr";
	this.textParamAttribute				= "data-text-param";
	this.textOverride					= null;
	
	this.viewPath						= "view/";
	this.viewExtension					= ".html";
	
	this.layoutPath						= "layout/";
	this.layoutExtension				= null;
	this.layoutId						= "layout";
	
	this.pagePath						= "page/";
	this.pageExtension					= null;
	this.pageId							= "page";
	this.pageLoader						= null;
	
	this.componentPath					= "component/";
	this.componentExtension				= null;
	this.componentAttribute				= "data-component";
	
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
	this.fieldEditableAttribute			= "data-editable";
	this.fieldNameAttribute				= "data-name";
	this.fieldKeyAttribute				= "data-key";
	this.fieldEditorAttribute			= "data-editor";
	this.fieldTypeAttribute				= "data-type";
	this.fieldRadioGroupAttribute		= "data-radio-group";
	this.fieldRadioValueAttribute		= "data-radio-value";
	this.fieldCheckboxValueAttribute	= "data-checkbox-value";
	this.fieldFileValueAttribute		= "data-file-value";
	
	this.endpointStorage				= "endpoint";
	this.endpointPath					= "endpoint/";
	this.servicePath					= "service/";
	this.csrfTokenParam					= "csrfToken";
	this.csrfTokenStorage				= "csrfToken";
	this.csrfTokenHeader				= "X-Csrf-Token";
	
	this.langs							= [];
	this.endpoint 						= {};
	this.layout 						= {};
	this.module 						= {};
	this.dev							= {};
	
	// registries
	this.redirector						= {};
	this.filterer 						= {};
	this.validator 						= {};
	this.feedbacker 					= {};
	this.disabler						= {};
	
	this.getEndpointStorage = function()
	{
		return this.endpointStorage + "-" + getEnvironment();
	};
	
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
		return inArray(lang, this.langs);
	};
	
	this.validateLangs = function()
	{
		if(!this.isValidLang(this.defaultLang))
		{
			this.langs.push(this.defaultLang);
		}
	};
	
	this.getModuleText = function(module)
	{
		var text = this.getModuleConfig(module, "text");
		return isSet(text) ? text : "";
	};
	
	this.getModuleTextPath = function(module, lang)
	{
		return this.getTextPath(this.getModuleText(module), lang);
	};
	
	this.getTextPath = function(text, lang)
	{
		var path = undefined;
		if(isValidString(text))
		{
			path = "";
			path += this.textPath;
			path += text;
			path += "_";
			path += lang;
			if(isSet(this.textOverride))
			{
				path += "_";
				path += this.textOverride;
			}
			path += this.textExtension;
		}
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
		var path =  this.getModulePageConfig(module, page, "path");
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
	
	this.getComponentExtension = function()
	{
		return isSet(this.componentExtension) ? this.componentExtension : this.viewExtension;
	};
	
	this.getModuleConfig = function(module, config, defaultValue)
	{
		var value = defaultValue;
		if(isSet(this.module[module]) && isDefined(this.module[module][config]))
		{
			value = this.module[module][config];
		}
		return value
	};
	
	this.getPageConfig = function(module, page, config, defaultValue)
	{
		var value = defaultValue;
		if(isSet(this.module[module]) && isDefined(this.module[module].page) && isDefined(this.module[module].page[page]) && isDefined(this.module[module].page[page][config]))
		{
			value = this.module[module].page[page][config];
		}
		return value
	};
	
	this.getModulePageConfig = function(module, page, config, defaultValue)
	{
		var value = defaultValue;
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
		var layout = this.getModulePageConfig(module, page, "layout");
		return !isUndefined(layout) ? layout : module;
	};
	
	this.getErrorParamsRedirector = function(module, page)
	{
		var redirector = this.getModulePageConfig(module, page, "errorParamsRedirector");
		if(!isSet(redirector))
		{
			redirector = this.errorParamsRedirector;
		}
		return isString(redirector) ? this.redirector[redirector] : redirector;
	};
	
	this.getErrorPageRedirector = function(module, page)
	{
		var redirector = this.getModulePageConfig(module, page, "errorPageRedirector");
		if(!isSet(redirector))
		{
			redirector = this.errorPageRedirector;
		}
		return isString(redirector) ? this.redirector[redirector] : redirector;
	};
	
	this.getErrorAuthRedirector = function(module, page)
	{
		var redirector = this.getModulePageConfig(module, page, "errorAuthRedirector");
		if(!isSet(redirector))
		{
			redirector = this.errorAuthRedirector;
		}
		return isString(redirector) ? this.redirector[redirector] : redirector;
	};
	
	this.getParams = function(module, page)
	{
		var params = [];
		var moduleParams = this.getModuleConfig(module, "params");
		if(isArray(moduleParams))
		{
			forEach(moduleParams, function(moduleParam)
			{
				if(isObject(moduleParam))
				{
					params.push(moduleParam);
				}
			});
		}
		var pageParams = this.getPageConfig(module, page, "params");
		if(isArray(pageParams))
		{
			forEach(pageParams, function(pageParam)
			{
				if(isObject(pageParam))
				{
					params.push(pageParam);
				}
			});
		}
		return params;
	};
	
	this.getChangeParams = function(module, page)
	{
		var changeParams = this.getModulePageConfig(module, page, "changeParams");
		return isArray(changeParams) ? changeParams : [];
	};
	
	this.getDefaultParams = function(module, page)
	{
		var defaultParams = this.getModulePageConfig(module, page, "defaultParams");
		return isObject(defaultParams) ? defaultParams : {};
	};
	
	this.getAllowedParams = function(module, page)
	{
		var allowedPageParams = [];
		var allowedParams = this.getModulePageConfig(module, page, "allowedParams");
		if(!isNull(allowedParams))
		{
			if(isArray(allowedParams))
			{
				forEach(allowedParams, function(name)
				{
					allowedPageParams.push(name);
				});
			}
			var params = this.getParams(module, page);
			forEach(params, function(param)
			{
				forEach(param, function(value, name)
				{
					allowedPageParams.push(name);
				});
			});
			var changeParams = this.getChangeParams(module, page);
			forEach(changeParams, function(name)
			{
				allowedPageParams.push(name);
			});
			var defaultParams = this.getDefaultParams(module, page);
			forEach(defaultParams, function(value, name)
			{
				allowedPageParams.push(name);
			});
		}
		else
		{
			allowedPageParams = null;
		}
		return allowedPageParams;
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
		var init = this.getModulePageConfig(module, page, "init");
		if(!isFalse(init))
		{
			if(!isObject(init))
			{
				init = {};
				init.service = this.getModulePageConfig(module, page, "service");
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
			feedbacker = this.getModulePageConfig(module, page, "feedbacker");
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
	
	this.isTranslated = function(module, page)
	{
		var translated = this.getModulePageConfig(module, page, "translated");
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



