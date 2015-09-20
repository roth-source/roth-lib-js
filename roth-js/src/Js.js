
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



