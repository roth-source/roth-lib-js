



var Protocol = Protocol ||
{
	FILE		: "file:",
	HTTP		: "http:",
	HTTPS		: "https:"
};

var Environment = Environment ||
{
	DEV			: "dev",
	TEST		: "test",
	DEMO		: "demo",
	PROD		: "prod"
};


roth.lib.js.env.hosts = roth.lib.js.env.hosts || { dev : ["localhost", "127.0.0.1"] };
roth.lib.js.env.environment = roth.lib.js.env.environment || null;
roth.lib.js.env.debug = roth.lib.js.env.debug || null;
roth.lib.js.env.compiled = roth.lib.js.env.compiled || true;
roth.lib.js.env.dependencies = roth.lib.js.env.dependencies || [];


var isFileProtocol = isFileProtocol || function()
{
	return Protocol.FILE == window.location.protocol;
};

var isHttpProtocol = isHttpProtocol || function()
{
	return Protocol.HTTP == window.location.protocol;
};

var isHttpsProtocol = isHttpsProtocol || function()
{
	return Protocol.HTTPS == window.location.protocol;
};

var isHyperTextProtocol = isHyperTextProtocol || function()
{
	return isHttpProtocol() || isHttpsProtocol();
};

var getEnvironment = getEnvironment || function()
{
	if(roth.lib.js.env.environment == null)
	{
		if(isHyperTextProtocol())
		{
			var host = window.location.hostname.toLowerCase();
			for(var env in roth.lib.js.env.hosts)
			{
				if(Array.isArray(roth.lib.js.env.hosts[env]))
				{
					if(roth.lib.js.env.hosts[env].indexOf(host) != -1)
					{
						roth.lib.js.env.environment = env;
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
			roth.lib.js.env.environment = Environment.DEV;
		}
	}
	return roth.lib.js.env.environment;
};

var isEnvironment = isEnvironment || function(environment)
{
	return getEnvironment() == environment;
};

var isDev = isDev || function()
{
	return isEnvironment(Environment.DEV);
};

var isTest = isTest || function()
{
	return isEnvironment(Environment.TEST);
};

var isDemo = isDemo || function()
{
	return isEnvironment(Environment.DEMO);
};

var isProd = isProd || function()
{
	return isEnvironment(Environment.PROD);
};

var isDebug = isDebug || function()
{
	if(roth.lib.js.env.debug == null)
	{
		var search = window.location.search.toLowerCase();
		roth.lib.js.env.debug = search.indexOf("debug") != -1;
	}
	return roth.lib.js.env.debug;
};

var checkSecure = checkSecure || function()
{
	if(!isDev())
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

var loadCompiledDependencies = loadCompiledDependencies || function()
{
	loadDependencies(roth.lib.js.env.compiled);
};

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
			if(!(dependency.exclude === true) && !(!isDev() && dependency.dev === true))
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



