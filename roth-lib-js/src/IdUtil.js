

/**
 * A utility for random ids.
 * @namespace IdUtil
 */
var IdUtil = IdUtil ||
{
	
	/**
	 * Default id length of 10.
	 * @memberof IdUtil
	 * @member {Number}
	 */
	defaultLength : 10,
	
	/**
	 * Default key for 0-9 a-z A-Z.
	 * @memberof IdUtil
	 * @member {String}
	 */
	defaultKey : "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	
	/**
	 * Generates a random id.
	 * @memberof IdUtil
	 * @method
	 * @param {Number} [length]
	 * @param {String} [key]
	 * @returns {String}
	 */
	generate : function(length, key)
	{
		length = isNumber(length) ? length : this.defaultLength;
		key = isValidString(key) ? key : this.defaultKey;
		var value = "";
		for(var i = 0; i < length; i++)
		{
			value += key.charAt(Math.floor(Math.random() * key.length));
		}
		return value;
	}
	
};



