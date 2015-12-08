

/**
 * Javascript variable type enum.
 * @enum {String}
 */
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

/**
 * The var type from a toString slice.
 * @function
 * @param {*} value
 * @returns {String}
 */
var typeOf = typeOf || function(value)
{
	return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

/**
 * Checks if var is one of the param types.
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
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

/**
 * === undefined
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isUndefined = isUndefined || function(value)
{
	return value === undefined;
};

/**
 * not undefined
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isDefined = isDefined || function(value)
{
	return !isUndefined(value);
};

/**
 * === null
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isNull = isNull || function(value)
{
	return value === null;
};

/**
 * not undefined and not null
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isSet = isSet || function(value)
{
	return !isUndefined(value) && !isNull(value);
};

/**
 * is set and is not blank
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isValid = isValid || function(value)
{
	return isSet(value) && value !== "";
};

/**
 * is valid and is string
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isValidString = isValidString || function(value)
{
	return isValid(value) && isString(value);
};

/**
 * is not valid
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isInvalid = isInvalid || function(value)
{
	return !isValid(value);
};

/**
 * is set and is invalid string or empty array/object
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
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

/**
 * is not empty
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isNotEmpty = isNotEmpty || function(value)
{
	return !isEmpty(value);
}

/**
 * is true or "true"
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isTrue = isTrue || function(value)
{
	return value === true || value === "true";
};

/**
 * is false or "false"
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isFalse = isFalse || function(value)
{
	return value === false || value === "false";;
};

/**
 * is type boolean
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isBoolean = isBoolean || function(value)
{
	return isType(value, Type.BOOLEAN);
};

/**
 * is type number
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isNumber = isNumber || function(value)
{
	return isType(value, Type.NUMBER);
};

/**
 * is type string
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isString = isString || function(value)
{
	return isType(value, Type.STRING);
};

/**
 * is type array
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isArray = isArray || function(value)
{
	return isType(value, Type.ARRAY);
};

/**
 * is type function
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isFunction = isFunction || function(value)
{
	return isType(value, Type.FUNCTION);
};

/**
 * is type date
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isDate = isDate || function(value)
{
	return isType(value, Type.DATE);
};

/**
 * is type error
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isError = isError || function(value)
{
	return isType(value, Type.ERROR);
};

/**
 * is type regexp
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isRegExp = isRegExp || function(value)
{
	return isType(value, Type.REGEXP);
};

/**
 * is type object
 * @function
 * @param {*} value
 * @returns {Boolean}
 */
var isObject = isObject || function(value)
{
	return isType(value, Type.OBJECT);
};

/**
 * is element in array
 * @function
 * @param {*} value
 * @param {Array} array
 * @returns {Boolean}
 */
var inArray = inArray || function(value, array)
{
	var contains = false;
	if(isArray(array))
	{
		contains = array.indexOf(value) > -1;
	}
	return contains;
};

/**
 * is element in map
 * @function
 * @param {*} value
 * @param {Object} map
 * @returns {Boolean}
 */
var inMap = inMap || function(value, map)
{
	var array = [];
	for(var key in map)
	{
		array.push(map[key]);
	}
	return inArray(value, array);
};

/**
 * foor loop convenience
 * @param {Object|Array} object
 * @param {Function} callback
 * @function
 */
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



