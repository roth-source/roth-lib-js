var roth = roth || {};
roth.js = roth.js || {};
roth.js.framework = roth.js.framework || {};
roth.js.framework.version = "0.1.3-SNAPSHOT";
var roth = roth || {};
roth.js = roth.js || {};
roth.js.version = "0.1.3-SNAPSHOT";

// CONSTANTS

var Type = Type ||
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


// JS GLOBAL FUNCTIONS

var typeOf = typeOf || function(value)
{
	return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

var isType = isType || function(value)
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

var isUndefined = isUndefined || function(value)
{
	return value === undefined;
};

var isNull = isNull || function(value)
{
	return value === null;
};

var isSet = isSet || function(value)
{
	return !isUndefined(value) && !isNull(value);
};

var isValid = isValid || function(value)
{
	return isSet(value) && value !== "";
};

var isValidString = isValidString || function(value)
{
	return isValid(value) && isString(value);
};

var isInvalid = isInvalid || function(value)
{
	return !isValid(value);
};

var isEmpty = isEmpty || function(value)
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

var isNotEmpty = isNotEmpty || function(value)
{
	return !isEmpty(value);
}

var isTrue = isTrue || function(value)
{
	return (value ? true : false);
};

var isFalse = isFalse || function(value)
{
	return !isTrue(value);
};

var isBoolean = isBoolean || function(value)
{
	return isType(value, Type.BOOLEAN);
};

var isNumber = isNumber || function(value)
{
	return isType(value, Type.NUMBER);
};

var isString = isString || function(value)
{
	return isType(value, Type.STRING);
};

var isArray = isArray || function(value)
{
	return isType(value, Type.ARRAY);
};

var isFunction = isFunction || function(value)
{
	return isType(value, Type.FUNCTION);
};

var isDate = isDate || function(value)
{
	return isType(value, Type.DATE);
};

var isError = isError || function(value)
{
	return isType(value, Type.ERROR);
};

var isRegexp = isRegexp || function(value)
{
	return isType(value, Type.REGEXP);
};

var isObject = isObject || function(value)
{
	return isType(value, Type.OBJECT);
};



var roth = roth || {};
roth.js = roth.js || {};
roth.js.util = roth.js.util || {};
roth.js.util.version = "0.1.3-SNAPSHOT";



var CookieUtil = CookieUtil || (function()
{
	
	return {
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
	
})();







var CurrencyUtil = CurrencyUtil || (function()
{
	
	return {
		
		formatInput : function(value)
		{
			return this.format(value, null, null)
		},
		
		formatText : function(value)
		{
			return this.format(value, "$", ",")
		},
		
		format : function(value, symbol, seperator)
		{
			if(!isNaN(value))
			{
				value = value / 100;
				var formattedValue = isValidString(symbol) ? symbol : "";
				formattedValue += isValidString(seperator) ? parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, seperator) : parseFloat(value).toFixed(2);
				return formattedValue;
			}
			else
			{
				return "";
			}
		},
		
		parse : function(value)
		{
			var parsedValue = null;
			if(isValidString(value))
			{
				try
				{
					value = parseFloat(value.replace(/[^0-9.]/g, ""));
					if(!isNaN(value))
					{
						parsedValue = Math.floor(value * 100);
					}
				}
				catch(e)
				{
					
				}
			}
			return parsedValue;
		}
		
	};
	
})();






var DateUtil = DateUtil || (function()
{
	var defaultPattern = "yyyy-MM-dd HH:mm:ss z";
	var longMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var longDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	
	var formatRegExp = (function()
	{
		var builder = "";
		builder += "''|'|";
		builder += "yyyy|yy|";
		builder += "MMMM|MMM|MM|M|";
		builder += "dd|d|";
		builder += "EEEE|EEE|u|";
		builder += "HH|H|";
		builder += "kk|k|";
		builder += "KK|K|";
		builder += "hh|h|";
		builder += "mm|m|";
		builder += "ss|s|";
		builder += "SSS|SS|S|";
		builder += "a|";
		builder += "zzz|zz|z|";
		builder += "Z|X|";
		return new RegExp(builder, "g");
	})();
	
	return {
		
		format : function(pattern, date)
		{
			if(!isNaN(date))
			{
				date = new Date(date);
			}
			else if(!isDate(date))
			{
				date = new Date();
			}
			pattern = isValidString(pattern) ? pattern : defaultPattern;
			var escape = false;
			var formattedDate = pattern.replace(formatRegExp, function(match, capture)
			{
				switch(match)
				{
					case "''":
					{
						return "'";
					}
					case "'":
					{
						escape = !escape;
						return "";
					}
					default:
					{
						if(escape)
						{
							return match;
						}
					}
				}
				var replacement = "";
				switch(match)
				{
					case "yyyy":
					{
						replacement = new String(date.getFullYear());
						break;
					}
					case "yy":
					{
						replacement = new String(date.getFullYear()).slice(-2);
						break;
					}
					case "MMMM":
					{
						replacement = longMonths[date.getMonth()];
						break;
					}
					case "MMM":
					{
						replacement = shortMonths[date.getMonth()];
						break;
					}
					case "MM":
					case "M":
					{
						replacement = StringUtil.padNumber(date.getMonth() + 1, match.length);
						break;
					}
					case "dd":
					case "d":
					{
						replacement = StringUtil.padNumber(date.getDate(), match.length);
						break;
					}
					case "EEEE":
					{
						replacement = longDays[date.getDay()];
						break;
					}
					case "EEE":
					{
						replacement = shortDays[date.getDay()];
						break;
					}
					case "u":
					{
						replacement = new String(date.getDay() + 1);
						break;
					}
					case "HH":
					case "H":
					{
						replacement = StringUtil.padNumber(date.getHours(), match.length);
						break;
					}
					case "kk":
					case "k":
					{
						replacement = StringUtil.padNumber(date.getHours() + 1, match.length);
						break;
					}
					case "KK":
					case "K":
					{
						replacement = StringUtil.padNumber(date.getHours() % 12 - 1, match.length);
						break;
					}
					case "hh":
					case "h":
					{
						replacement = StringUtil.padNumber(date.getHours() % 12 || 12, match.length);
						break;
					}
					case "mm":
					case "m":
					{
						replacement = StringUtil.padNumber(date.getMinutes(), match.length);
						break;
					}
					case "ss":
					case "s":
					{
						replacement = StringUtil.padNumber(date.getSeconds(), match.length);
						break;
					}
					case "SSS":
					case "SS":
					case "S":
					{
						replacement = StringUtil.padNumber(date.getMilliseconds(), match.length);
						break;
					}
					case "a":
					{
						replacement = date.getHours() < 12 ? "AM" : "PM";
						break;
					}
					case "zzz":
					case "zz":
					case "z":
					{
						replacement = /\((\w*)\)/.exec(date.toString())[1];
						break;
					}
					case "Z":
					case "X":
					{
						var offsetMinutes = date.getTimezoneOffset();
						var sign = offsetMinutes <= 0 ? "+" : "-";
						var offsetHours = Math.abs(offsetMinutes / 60);
						var hours = Math.floor(offsetHours);
						var minutes = Math.round((offsetHours - hours) * 60);
						replacement = sign + StringUtil.padNumber(hours, 2) + StringUtil.padNumber(minutes, 2);
						break;
					}
				}
				return replacement;
			});
			return formattedDate;
		},
		
		getParser : function(pattern)
		{
			pattern = isValidString(pattern) ? pattern : defaultPattern;
			var groups = [];
			var escape = false;
			var builder = pattern.replace(formatRegExp, function(match, capture)
			{
				switch(match)
				{
					case "''":
					{
						return "'";
					}
					case "'":
					{
						escape = !escape;
						return "";
					}
					default:
					{
						if(escape)
						{
							return match;
						}
					}
				}
				var replacement = "";
				switch(match)
				{
					case "yyyy":
					{
						replacement = "([0-9]{4})";
						break;
					}
					case "yy":
					{
						replacement = "([0-9]{2})";
						break;
					}
					case "MMMM":
					{
						replacement = "(" + longMonths.join("|") + ")";
						break;
					}
					case "MMM":
					{
						replacement = "(" + shortMonths.join("|") + ")";
						break;
					}
					case "MM":
					{
						replacement = "([0][1-9]|[1][0-2])";
						break;
					}
					case "M":
					{
						replacement = "([0][1-9]|[1][0-2]|[1-9])";
						break;
					}
					case "dd":
					{
						replacement = "([0][1-9]|[1-2][0-9]|[3][0-1])";
						break;
					}
					case "d":
					{
						replacement = "([0][1-9]|[1-2][0-9]|[3][0-1]|[1-9])";
						break;
					}
					case "EEEE":
					{
						replacement = "(" + longDays.join("|") + ")";
						break;
					}
					case "EEE":
					{
						replacement = "(" + shortDays.join("|") + ")";
						break;
					}
					case "u":
					{
						replacement = "([1-7])";
						break;
					}
					case "HH":
					{
						replacement = "([0-1][0-9]|[2][0-3])";
						break;
					}
					case "H":
					{
						replacement = "([0-1][0-9]|[2][0-3]|[0-9])";
						break;
					}
					case "kk":
					{
						replacement = "([0][1-9]|[1][0-9]|[2][0-4])";
						break;
					}
					case "k":
					{
						replacement = "([0][1-9]|[1][0-9]|[2][0-4]|[0-9])";
						break;
					}
					case "KK":
					{
						replacement = "([0][0-9]|[1][0-1])";
						break;
					}
					case "K":
					{
						replacement = "([0][0-9]|[1][0-1]|[0-9])";
						break;
					}
					case "hh":
					{
						replacement = "([0][1-9]|[0-1][0-2])";
						break;
					}
					case "h":
					{
						replacement = "([0][1-9]|[0-1][0-2]|[1-9])";
						break;
					}
					case "mm":
					{
						replacement = "([0-5][0-9])";
						break;
					}
					case "m":
					{
						replacement = "([0-5][0-9]|[0-9])";
						break;
					}
					case "ss":
					{
						replacement = "([0-5][0-9])";
						break;
					}
					case "s":
					{
						replacement = "([0-5][0-9]|[0-9])";
						break;
					}
					case "SSS":
					{
						replacement = "([0-9]{3})";
						break;
					}
					case "SS":
					{
						replacement = "([0-9]{2,3})";
						break;
					}
					case "S":
					{
						replacement = "([0-9]{1,3})";
						break;
					}
					case "a":
					{
						replacement = "(AM|PM)";
						break;
					}
					default:
					{
						match = null;
						break;
					}
				}
				if(match)
				{
					groups.push(match)
				}
				return replacement;
			});
			return {
				regExp : new RegExp(builder, "i"),
				groups : groups
			}
		},
		
		isValid : function(pattern, value)
		{
			var parser = this.getParser(pattern);
			return parser.regExp.test(value);
		},
		
		parse : function(pattern, value)
		{
			var parser = this.getParser(pattern);
			var date = null;
			var matcher = parser.regExp.exec(value);
			if(matcher)
			{
				var defaultDate = new Date();
				var year = defaultDate.getYear();
				var month = defaultDate.getMonth();
				var day = defaultDate.getDate();
				var hours = 0;
				var minutes = 0;
				var seconds = 0;
				var milliseconds = 0;
				var pm = false;
				for(var i in parser.groups)
				{
					var group = parser.groups[i];
					var capture = matcher[new Number(i) + 1];
					switch(group)
					{
						case "yyyy":
						{
							year = new Number(capture);
							break;
						}
						case "yy":
						{
							year = new Number(capture) + 2000;
							break;
						}
						case "MMMM":
						{
							capture = capture.charAt(0).toUpperCase() + capture.slice(1).toLowerCase();
							var index = longMonths.indexOf(capture);
							if(index > -1)
							{
								month = index;
							}
							break;
						}
						case "MMM":
						{
							capture = capture.charAt(0).toUpperCase() + capture.slice(1).toLowerCase();
							var index = shortMonths.indexOf(capture);
							if(index > -1)
							{
								month = index;
							}
							break;
						}
						case "MM":
						case "M":
						{
							month = new Number(capture) - 1;
							break;
						}
						case "dd":
						case "d":
						{
							day = new Number(capture);
							break;
						}
						case "EEEE":
						case "EEE":
						case "u":
						{
							// ignore weekday
							break;
						}
						case "HH":
						case "H":
						{
							hours = new Number(capture);
							break;
						}
						case "kk":
						case "k":
						{
							hours = new Number(capture) - 1;
							break;
						}
						case "KK":
						case "K":
						{
							hours = new Number(capture) + 1;
							break;
						}
						case "hh":
						case "h":
						{
							hours = new Number(capture);
							break;
						}
						case "mm":
						case "m":
						{
							minutes = new Number(capture);
							break;
						}
						case "ss":
						case "s":
						{
							seconds = new Number(capture);
							break;
						}
						case "SSS":
						case "SS":
						case "S":
						{
							milliseconds = new Number(capture);
							break;
						}
						case "a":
						{
							pm = "PM" == capture.toUpperCase();
							break;
						}
					}
				}
				if(pm)
				{
					hours += 12;
					if(hours == 24)
					{
						hours = 0;
					}
				}
				date = new Date(year, month, day, hours, minutes, seconds, milliseconds);
			}
			return date;
		}
		
	};
	
})();


var IdUtil = IdUtil || (function()
{
	var defaultLength = 10;
	var defaultKey = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	
	return {
		
		generate : function(length, key)
		{
			length = isNumber(length) ? length : defaultLength;
			key = isValidString(key) ? key : defaultKey;
			var value = "";
			for(var i = 0; i < length; i++)
			{
				value += key.charAt(Math.floor(Math.random() * key.length));
			}
			return value;
		}
		
	};
	
})();






var StringUtil = StringUtil || (function()
{
	
	return {
		
		padNumber : function(value, length)
		{
			return this.pad(new String(value), length, "0", true);
		},
		
		padLeft : function(value, length, character)
		{
			if(character)
			return this.pad(value, length, character, true);
		},
		
		padRight : function(value, length, character)
		{
			return this.pad(value, length, character, false);
		},
		
		pad : function(value, length, character, left)
		{
			if(value.length < length)
			{
				character = isValidString(character) ? character.substring(0, 1) : " ";
				var pad = new Array(length + 1 - value.length).join(character);
				return left ? pad + value : value + pad;
			}
			else
			{
				return value;
			}
		}
		
	};
	
})();



var roth = roth || {};
roth.js = roth.js || {};
roth.js.template = roth.js.template || {};
roth.js.template.version = "0.1.3-SNAPSHOT";

roth.js.template.Template = roth.js.template.Template || function(config)
{
	var self = this;
	
	var Config =
	{
		openUnescapedExpression 	: "{{{",
		openEscapedExpression 		: "{{",
		openStatement 				: "{%",
		closeUnescapedExpression	: "}}}",
		closeEscapedExpression		: "}}",
		closeStatement				: "%}",
		dataVar						: "$_d",
		escapeVar					: "$_e",
		issetVar					: "$_i",
		argVar						: "$_a",
		tempVar						: "$_t",
		sourceVar					: "$_s"
	};
	
	var escapeRegExp = function(value)
	{
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	
	var syntaxRegExp = (function()
	{
		config = typeof config === "object" ? config : {};
		for(var name in Config)
		{
			if(config[name] === undefined || config[name] === null || config[name] == "")
			{
				config[name] = Config[name];
			}
		}
		var builder = "";
		builder += "\\r\\n|";
		builder += "\\n|";
		builder += "\\\"|";
		builder += escapeRegExp(config.openUnescapedExpression) + "|";
		builder += escapeRegExp(config.openEscapedExpression) + "|";
		builder += escapeRegExp(config.openStatement) + "|";
		builder += escapeRegExp(config.closeUnescapedExpression) + "|";
		builder += escapeRegExp(config.closeEscapedExpression) + "|";
		builder += escapeRegExp(config.closeStatement) + "|";
		builder += "defined\\((.+?)\\)";
		return new RegExp(builder, "g");
	})();
	
	this.parse = function(source, data)
	{
		var escape = true;
		var parsedSource = "";
		if(typeof data === "object")
		{
			for(var name in data)
			{
				parsedSource += "var " + name + " = " + config.dataVar + "[\"" + name + "\"];\n";
			}
		}
		parsedSource += "var " + config.escapeVar + " = function(" + config.argVar + ") { return " + config.argVar + ".replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\").replace(/>/g, \"&gt;\"); };\n";
		parsedSource += "var " + config.issetVar + " = function(" + config.argVar + ") { return "  + config.argVar + " !== undefined && " + config.argVar + " !== null };\n";
		parsedSource += "var " + config.tempVar + ";\nvar " + config.sourceVar + "=\"\";\n" + config.sourceVar + "+=\"";
		parsedSource += source.replace(syntaxRegExp, function(match, capture)
		{
			var replacement = "";
			switch(match)
			{
				case "\r\n":
				case "\n":
				{
					replacement = escape ? "\\n" : "\n";
					break;
				}
				case "\"":
				{
					replacement = escape ? "\\\"" : "\"";
					break;
				}
				case config.openUnescapedExpression:
				{
					replacement = "\"; try{" + config.tempVar + "=";
					escape = false;
					break;
				}
				case config.openEscapedExpression:
				{
					replacement = "\"; try{" + config.tempVar + "=";
					escape = false;
					break;
				}
				case config.openStatement:
				{
					replacement = "\";";
					escape = false;
					break;
				}
				case config.closeUnescapedExpression:
				{
					replacement = "; " + config.sourceVar + "+=(" + config.issetVar + "(" + config.tempVar + ")) ? new String(" + config.tempVar + ") : \"\";}catch(e){}; " + config.sourceVar + "+=\"";
					escape = true;
					break;
				}
				case config.closeEscapedExpression:
				{
					replacement = "; " + config.sourceVar + "+=(" + config.issetVar + "(" + config.tempVar + ")) ? " + config.escapeVar + "(new String(" + config.tempVar + ")) : \"\";}catch(e){}; " + config.sourceVar + "+=\"";
					escape = true;
					break;
				}
				case config.closeStatement:
				{
					replacement = config.sourceVar + "+=\"";
					escape = true;
					break;
				}
				default:
				{
					if(match.indexOf("defined") == 0)
					{
						replacement = "typeof " + capture + " !== " + "\"undefined\"";
					}
					break;
				}
			}
			return replacement;
		});
		parsedSource += "\";\nreturn " + config.sourceVar + ";";
		return parsedSource;
	};
	
	this.renderParsed = function(parsedSource, data)
	{
		return new Function(config.dataVar, parsedSource)(data);
	};
	
	this.render = function(source, data)
	{
		return this.renderParsed(this.parse(source, data), data);
	};
	
}
var roth = roth || {};
roth.js = roth.js || {};
roth.js.client = roth.js.client || {};
roth.js.client.version = "0.1.3-SNAPSHOT";


roth.js.client.Client = roth.js.client.Client || function()
{
	var self = this;
	var inited = false;
	
	this.config = new roth.js.client.Config();
	this.request = new roth.js.client.Request();
	this.endpoint = new roth.js.client.Endpoint();
	this.queue = new roth.js.client.Queue();
	this.cache = new roth.js.client.Cache();
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
			if(typeof roth.js.template == "undefined" || typeof roth.js.template.Template == "undefined")
			{
				document.write('<script src="' + this.config.getDevTemplateScript() + '"></script>');
			}
			if(isSet(this.config.devConfigScript))
			{
				document.write('<script src="' + this.config.devConfigScript + '"></script>');
			}
			document.write('<script src="' + this.config.getDevScript() + '"></script>');
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
		if(!isSet(this.config.endpoint[roth.js.env.environment]) && isHyperTextProtocol())
		{
			var endpoint = "https://";
			endpoint += window.location.host;
			endpoint += window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1);
			this.config.endpoint[roth.js.env.environment] = [endpoint];
		}
	};
	
	this.initDev = function()
	{
		if(isDev())
		{
			this.dev = new roth.js.client.dev.Dev(this.config);
		}
	};
	
	this.load = function()
	{
		if(this.request.parse() && this.checkRequest())
		{
			if(!this.checkChange())
			{
				this.request.log();
				this.request.loadParams();
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
	
	this.checkChange = function()
	{
		var change = false;
		var module = this.request.getModule();
		var page = this.request.getPage();
		if(!this.request.newPage && isSet(this.request.loaded.params))
		{
			var loadedParams = this.request.cloneLoadedParams();
			var changeParams = this.config.getPageChangeParams(module, page);
			for(var name in this.request.params)
			{
				change = changeParams.indexOf(name) > -1;
				if(!change)
				{
					change = this.request.params[name] == loadedParams[name];
					if(!change)
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
			if(change)
			{
				change = Object.keys(loadedParams).length == 0;
			}
		}
		if(change)
		{
			if(isFunction(this.layout.change))
			{
				this.layout.change(this.response.layout);
			}
			if(isFunction(this.page.change))
			{
				this.page.change(this.response.page);
			}
		}
		return change;
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
			var id = IdUtil.generate();
			this.queue.loadEndpoints(id, function()
			{
				self.callEndpointList(self.config.endpoint[roth.js.env.environment],
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
				var id = IdUtil.generate();
				this.queue.loadInitializer(id, function()
				{
					initializer(function(response)
					{
						self.response.layout = response || {};
						self.queue.complete(id);
					},
					function(errors)
					{
						self.response.layout = {};
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
			var id = IdUtil.generate();
			this.queue.loadInitializer(id, function()
			{
				initializer(function(response)
				{
					self.response.page = response || {};
					self.queue.complete(id);
				},
				function(errors)
				{
					self.response.page = {};
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
			var id = IdUtil.generate();
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
				var id = IdUtil.generate();
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
										text : self.text,
										request : self.request
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
		var id = IdUtil.generate();
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
								text : self.text,
								request : self.request
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
		var sectionsId = IdUtil.generate();
		this.queue.loadSections(sectionsId, function()
		{
			$("[" + self.config.sectionAttribute + "]").each(function()
			{
				var element = $(this);
				var section = element.attr(self.config.sectionAttribute);
				var sectionId = IdUtil.generate();
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
		var componentsId = IdUtil.generate();
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
					request : self.request
				};
				var componentId = IdUtil.generate();
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
		var id = IdUtil.generate();
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
		var id = IdUtil.generate();
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
			// select value
			$("select[value]").each(function()
			{
				var element = $(this);
				var value = element.attr("value");
				element.find("option[value='" + value + "']").first().prop("selected", true).change();
			});
			// radio value
			$("[" + self.config.fieldRadioValueAttribute + "]").each(function()
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
			disabler = isFunction(disabler) ? disabler : function(){};
			disabler(element, true);
			var groupElement = self.submitterGroupElement(element);
			if(groupElement.length > 0)
			{
				var request = self.createRequest(groupElement);
				if(isTrue(request))
				{
					if(isValidString(presubmit))
					{
						eval(presubmit);
					}
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
		var id = IdUtil.generate();
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
		var id = IdUtil.generate();
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
		var id = IdUtil.generate();
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
	
	this.findGroupElements = function(element)
	{
		var selector = "";
		selector += "input[name][type=hidden], ";
		selector += "input[name][type!=hidden][type!=radio][" + this.config.fieldRequiredAttribute + "]:visible:enabled, ";
		selector += "select[name][" + this.config.fieldRequiredAttribute + "]:visible:enabled, ";
		selector += "textarea[name][" + this.config.fieldRequiredAttribute + "]:visible:enabled, ";
		selector += "[" + this.config.fieldRadioGroupAttribute + "][" + this.config.fieldRequiredAttribute + "]:has(input[name][type=radio]:visible:enabled) ";
		return element.find(selector);
	}
	
	this.createRequest = function(element)
	{
		var nameRegExp = new RegExp("^(\\w+)(?:\\[|$)");
		var indexRegExp = new RegExp("\\[(\\d+)?\\]", "g");
		
		var request = this.request.cloneParams();
		this.findGroupElements(element).each(function()
		{
			var field = self.validateField($(this));
			if(!isTrue(field.valid))
			{
				request = null;
			}
			if(isTrue(request))
			{
				if(isTrue(field.name) && isTrue(field.value))
				{
					var tempObject = request;
					var names = field.name.split(".");
					for(var i in names)
					{
						var last = (i == names.length - 1);
						var nameMatcher = nameRegExp.exec(names[i]);
						if(nameMatcher)
						{
							var elementName = nameMatcher[1];
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
										var tempElement = last ? field.value : {};
										if(index >= 0)
										{
											tempObject[index] = tempElement;
										}
										else
										{
											tempObject.push(tempElement);
										}
										tempObject = tempElement;
									}
								}
							}
							else
							{
								if(!last)
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
			}
		});
		return request;
	};
	
	this.validateGroup = function(element)
	{
		var validGroup = true;
		this.findGroupElements(element).each(function()
		{
			var field = self.validateField($(this));
			if(!isTrue(field.valid))
			{
				validGroup = false;
			}
		});
		return validGroup;
	};
	
	this.filterField = function(element)
	{
		var value = null;
		var name = element.attr(this.config.fieldRadioGroupAttribute);
		if(name)
		{
			value = element.find("input[type=radio][name='" + name + "']:visible:enabled:checked").val();
		}
		else
		{
			name = element.attr("name");
			var type = element.attr("type");
			if(type == "checkbox")
			{
				value = element.is(":checked");
			}
			else
			{
				value = element.val();
			}
		}
		if(isValidString(value))
		{
			value = value.trim();
			var filterer = this.config.getFilterer(element);
			if(isFunction(filterer))
			{
				value = filterer(value);
			}
		}
		var tag = element.prop("tagName").toLowerCase();
		var type = element.attr("type");
		return { name : name, value : value, tag : tag, type : type };
	};
	
	this.validateField = function(element)
	{
		var field = this.filterField(element);
		var value = field.value;
		var valid = true;
		if(element.is(":visible"))
		{
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
		}
		field.valid = valid;
		return field;
	};
	
	this.displayField = function(element, status)
	{
		var displayor = this.config.getDisplayor(element);
		if(isFunction(displayor))
		{
			displayor(element, status);
		}
	};
	
	this.resetGroups = function()
	{
		$("[" + this.config.fieldGroupAttribute + "]").each(function()
		{
			self.resetGroup($(this));
		});
	};
	
	this.resetGroup = function(groupElement)
	{
		if(isString(groupElement))
		{
			groupElement = $("[" + this.config.fieldGroupAttribute + "='" + groupElement + "']");
		}
		groupElement.find("input[" + this.config.fieldRequiredAttribute + "], textarea[" + self.config.fieldRequiredAttribute + "]").each(function()
		{
			var fieldElement = $(this);
			fieldElement.val("");
			self.displayField(fieldElement, "reset");
		});
		groupElement.find("select[" + self.config.fieldRequiredAttribute + "]").each(function()
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
	
	this.resetValidateGroup = function(groupElement)
	{
		if(isString(groupElement))
		{
			groupElement = $("[" + this.config.fieldGroupAttribute + "='" + groupElement + "']");
		}
		groupElement.find("input[" + this.config.fieldRequiredAttribute + "], textarea[" + this.config.fieldRequiredAttribute + "], select[" + this.config.fieldRequiredAttribute + "]").each(function()
		{
			var element = $(this);
			self.displayField(element, "reset");
		});
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
	this.config.validator.confirm	= function(value, context)
	{
		var value2 = $("#" + context).val();
		return value == value2;
	};
	
};

roth.js.client.Config = roth.js.client.Config || function()
{
	this.versionToken				= "{version}";
	
	this.jqueryScript				= "https://cdnjs.cloudflare.com/ajax/libs/jquery/" + this.versionToken + "/jquery.min.js";
	this.jqueryVersion				= "1.11.2";
	
	this.bootstrapStyle				= "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/" + this.versionToken + "/css/bootstrap.min.css";
	this.bootstrapScript			= "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/" + this.versionToken + "/js/bootstrap.min.js";
	this.bootstrapVersion			= "3.3.4";
	
	this.devTemplateScript			= "http://dist.roth.cm/roth/js/roth-js-template/" + this.versionToken + "/roth-js-template.js";
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
	this.devServiceResponse			= "response";
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
	this.fieldRadioGroupAttribute	= "data-radio-group";
	this.fieldRadioValueAttribute	= "data-radio-value";
	
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
		return path;
	};
	
	this.getDevServiceRequestPath = function(service, method, scenario)
	{
		var path = "";
		path += this.getDevServicePath(service, method);
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
	
	this.getDevServiceResponseScenarios = function(service, method)
	{
		var scenarios = [];
		if(isObject(this.dev.service[service]) && isArray(this.dev.service[service][method]))
		{
			scenarios = this.dev.service[service][method];
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
		return this.devTemplateScript.replace(this.getVersionRegExp(), roth.js.client.version);
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

roth.js.client.Cache = roth.js.client.Cache || function()
{
	
	this.clear = function()
	{
		this.clearLayout();
		this.clearPage();
		this.clearResponse();
	};
	
	this.clearView = function()
	{
		this.clearLayout();
		this.clearPage();
	};
	
	this.clearLayout = function()
	{
		this.clearSession("cache-layout");
	};
	
	this.clearPage = function()
	{
		this.clearSession("cache-page");
	};
	
	this.clearResponse = function()
	{
		this.clearSession("cache-response");
	};
	
	this.clearSession = function(prefix)
	{
		for(var i = sessionStorage.length - 1; i >= 0; i--)
		{
			var key = sessionStorage.key(i);
			if(key.length >= prefix.length && key.slice(0, prefix.length) == prefix)
			{
				console.log("removing " + key);
				sessionStorage.removeItem(key);
			}
		}
	};
	
	this.setLayout = function(hash, element)
	{
		this.setView("layout", hash, element);
	};
	
	this.setPage = function(hash, element)
	{
		this.setView("page", hash, element);
	};
	
	this.setView = function(type, hash, element)
	{
		if(element.length > 0)
		{
			element.find("input[type!='button'][type!='submit'][type!='reset'][type!='checkbox'][type!='radio']").each(function()
			{
				var input = $(this);
				input.attr("value", input.val());
			});
			var html = element[0].innerHTML;
			sessionStorage.setItem("cache-" + type + hash, html);
		}
	};
	
	this.hasLayout = function(hash)
	{
		return isSet(sessionStorage.getItem("cache-layout" + hash));
	};
	
	this.hasPage = function(hash)
	{
		return isSet(sessionStorage.getItem("cache-page" + hash));
	};
	
	this.getLayout = function(hash)
	{
		return sessionStorage.getItem("cache-layout" + hash);
	};
	
	this.getPage = function(hash)
	{
		return sessionStorage.getItem("cache-page" + hash);
	};
	
}

roth.js.client.Endpoint = roth.js.client.Endpoint || function()
{
	this.currentStorage = null;
	this.availableStorage = null;
	
	this.set = function(endpoints)
	{
		if(isArray(endpoints) && endpoints.length > 0)
		{
			sessionStorage.setItem(this.currentStorage, endpoints.shift());
			sessionStorage.setItem(this.availableStorage, JSON.stringify(endpoints));
			/*
			if(endpoints.length > 0)
			{
				sessionStorage.setItem(this.availableStorage, JSON.stringify(endpoints));
			}
			else
			{
				sessionStorage.removeItem(this.availableStorage);
			}
			*/
			return true;
		}
		else
		{
			return false;
		}
	};
	
	this.next = function()
	{
		sessionStorage.removeItem(this.currentStorage);
		return this.set(this.available());
	};
	
	this.clear = function()
	{
		sessionStorage.removeItem(this.currentStorage);
		sessionStorage.removeItem(this.availableStorage);
	};
	
	this.available = function()
	{
		var available = sessionStorage.getItem(this.availableStorage);
		return isValidString ? JSON.parse(available) : [];
	};
	
	this.current = function()
	{
		var current = sessionStorage.getItem(this.currentStorage);
		return current;
	};
	
};
roth.js.client.Queue = roth.js.client.Queue || function()
{
	var Event =
	{
		LOAD_ENDPOINTS		: "loadEndpoints",
		LOAD_INITIALIZER	: "loadInitializer",
		LOAD_TEXT			: "loadText",
		LOAD_LAYOUT			: "loadLayout",
		LOAD_PAGE			: "loadPage",
		LOAD_SECTIONS		: "loadSections",
		LOAD_SECTION		: "loadSection",
		LOAD_COMPONENTS		: "loadComponents",
		LOAD_COMPONENT		: "loadComponent",
		INIT_TEXT			: "initText",
		INIT_HANDLERS		: "initHandlers",
		INIT_LAYOUT			: "initLayout",
		INIT_PAGE			: "initPage",
		SHOW_VIEW			: "showView"
	};
	
	var Order = {};
	Order[Event.LOAD_ENDPOINTS] 	= [];
	Order[Event.LOAD_TEXT] 			= [];
	Order[Event.LOAD_INITIALIZER] 	= [Event.LOAD_ENDPOINTS];
	Order[Event.LOAD_LAYOUT] 		= [Event.LOAD_TEXT, Event.LOAD_INITIALIZER];
	Order[Event.LOAD_PAGE] 			= [Event.LOAD_LAYOUT];
	Order[Event.LOAD_SECTIONS] 		= [Event.LOAD_PAGE];
	Order[Event.LOAD_SECTION] 		= [Event.LOAD_SECTIONS];
	Order[Event.LOAD_COMPONENTS] 	= [Event.LOAD_PAGE];
	Order[Event.LOAD_COMPONENT] 	= [Event.LOAD_COMPONENTS];
	Order[Event.INIT_TEXT] 			= [Event.LOAD_SECTION, Event.LOAD_COMPONENT, Event.LOAD_TEXT];
	Order[Event.INIT_HANDLERS] 		= [Event.INIT_TEXT];
	Order[Event.INIT_LAYOUT] 		= [Event.LOAD_INITIALIZER, Event.INIT_HANDLERS];
	Order[Event.INIT_PAGE] 			= [Event.LOAD_INITIALIZER, Event.INIT_HANDLERS];
	Order[Event.SHOW_VIEW] 			= [Event.INIT_LAYOUT, Event.INIT_PAGE];
	
	this.task = {};
	
	this.loadEndpoints = function(id, callback)
	{
		this.add(id, Event.LOAD_ENDPOINTS, callback);
	};
	
	this.loadInitializer = function(id, callback)
	{
		this.add(id, Event.LOAD_INITIALIZER, callback);
	};
	
	this.loadText = function(id, callback)
	{
		this.add(id, Event.LOAD_TEXT, callback);
	};
	
	this.loadLayout = function(id, callback)
	{
		this.add(id, Event.LOAD_LAYOUT, callback);
	};
	
	this.loadPage = function(id, callback)
	{
		this.add(id, Event.LOAD_PAGE, callback);
	};
	
	this.loadSections = function(id, callback)
	{
		this.add(id, Event.LOAD_SECTIONS, callback);
	};
	
	this.loadSection = function(id, callback)
	{
		this.add(id, Event.LOAD_SECTION, callback);
	};
	
	this.loadComponents = function(id, callback)
	{
		this.add(id, Event.LOAD_COMPONENTS, callback);
	};
	
	this.loadComponent = function(id, callback)
	{
		this.add(id, Event.LOAD_COMPONENT, callback);
	};
	
	this.initText = function(id, callback)
	{
		this.add(id, Event.INIT_TEXT, callback);
	};
	
	this.initHandlers = function(id, callback)
	{
		this.add(id, Event.INIT_HANDLERS, callback);
	};
	
	this.initLayout = function(id, callback)
	{
		this.add(id, Event.INIT_LAYOUT, callback);
	};
	
	this.initPage = function(id, callback)
	{
		this.add(id, Event.INIT_PAGE, callback);
	};
	
	this.showView = function(id, callback)
	{
		this.add(id, Event.SHOW_VIEW, callback);
	};
	
	this.add = function(id, event, callback)
	{
		if(isFunction(callback))
		{
			this.task[id] =
			{
				event 		: event,
				callback 	: callback,
				started 	: false
			};
		}
	};
	
	this.complete = function(id)
	{
		if(isSet(this.task[id]))
		{
			//console.log(id + " - completing " + this.task[id].event);
			delete this.task[id];
		}
		this.execute();
	};
	
	this.execute = function()
	{
		for(var id in this.task)
		{
			var task = this.task[id];
			if(isSet(task) && task.started == false)
			{
				if(this.isTaskReady(task))
				{
					//console.log(id + " -   starting " + task.event);
					task.started = true;
					task.callback();
				}
			}
		}
	};
	
	this.isTaskReady = function(task)
	{
		for(var id in this.task)
		{
			if(this.hasEvent(this.task[id].event, Order[task.event]))
			{
				return false;
			}
		}
		return true;
	};
	
	this.hasEvent = function(event, order)
	{
		if(isSet(order) && order.length > 0)
		{
			if(order.indexOf(event) != -1)
			{
				return true;
			}
			for(var i in order)
			{
				if(this.hasEvent(event, Order[order[i]]))
				{
					return true;
				}
			}
		}
		return false;
	};
	
};

roth.js.client.Request = roth.js.client.Request || function()
{
	var State =
	{
		NEXT 	: "next",
		REPLACE : "replace",
		BACK 	: "back"
	};
	
	this.hash = null;
	this.lang = null;
	this.layout = null;
	this.module = null;
	this.page = null;
	this.params = {};
	
	this.defaultModule = "index";
	this.defaultPage = "index";	
	this.langStorage = "lang";
	this.state = null;
	this.loaded = {};
	
	this.newHash = false;
	this.newLang = false;
	this.newLayout = false;
	this.newModule = false;
	this.newPage = false;
	
	this.hasParam = function(name)
	{
		return isSet(this.params[name]);
	};
	
	this.getParam = function(name, defaultValue)
	{
		var param = this.params[name];
		return isValidString(param) ? param : defaultValue;
	};
	
	this.getModule = function()
	{
		return isSet(this.module) ? this.module : this.defaultModule;
	};
	
	this.getPage = function()
	{
		return isSet(this.page) ? this.page : this.defaultPage;
	};
	
	this.setHash = function(hash)
	{
		this.hash = hash;
		this.newHash = this.hash != this.loaded.hash;
	};
	
	this.setLang = function(lang)
	{
		this.lang = lang;
		this.newLang = this.lang != this.loaded.lang;
	};
	
	this.setLayout = function(layout)
	{
		this.layout = layout;
		this.newLayout = this.layout != this.loaded.layout;
	};
	
	this.setModule = function(module)
	{
		this.module = module;
		this.newModule = this.module != this.loaded.module;
	};
	
	this.setPage = function(page)
	{
		this.page = page;
		this.newPage = this.newModule || this.page != this.loaded.page;
	};
	
	this.isNext = function()
	{
		return this.state == State.NEXT;
	};
	
	this.isBack = function()
	{
		return this.state == State.BACK;
	};
	
	this.isReplace = function()
	{
		return this.state == State.REPLACE || isNull(this.state);
	};
	
	this.back = function()
	{
		this.state = State.BACK;
		window.history.back();
	};
	
	this.next = function(module, page, params)
	{
		//this.state = State.NEXT;
		this.state = State.REPLACE;
		window.location.assign(this.buildHash(module, page, params));
	};
	
	this.replace = function(module, page, params)
	{
		this.state = State.REPLACE;
		window.location.replace(this.buildHash(module, page, params));
	};
	
	this.refresh = function()
	{
		this.state = State.REPLACE;
		window.location.replace(this.buildHash(this.module, this.page, this.params));
	};
	
	this.reload = function()
	{
		window.location.reload();
	};
	
	this.buildHash = function(module, page, params)
	{
		var hash = "#";
		if(isValidString(module))
		{
			hash += "/" + module + "/";
			if(isValidString(page))
			{
				hash += page + "/";
				if(isObject(params))
				{
					for(var name in params)
					{
						hash += encodeURIComponent(name) + "/" + encodeURIComponent(params[name]) + "/";
					}
				}
			}
		}
		return hash;
	};
	
	this.parse = function()
	{
		var hash = "#/";
		var lang = null;
		var i = 1;
		var values = window.location.hash.split("/");
		if(isValid(values[i]))
		{
			if(values[i].length == 2)
			{
				this.lang = null;
				lang = values[i];
				hash += values[i] + "/";
				i++;
			}
		}
		if(isValid(values[i]))
		{
			this.setModule(values[i]);
			hash += values[i] + "/";
			i++;
		}
		if(isValid(values[i]))
		{
			this.setPage(values[i]);
			hash += values[i] + "/";
			i++;
		}
		this.params = {};
		var name = null;
		for(i; i < values.length; i++)
		{
			if(isValid(values[i]))
			{
				if(name === null)
				{
					name = values[i];
				}
				else
				{
					this.params[name] = decodeURIComponent(values[i]);
					hash += name + "/";
					hash += values[i] + "/";
					name = null;
				}
			}
		}
		var blankHash = window.location.hash == "" || window.location.hash == "#";
		if(!blankHash && window.location.hash != hash)
		{
			window.location.replace(hash);
			return false;
		}
		else if(isSet(lang))
		{
			localStorage.setItem(this.langStorage, lang);
			this.refresh();
			return false;
		}
		else
		{
			this.setHash(window.location.hash);
			this.newLang = false;
			return true;
		}
	};
	
	this.log = function()
	{
		console.groupEnd();
		var group = "";
		group += this.lang + " / ";
		group += this.getModule() + " / ";
		group += this.getPage() + " / ";
		console.group(group + JSON.stringify(this.params));
	};
	
	this.cloneParams = function()
	{
		return $.extend({}, this.params);;
	}
	
	this.cloneLoadedParams = function()
	{
		return isSet(this.loaded.params) ? $.extend({}, this.loaded.params) : {};
	}
	
	this.loadParams = function()
	{
		this.loaded.params = this.params;
	};
	
};
