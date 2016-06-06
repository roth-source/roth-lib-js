


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
		value = parseInt(value);
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
			if(isValidString(seperator))
			{
				var stringValue = parseFloat(value).toFixed(decimal);
				var formattedValues = [];
				if(decimal > 0)
				{
					for(var i = 1; i <= decimal; i++)
					{
						formattedValues.push(stringValue.charAt(stringValue.length - i));
					}
					formattedValues.push(".");
				}
				var length = stringValue.length - decimal - 1;
				for(var i = 1; i <= length; i++)
				{
					formattedValues.push(stringValue.charAt(length - i));
					if(i < length && i % 3 == 0)
					{
						formattedValues.push(seperator);
					}
				}
				formattedValue += formattedValues.reverse().join("");
			}
			else
			{
				formattedValue = parseFloat(value).toFixed(decimal);
			}
			//formattedValue += isValidString(seperator) ? parseFloat(value).toFixed(decimal).replace(/\B(?=(\d{3})+(?!\d))/g, seperator) : parseFloat(value).toFixed(decimal);
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
					parsedValue = Math.round(value * 100);
				}
			}
			catch(e)
			{
				
			}
		}
		return parsedValue;
	}
		
};



