

/**
 * A utility for formatting currency.
 * @namespace CurrencyUtil
 */
var CurrencyUtil = CurrencyUtil ||
{
	
	/**
	 * Formats currency cents for input fields.
	 * @memberof CurrencyUtil
	 * @method
	 * @param {Number} value
	 * @returns {String}
	 */
	formatInput : function(value)
	{
		return this.format(value, null, null)
	},
	
	/**
	 * Formats currency cents into display text.
	 * @memberof CurrencyUtil
	 * @method
	 * @param {Number} value
	 * @returns {String}
	 */
	formatText : function(value)
	{
		return this.format(value, "$", ",")
	},
	
	/**
	 * Formats currency cents with prefix symbol and thousands seperator.
	 * @memberof CurrencyUtil
	 * @method
	 * @param {Number} value
	 * @param {String} [symbol]
	 * @param {String} [seperator]
	 * @returns {String}
	 */
	format : function(value, symbol, seperator)
	{
		if(isNumber(value))
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
	
	/**
	 * Parses currency string into a currency cents number.
	 * @memberof CurrencyUtil
	 * @method
	 * @param {String} value
	 * @returns {Number}
	 */
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



