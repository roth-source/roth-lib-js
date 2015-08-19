


var Protocol =
{
	FILE		: "file:",
	HTTP		: "http:",
	HTTPS		: "https:"
};

var Environment =
{
	DEV			: "dev",
	TEST		: "test",
	DEMO		: "demo",
	PROD		: "prod"
};


var isFileProtocol = function()
{
	return Protocol.FILE == window.location.protocol;
};

var isHttpProtocol = function()
{
	return Protocol.HTTP == window.location.protocol;
};

var isHttpsProtocol = function()
{
	return Protocol.HTTPS == window.location.protocol;
};

var isHyperTextProtocol = function()
{
	return isHttpProtocol() || isHttpsProtocol();
};


var environment = null;

var debug = null;

var hosts = {};

hosts[Environment.DEV] = ["localhost", "127.0.0.1"];

var getEnvironment = function()
{
	if(!isSet(environment))
	{
		if(isHyperTextProtocol())
		{
			var host = window.location.hostname.toLowerCase();
			for(var env in hosts)
			{
				if(isArray(hosts[env]))
				{
					if(hosts[env].indexOf(host) != -1)
					{
						environment = env;
						break;
					}
				}
			}
			if(!isSet(environment))
			{
				environment = Environment.PROD;
			}
		}
		else
		{
			environment = Environment.DEV;
		}
	}
	return environment;
};

var isEnvironment = function(environment)
{
	return getEnvironment() == environment;
};

var isDev = function()
{
	return isEnvironment(Environment.DEV);
};

var isTest = function()
{
	return isEnvironment(Environment.TEST);
};

var isDemo = function()
{
	return isEnvironment(Environment.DEMO);
};

var isProd = function()
{
	return isEnvironment(Environment.PROD);
};

var isDebug = function()
{
	if(!isSet(debug))
	{
		var search = window.location.search.toLowerCase();
		debug = search.indexOf("debug") != -1;
	}
	return debug;
};

var secure = function()
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


// OVERRIDE CONSOLE

var initConsole = function()
{
	var console = window.console;
	if(console && !isDev() && !isDebug())
	{
		for(var method in console)
		{
			if(isFunction(console[method]) && Object.prototype.hasOwnProperty.call(console, method))
			{
				console[method] = noop;
			}
		}
	}
};


var initNunjucks = function()
{
	if(isSet(nunjucks))
	{
		var nunjucksConfigure = nunjucks.configure({ autoescape: true });
		for(var method in window)
		{
			if(isFunction(window[method]) && Object.prototype.hasOwnProperty.call(window, method))
			{
				nunjucksConfigure.addGlobal(method, window[method]);
			}
		}
		nunjucksConfigure.addGlobal("Id", Id);
		nunjucksConfigure.addGlobal("Cookie", Cookie);
		return nunjucksConfigure;
	}
};



// COOKIE

var Cookie =
{
	get : function(key)
	{
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	set : function(key, value, end, path, domain, secure)
	{
		if(!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) { return false; }
		var expires = "";
		if(end)
		{
			switch(end.constructor)
			{
				case Number:
					expires = end === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + end;
					break;
				case String:
					expires = "; expires=" + end;
					break;
				case Date:
					expires = "; expires=" + end.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + expires + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (secure ? "; secure" : "");
		return true;
	},
	remove : function(key, path, domain)
	{
		if(!key || !this.has(key)) { return false; }
		document.cookie = encodeURIComponent(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( domain ? "; domain=" + domain : "") + ( path ? "; path=" + path : "");
		return true;
	},
	has : function(key)
	{
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	}
};




