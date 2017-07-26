

var StringUtil = StringUtil ||
{
	
	
	padNumber : function(value, length)
	{
		return this.pad(new String(value), length, "0", true);
	},
	
	
	padLeft : function(value, length, character)
	{
		return this.pad(value, length, character, true);
	},
	
	
	padRight : function(value, length, character)
	{
		return this.pad(value, length, character, false);
	},
	
	
	pad : function(value, length, character, left)
	{
		if(!isSet(value))
		{
			value = "";
		}
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
	
	
	repeat : function(value, length)
	{
		var repeated = "";
		for(var i = 0; i < length; i++)
		{
			repeated += value;
		}
		return repeated;
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
	},
	
	
	capitalize : function(value)
	{
		return isValidString(value) ? value.charAt(0).toUpperCase() + value.slice(1) : "";
	},
	
	
	camelCase : function(value)
	{
		value = this.capitalize(value);
		value = value.replace(/[^a-zA-Z0-9]+([a-zA-Z0-9]{1})/g, function(match, capture)
		{
			var replacement = "";
			if(isValidString(capture))
			{
				replacement = capture.charAt(0).toUpperCase();
			}
			return replacement;
		});
		return value;
	},
	
	
	stripHtml : function(value)
	{
		return value.replace(/<\/?[^>]+(>|$)/g, "");
	},
	
	
	startsWith : function(value, pattern)
	{
		return isSet(value) ? new RegExp("^" + pattern).test(value) : false;
	}
	
};



