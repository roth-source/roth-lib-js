
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
	return value === true;
};

var isFalse = isFalse || function(value)
{
	return value === false;
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

var inArray = inArray || function(value, array)
{
	var contains = false;
	if(isArray(array))
	{
		contains = array.indexOf(value) > -1;
	}
	return contains;
};

var inMap = inMap || function(value, map)
{
	var array = [];
	for(var key in map)
	{
		array.push(map[key]);
	}
	return inArray(value, array);
};

var forEach = forEach || function(object, callback)
{
	if(isFunction(callback))
	{
		if(isArray(object))
		{
			for(var i in object)
			{
				var loop =
				{
					index 	: i,
					length 	: object.length,
					first	: i == 0,
					last	: i == object.length - 1
				};
				callback(object[i], i, loop);
			}
		}
		else if(isObject(object))
		{
			var keys = Object.keys(object);
			for(var i in keys)
			{
				var key = keys[i];
				var loop =
				{
					index 	: i,
					length 	: keys.length,
					first	: i == 0,
					last	: i == keys.length - 1
				};
				callback(object[key], key, loop);
			}
		}
	}
};



