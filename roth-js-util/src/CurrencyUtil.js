


var CurrencyUtil = (function()
{
	
	return {
		
		formatInput : function(value)
		{
			return this.format(value, null, null)
		},
		
		formatText : function(value)
		{
			return this.format(value, "$", ",")
		},
		
		format : function(value, symbol, seperator)
		{
			if(!isNaN(value))
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
		}
		
	};
	
})();



