
var StringUtil = StringUtil || (function()
{
	
	return {
		
		padNumber : function(value, length)
		{
			return this.pad(new String(value), length, "0", true);
		},
		
		padLeft : function(value, length, character)
		{
			if(character)
			return this.pad(value, length, character, true);
		},
		
		padRight : function(value, length, character)
		{
			return this.pad(value, length, character, false);
		},
		
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
		
		equals : function(value1, value2, caseInsensitive)
		{
			caseInsensitive = isSet(caseInsensitive) ? caseInsensitive : true;
			var equals = false;
			if(value1 && value2)
			{
				equals = new String(value1).match(new RegExp("^" + new String(value2) + "$", caseInsensitive ? "i" : "")) !== null;
			}
			return equals;
		}
	};
	
})();



