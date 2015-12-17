
/**
 * A utility for manipulating strings.
 * @namespace StringUtil
 */
var StringUtil = StringUtil ||
{
	
	/**
	 * Zero left pad a number.
	 * @memberof StringUtil
	 * @method
	 * @param {Number|String} value
	 * @param {Number} length
	 * @returns {String}
	 */
	padNumber : function(value, length)
	{
		return this.pad(new String(value), length, "0", true);
	},
	
	/**
	 * Left pad a string with character.
	 * @memberof StringUtil
	 * @method
	 * @param {String} value
	 * @param {Number} length
	 * @param {String} character
	 * @returns {String}
	 */
	padLeft : function(value, length, character)
	{
		return this.pad(value, length, character, true);
	},
	
	/**
	 * Right pad a string with character.
	 * @memberof StringUtil
	 * @method
	 * @param {Number|String} value
	 * @param {Number} length
	 * @param {String} character
	 * @returns {String}
	 */
	padRight : function(value, length, character)
	{
		return this.pad(value, length, character, false);
	},
	
	/**
	 * Pad a string in direction of left boolean.
	 * @memberof StringUtil
	 * @method
	 * @param {String} value
	 * @param {Number} length
	 * @param {String} character
	 * @param {Boolean} left
	 * @returns {String}
	 */
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
	},
	
	/**
	 * Repeat a value for specified length.
	 * @memberof StringUtil
	 * @method
	 * @param {String} value
	 * @param {Number} length
	 * @returns {String}
	 */
	repeat : function(value, length)
	{
		var repeated = "";
		for(var i = 0; i < length; i++)
		{
			repeated += value;
		}
		return repeated;
	},
	
	/**
	 * Compare two strings.
	 * @memberof StringUtil
	 * @method
	 * @param {String} value1
	 * @param {String} value2
	 * @param {Boolean} [caseInsensitive]
	 * @returns {String}
	 */
	equals : function(value1, value2, caseInsensitive)
	{
		caseInsensitive = isSet(caseInsensitive) ? caseInsensitive : true;
		var equals = false;
		if(value1 && value2)
		{
			equals = new String(value1).match(new RegExp("^" + new String(value2) + "$", caseInsensitive ? "i" : "")) !== null;
		}
		return equals;
	},
	
	/**
	 * Uppercase the first character.
	 * @memberof StringUtil
	 * @method
	 * @param {String} value
	 * @returns {String}
	 */
	capitalize : function(value)
	{
		return value.charAt(0).toUpperCase() + value.slice(1);
	},
	
	/**
	 * Replaces named parameters with values from param object
	 * @method
	 * @param {String} value
	 * @param {Object} param
	 * @returns {String}
	 */
	replace : function(value, param)
	{
		value = value.replace(/{{\s*?(\w+)\s*?}}/g, function(match, capture)
		{
			var replacement = ObjectUtil.find(param, capture);
			return isSet(replacement) ? replacement : "";
		});
		return value;
	}
	
};



