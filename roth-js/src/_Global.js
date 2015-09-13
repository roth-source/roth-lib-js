
// CONSTANTS

var Type =
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

var noop = function(){};

var typeOf = function(value)
{
	return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

var isType = function(value)
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

var isUndefined = function(value)
{
	return value === undefined;
};

var isNull = function(value)
{
	return value === null;
};

var isSet = function(value)
{
	return !isUndefined(value) && !isNull(value);
};

var isValid = function(value)
{
	return isSet(value) && value !== "";
};

var isValidString = function(value)
{
	return isValid(value) && isString(value);
};

var isInvalid = function(value)
{
	return !isValid(value);
};

var isEmpty = function(value)
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

var isNotEmpty = function(value)
{
	return !isEmpty(value);
}

var isTrue = function(value)
{
	return (value ? true : false);
};

var isFalse = function(value)
{
	return !isTrue(value);
};

var isBoolean = function(value)
{
	return isType(value, Type.BOOLEAN);
};

var isNumber = function(value)
{
	return isType(value, Type.NUMBER);
};

var isString = function(value)
{
	return isType(value, Type.STRING);
};

var isArray = function(value)
{
	return isType(value, Type.ARRAY);
};

var isFunction = function(value)
{
	return isType(value, Type.FUNCTION);
};

var isDate = function(value)
{
	return isType(value, Type.DATE);
};

var isError = function(value)
{
	return isType(value, Type.ERROR);
};

var isRegexp = function(value)
{
	return isType(value, Type.REGEXP);
};

var isObject = function(value)
{
	return isType(value, Type.OBJECT);
};



