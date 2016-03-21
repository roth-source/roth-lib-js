


var CurrencyUtil = CurrencyUtil ||
{
	
	
	formatInput : function(value)
	{
		return this.format(value, null, null)
	},
	
	
	formatText : function(value)
	{
		return this.format(value, "$", ",")
	},
	
	
	formatRounded : function(value)
	{
		return this.format(value, "$", ",", true)
	},
	
	
	format : function(value, symbol, seperator, round)
	{
		if(isNumber(value))
		{
			var decimal = 2;
			value = value / 100;
			if(isTrue(round)) 
			{
				decimal = 0;
				value = Math.round(value);
			}
			var formattedValue = isValidString(symbol) ? symbol : "";
			formattedValue += isValidString(seperator) ? parseFloat(value).toFixed(decimal).replace(/\B(?=(\d{3})+(?!\d))/g, seperator) : parseFloat(value).toFixed(decimal);
			return formattedValue;
		}
		else
		{
			return "";
		}
	},
	
	
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



