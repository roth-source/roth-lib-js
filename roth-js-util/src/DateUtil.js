


var DateUtil = (function()
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
