


var DateUtil = DateUtil ||
{
	
	
	defaultPattern : "yyyy-MM-dd HH:mm:ss z",
	
	
	defaultLang : "en",
	
	
	formatRegExp : (function()
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
	})(),
	
	
	label :
	{
		"en" :
		{
			"longMonths" : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			"shortMonths" : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			"longDays" : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			"shortDays" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		},
		"es" :
		{
			"longMonths" : ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
			"shortMonths" : ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
			"longDays" : ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
			"shortDays" : ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
		}
	},
	
	
	get : function(year, month, day, hour, minutes, seconds, milliseconds)
	{
		month = !isNaN(month) ? month - 1 : 0;
		return new Date(year, month, day, hour, minutes, seconds, milliseconds);
	},
	
	
	format : function(pattern, date, lang)
	{
		var self = this;
		pattern = isValidString(pattern) ? pattern : this.defaultPattern;
		if(!isNaN(date))
		{
			date = new Date(date);
		}
		else if(!isDate(date))
		{
			date = new Date();
		}
		lang = isSet(this.label[lang]) ? lang : this.defaultLang;
		var escape = false;
		var formattedDate = pattern.replace(this.formatRegExp, function(match, capture)
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
					replacement = self.label[lang].longMonths[date.getMonth()];
					break;
				}
				case "MMM":
				{
					replacement = self.label[lang].shortMonths[date.getMonth()];
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
					replacement = self.label[lang].longDays[date.getDay()];
					break;
				}
				case "EEE":
				{
					replacement = self.label[lang].shortDays[date.getDay()];
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
				case "A":
				{
					replacement = date.getHours() < 12 ? "AM" : "PM";
					break;
				}
				case "a":
				{
					replacement = date.getHours() < 12 ? "am" : "pm";
					break;
				}
				case "zzz":
				case "zz":
				case "z":
				{
					var matcher = /\((\w*)\)/.exec(date.toString());
					if(!isNull(matcher))
					{
						replacement = matcher[1];
					}
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
	
	
	parser : function(pattern, lang)
	{
		var self = this;
		pattern = isValidString(pattern) ? pattern : this.defaultPattern;
		lang = isSet(this.label[lang]) ? lang : this.defaultLang;
		var groups = [];
		var escape = false;
		var builder = pattern.replace(this.formatRegExp, function(match, capture)
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
					replacement = "(" + self.label[lang].longMonths.join("|") + ")";
					break;
				}
				case "MMM":
				{
					replacement = "(" + self.label[lang].shortMonths.join("|") + ")";
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
					replacement = "(" + self.label[lang].longDays.join("|") + ")";
					break;
				}
				case "EEE":
				{
					replacement = "(" + self.label[lang].shortDays.join("|") + ")";
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
	
	
	isValid : function(pattern, value, lang)
	{
		var parser = this.parser(pattern, lang);
		return parser.regExp.test(value);
	},
	
	
	parse : function(pattern, value, lang)
	{
		var self = this;
		lang = isSet(this.label[lang]) ? lang : this.defaultLang;
		var parser = this.parser(pattern, lang);
		var date = null;
		var matcher = parser.regExp.exec(value);
		if(matcher)
		{
			var defaultDate = new Date();
			var year = defaultDate.getYear();
			var month = defaultDate.getMonth();
			var day = 1;
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
						var index = self.label[lang].longMonths.indexOf(capture);
						if(index > -1)
						{
							month = index;
						}
						break;
					}
					case "MMM":
					{
						capture = capture.charAt(0).toUpperCase() + capture.slice(1).toLowerCase();
						var index = self.label[lang].shortMonths.indexOf(capture);
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
	},
	
	
	reformat : function(parsePattern, formatPattern, value, lang)
	{
		var date = this.parse(parsePattern, value, lang);
		if(isSet(date))
		{
			value = this.format(formatPattern, date, lang);
		}
		return value;
	}
	
};



