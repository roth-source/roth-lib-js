

roth.lib.js.env.hosts = roth.lib.js.env.hosts || { local : ["localhost", "127.0.0.1"] };
roth.lib.js.env.environment = roth.lib.js.env.environment || null;
roth.lib.js.env.debug = roth.lib.js.env.debug || null;
roth.lib.js.env.compiled = roth.lib.js.env.compiled || false;
roth.lib.js.env.context = roth.lib.js.env.context || null;
roth.lib.js.env.dependencies = roth.lib.js.env.dependencies || [];

/**
 * enum of web protocols
 * @enum {String}
 */
var Protocol = Protocol ||
{
	FILE		: "file:",
	DATA		: "data:",
	HTTP		: "http:",
	HTTPS		: "https:"
};

/**
 * enum of environments
 * @enum {String}
 */
var Environment = Environment ||
{
	MOCK		: "mock",
	LOCAL		: "local",
	TEST		: "test",
	DEMO		: "demo",
	PROD		: "prod"
};

/**
 * adds an array of hosts to the map
 * @function
 * @param {String} environment
 * @param {Array} hosts
 */
var setHosts = setHosts || function(environment, hosts)
{
	roth.lib.js.env.hosts[environment] = hosts;
};

/**
 * sets the current environment
 * @function
 * @param {String} environment
 */
var setEnvironment = setEnvironment || function(environment)
{
	roth.lib.js.env.environment = environment;
};

/**
 * sets the environment to mock
 * @function
 */
var setMock = setMock || function()
{
	setEnvironment(Environment.MOCK);
};

/**
 * sets the environment to local
 * @function
 */
var setLocal = setLocal || function()
{
	setEnvironment(Environment.LOCAL);
};

/**
 * sets the environment to test with an optional context path
 * @function
 * @param {String} context
 */
var setTest = setTest || function(context)
{
	setEnvironment(Environment.TEST);
	setContext(context);
};

/**
 * sets the environment to demo with an optional context path
 * @function
 * @param {String} context
 */
var setDemo = setDemo || function(context)
{
	setEnvironment(Environment.DEMO);
	setContext(context);
};

/**
 * sets the environment to prod with an optional context path
 * @function
 * @param {String} context
 */
var setProd = setProd || function(context)
{
	setEnvironment(Environment.PROD);
	setContext(context);
};

/**
 * sets the debug value
 * @function
 * @param {Boolean} debug
 */
var setDebug = setDebug || function(debug)
{
	roth.lib.js.env.debug = debug !== false ? true : false;
};

/**
 * sets the compiled value
 * @function
 * @param {Boolean} compiled
 */
var setCompiled = setCompiled || function(compiled)
{
	roth.lib.js.env.compiled = compiled !== false ? true : false;
};

/**
 * sets the context path for endpoint
 * @function
 * @param {String} context
 */
var setContext = setContext || function(context)
{
	if(context !== undefined)
	{
		roth.lib.js.env.context = context;
	}
};

/**
 * set the dependencies array
 * @function
 * @param {Array} dependencies
 */
var setDependencies = setDependencies || function(dependencies)
{
	roth.lib.js.env.dependencies = dependencies;
};

/**
 * is url a file protocol
 * @function
 * @returns {Boolean}
 */
var isFileProtocol = isFileProtocol || function()
{
	return Protocol.FILE == window.location.protocol;
};

/**
 * is url a data protocol
 * @function
 * @returns {Boolean}
 */
var isDataProtocol = isDataProtocol || function()
{
	return Protocol.DATA == window.location.protocol;
};

/**
 * is url a http protocol
 * @function
 * @returns {Boolean}
 */
var isHttpProtocol = isHttpProtocol || function()
{
	return Protocol.HTTP == window.location.protocol;
};

/**
 * is url a https protocol
 * @function
 * @returns {Boolean}
 */
var isHttpsProtocol = isHttpsProtocol || function()
{
	return Protocol.HTTPS == window.location.protocol;
};

/**
 * is url a http or https protocol
 * @function
 * @returns {Boolean}
 */
var isHyperTextProtocol = isHyperTextProtocol || function()
{
	return isHttpProtocol() || isHttpsProtocol();
};

/**
 * returns environment or parses if not set yet
 * @function
 * @returns {String}
 */
var getEnvironment = getEnvironment || function()
{
	if(roth.lib.js.env.environment == null)
	{
		if(isHyperTextProtocol())
		{
			var host = window.location.hostname.toLowerCase();
			for(var environment in roth.lib.js.env.hosts)
			{
				if(Array.isArray(roth.lib.js.env.hosts[environment]))
				{
					if(roth.lib.js.env.hosts[environment].indexOf(host) != -1)
					{
						roth.lib.js.env.environment = environment;
						break;
					}
				}
			}
			if(roth.lib.js.env.environment == null)
			{
				roth.lib.js.env.environment = Environment.PROD;
			}
		}
		else
		{
			roth.lib.js.env.environment = Environment.MOCK;
		}
	}
	return roth.lib.js.env.environment;
};

/**
 * checks if current environment is passed in value
 * @function
 * @param {String} environment
 * @returns {Boolean}
 */
var isEnvironment = isEnvironment || function(environment)
{
	return getEnvironment() == environment;
};

/**
 * is mock environment
 * @function
 * @returns {Boolean}
 */
var isMock = isMock || function()
{
	return isEnvironment(Environment.MOCK);
};

/**
 * is local environment
 * @function
 * @returns {Boolean}
 */
var isLocal = isLocal || function()
{
	return isEnvironment(Environment.LOCAL);
};

/**
 * is mock or local environment
 * @function
 * @returns {Boolean}
 */
var isDev = isDev || function()
{
	return isMock() || isLocal();
};

/**
 * is test environment
 * @function
 * @returns {Boolean}
 */
var isTest = isTest || function()
{
	return isEnvironment(Environment.TEST);
};

/**
 * is demo environment
 * @function
 * @returns {Boolean}
 */
var isDemo = isDemo || function()
{
	return isEnvironment(Environment.DEMO);
};

/**
 * is prod environment
 * @function
 * @returns {Boolean}
 */
var isProd = isProd || function()
{
	return isEnvironment(Environment.PROD);
};

/**
 * is debug turned on
 * @function
 * @returns {Boolean}
 */
var isDebug = isDebug || function()
{
	if(roth.lib.js.env.debug == null)
	{
		if(isFileProtocol())
		{
			setDebug(true);
		}
		else
		{
			setDebug(window.location.search.toLowerCase().indexOf("debug") != -1);
		}
	}
	return roth.lib.js.env.debug;
};

/**
 * returns context path
 * @function
 * @returns {String}
 */
var getContext = getContext || function()
{
	return roth.lib.js.env.context;
};


/**
 * redirects http protocol to https
 * @function
 */
var checkSecure = checkSecure || function()
{
	if(!isDev() && isHttpProtocol())
	{
		var url = Protocol.HTTPS + "//";
		url += window.location.host;
		url += (window.location.port ? ":" + window.location.port : "");
		url += window.location.pathname;
		url += window.location.search;
		url += window.location.hash;
		window.location.replace(url);
	}
};

/**
 * loads compiled dependencies into browser
 * @function
 */
var loadCompiledDependencies = loadCompiledDependencies || function()
{
	loadDependencies(roth.lib.js.env.compiled);
};

/**
 * loads dependendies into browser
 * @function
 * @param {Boolean} [compiled]
 */
var loadDependencies = loadDependencies || function(compiled)
{
	var writeTag = function(tag)
	{
		document.write(tag);
	}
	
	var styleRegExp = new RegExp("\\.css$", "i");
	var scriptRegExp = new RegExp("\\.js$", "i");
	
	for(var i in roth.lib.js.env.dependencies)
	{
		var dependency = roth.lib.js.env.dependencies[i];
		if(dependency)
		{
			if(!((dependency.exclude === true) || (!isDev()  && dependency.dev === true) || (isDev() && dependency.dev === false)))
			{
				if((compiled === undefined && dependency.compiled === undefined) || (compiled === true && dependency.compiled === true) || (compiled === false && dependency.compiled === false))
				{
					var local = dependency.local;
					var external = dependency.external;
					var path = local;
					if((!local && isDev()) || (external && !isDev()))
					{
						path = external;
					}
					if(path)
					{
						var tag = dependency.tag;
						if((tag && tag.toLowerCase() == "link") || styleRegExp.test(path))
						{
							var builder = "";
							builder += "<link ";
							var attributeMap = dependency.attributeMap || {};
							attributeMap.rel = attributeMap.rel || "stylesheet";
							attributeMap.type = attributeMap.type || "text/css";
							for(var name in attributeMap)
							{
								builder += name + "=\"" + attributeMap[name] + "\" ";
							}
							builder += "href=\"";
							builder += path;
							builder += "\" />";
							writeTag(builder);
						}
						else if((tag && tag.toLowerCase() == "script") || scriptRegExp.test(path))
						{
							var builder = "";
							builder += "<script ";
							if(dependency.attributeMap)
							{
								for(var name in dependency.attributeMap)
								{
									builder += name + "=\"" + dependency.attributeMap[name] + "\" ";
								}
							}
							builder += "src=\"";
							builder += path;
							builder += "\">";
							builder += "</script>";
							writeTag(builder);
						}
					}
				}
			}
		}
	}
};

/**
 * returns json string of dependencies
 * @function
 * @returns {String}
 */
var getDependencies = getDependencies || function()
{
	return JSON.stringify(roth.lib.js.env.dependencies);
};



