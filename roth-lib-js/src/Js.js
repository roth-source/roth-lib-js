

var roth = roth || {};
roth.lib = roth.lib || {};
roth.lib.js = roth.lib.js || {};


var isUndefined = isUndefined || function(value)
{
	return value === undefined;
};


var isDefined = isDefined || function(value)
{
	return !isUndefined(value);
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


var isTrue = isTrue || function(value)
{
	return value === true || value === "true";
};


var isFalse = isFalse || function(value)
{
	return value === false || value === "false";;
};


var isBoolean = isBoolean || function(value)
{
	return typeof value === "boolean";
};


var isNumber = isNumber || function(value)
{
	return typeof value === "number";
};


var isString = isString || function(value)
{
	return typeof value === "string";
};


var isArray = isArray || function(value)
{
	return Array.isArray(value);
};


var isFunction = isFunction || function(value)
{
	return typeof value === "function";
};


var isDate = isDate || function(value)
{
	return value instanceof Date;
};


var isError = isError || function(value)
{
	return value instanceof Error;
};


var isRegExp = isRegExp || function(value)
{
	return value instanceof RegExp;
};


var isObject = isObject || function(value)
{
	return isSet(value) && typeof value === "object";
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
				if(isFalse(callback(object[i], i, loop)))
				{
					break;
				}
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
				if(isFalse(callback(object[key], key, loop)))
				{
					break;
				}
			}
		}
	}
};


var mixin = mixin || function(dest, source)
{
	if(isFunction(dest) && isFunction(source))
	{
		forEach(source.prototype, function(value, name)
		{
			if(isFunction(value))
			{
				dest.prototype[name] = value;
			}
		});
	}
};



