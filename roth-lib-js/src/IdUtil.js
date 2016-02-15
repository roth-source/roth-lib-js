


var IdUtil = IdUtil ||
{
	
	
	defaultLength : 10,
	
	
	defaultKey : "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	
	
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



