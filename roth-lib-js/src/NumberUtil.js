

/**
 * A utility for formatting numbers.
 * @namespace NumberUtil
 */
var NumberUtil = NumberUtil ||
{
	
	/**
	 * Format a string or number as an int.
	 * @memberof NumberUtil
	 * @method
	 * @param {Number|String} value
	 * @returns {String}
	 */
	formatInt : function(value)
	{
		var parsedValue = parseInt(value);
		return !isNaN(parsedValue) ? parsedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
	},
	
	/**
	 * Format a string or number as a decimal of 2 places.
	 * @memberof NumberUtil
	 * @method
	 * @param {Number|String} value
	 * @returns {String}
	 */
	formatDecimal : function(value)
	{
		var parsedValue = parseFloat(value);
		return !isNaN(parsedValue) ? parsedValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
	},
	
	/**
	 * Format a string or number as a percentage.
	 * @memberof NumberUtil
	 * @method
	 * @param {Number|String} value
	 * @param {Number} [decimal]
	 * @returns {String}
	 */
	formatPercent : function(value, decimal)
	{
		decimal = isNumber(decimal) ? decimal : 0;
		var parsedValue = parseFloat(value);
		return !isNaN(parsedValue) ? (parsedValue * 100).toFixed(decimal) : "";
	}
	
};



