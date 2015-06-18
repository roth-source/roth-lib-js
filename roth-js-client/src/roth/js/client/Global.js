
// CONSTANTS

/**
 * Javascript types
 */
window.Type =
{
	UNDEFINED 	: "undefined",
	NULL		: "null",
	BOOLEAN		: "boolean",
	NUMBER		: "number",
	STRING		: "string",
	ARRAY		: "array",
	FUNCTION	: "function",
	DATE		: "date",
	ERROR		: "error",
	REGEXP		: "regexp",
	OBJECT		: "object"
};

/**
 *  Browser protocols
 */
window.Protocol =
{
	FILE		: "file:",
	HTTP		: "http:",
	HTTPS		: "https:"
};

/**
 *  Client environments
 */
window.Environment =
{
	DEV			: "dev",
	TEST		: "test",
	DEMO		: "demo",
	PROD		: "prod"
};


// UTIL

/**
 * 
 */
window.noop = function(){};

/**
 *  Use the prototype toString class value for more accurate typeof
 */
window.typeOf = function(value)
{
	return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

/**
 *  
 */
window.isType = function(value)
{
	var type = typeOf(value);
	for(var i = 1; i < arguments.length; i++)
	{
		if(type == arguments[i])
		{
			return true;
		}
	}
	return false;
};

/**
 *  
 */
window.isUndefined = function(value)
{
	return value === undefined;
};

/**
 *  
 */
window.isNull = function(value)
{
	return value === null;
};

/**
 *  Checks if not undefined or null
 */
window.isSet = function(value)
{
	return !isUndefined(value) && !isNull(value);
};

/**
 *  Checks if not undefined, null, or blank string
 */
window.isValid = function(value)
{
	return isSet(value) && value !== "";
};

/**
 *  Checks if not undefined, null, or blank string, and is a string
 */
window.isValidString = function(value)
{
	return isValid(value) && isString(value);
};

/**
 *  Checks if not undefined, null, or blank string
 */
window.isInvalid = function(value)
{
	return !isValid(value);
};

/**
 *  Checks if string, array, or object is empty
 */
window.isEmpty = function(value)
{
	var empty = !isSet(value);
	if(!empty)
	{
		if(isString(value))
		{
			empty = !isValidString(value);
		}
		else if(isArray(value))
		{
			empty = value.length == 0;
		}
		else if(isObject(value))
		{
			empty = Object.keys(value).length == 0;
		}
	}
	return empty;
};

/**
 *  Checks if string, array, or object is not empty
 */
window.isNotEmpty = function(value)
{
	return !isEmpty(value);
}

/**
 *  Check if not undefined, null, blank string, false, 0, or NaN
 */
window.isTrue = function(value)
{
	return (value ? true : false);
};

/**
 *  
 */
window.isFalse = function(value)
{
	return !isTrue(value);
};

/**
 *  
 */
window.isBoolean = function(value)
{
	return isType(value, Type.BOOLEAN);
};

/**
 *  
 */
window.isNumber = function(value)
{
	return isType(value, Type.NUMBER);
};

/**
 *  
 */
window.isString = function(value)
{
	return isType(value, Type.STRING);
};

/**
 *  
 */
window.isArray = function(value)
{
	return isType(value, Type.ARRAY);
};

/**
 *  
 */
window.isFunction = function(value)
{
	return isType(value, Type.FUNCTION);
};

/**
 *  
 */
window.isDate = function(value)
{
	return isType(value, Type.DATE);
};

/**
 *  
 */
window.isError = function(value)
{
	return isType(value, Type.ERROR);
};

/**
 *  
 */
window.isRegexp = function(value)
{
	return isType(value, Type.REGEXP);
};

/**
 *  
 */
window.isObject = function(value)
{
	return isType(value, Type.OBJECT);
};

/**
 *  
 */
window.isFileProtocol = function()
{
	return Protocol.FILE == window.location.protocol;
};

/**
 *  
 */
window.isHttpProtocol = function()
{
	return Protocol.HTTP == window.location.protocol;
};

/**
 *  
 */
window.isHttpsProtocol = function()
{
	return Protocol.HTTPS == window.location.protocol;
};

/**
 *  
 */
window.isHyperTextProtocol = function()
{
	return isHttpProtocol() || isHttpsProtocol();
};

/**
 *  
 */
window.padLeft = function(value, length, padding)
{
	padding = isValidString(padding) ? padding.slice(0, 1) : "0";
	value = value + "";
	return value.length < length ? new Array(length - value.length + 1).join(padding) + value : value;
};


/**
 *  
 */
window.currency = function(value, symbol, seperator)
{
	symbol = isValidString(symbol) ? symbol : "$";
	seperator = isValidString(seperator) ? seperator : ",";
	var currency = null;
	if(!isNaN(value))
	{
		currency = symbol + parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, seperator);
	}
	return currency;
};


/**
 *  
 */
window.date = function(value)
{
	if(!isNaN(value))
	{
		var date = new Date(value);
		var display = "";
		display += date.getFullYear();
		display += "-";
		display += padLeft((date.getMonth() + 1), 2);
		display += "-";
		display += padLeft(date.getDate(), 2);
		return display;
	}
	else
	{
		return ""
	}
};


/**
 *  
 */
window.datetime = function(value)
{
	if(!isNaN(value))
	{
		var date = new Date(value);
		var display = "";
		display += date.getFullYear();
		display += "-";
		display += padLeft((date.getMonth() + 1), 2);
		display += "-";
		display += padLeft(date.getDate(), 2);
		display += " ";
		display += padLeft(date.getHours(), 2);
		display += ":";
		display += padLeft(date.getMinutes(), 2);
		display += ":";
		display += padLeft(date.getSeconds(), 2);
		display += " ";
		display += /\((\w*)\)/.exec(new Date().toString())[1];
		return display;
	}
	else
	{
		return ""
	}
};


// ENVIRONMENT

/**
 *  
 */
window.environment = null;

/**
 *  
 */
window.debug = null;

/**
 *  
 */
window.hosts = {};

/**
 *  
 */
window.hosts[Environment.DEV] = ["localhost", "127.0.0.1"];

/**
 *  
 */
window.getEnvironment = function()
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

/**
 *  
 */
window.isEnvironment = function(environment)
{
	return getEnvironment() == environment;
};

/**
 *  
 */
window.isDev = function()
{
	return isEnvironment(Environment.DEV);
};

/**
 *  
 */
window.isTest = function()
{
	return isEnvironment(Environment.TEST);
};

/**
 *  
 */
window.isDemo = function()
{
	return isEnvironment(Environment.DEMO);
};

/**
 *  
 */
window.isProd = function()
{
	return isEnvironment(Environment.PROD);
};

/**
 *  
 */
window.isDebug = function()
{
	if(!isSet(debug))
	{
		var search = window.location.search.toLowerCase();
		debug = search.indexOf("debug") != -1;
	}
	return debug;
};

/**
 *  
 */
window.secure = function()
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

/**
 *  
 */
window.initConsole = function()
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


/**
 * 
 */
window.initNunjucks = function()
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

/**
 *  
 */
window.Cookie =
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




/**
 * 
 * 
 */
window.Id =
{
	length : 10,
	key : "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	generate : function(length, key)
	{
		length = isNumber(length) ? length : this.length;
		key = isValidString(key) ? key : this.key;
		var value = "";
		for(var i = 0; i < length; i++)
		{
			value += key.charAt(Math.floor(Math.random() * key.length));
		}
		return value;
	}
};




