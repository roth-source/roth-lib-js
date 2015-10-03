
var IdUtil = IdUtil || (function()
{
	var defaultLength = 10;
	var defaultKey = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	
	return {
		
		generate : function(length, key)
		{
			length = isNumber(length) ? length : defaultLength;
			key = isValidString(key) ? key : defaultKey;
			var value = "";
			for(var i = 0; i < length; i++)
			{
				value += key.charAt(Math.floor(Math.random() * key.length));
			}
			return value;
		}
		
	};
	
})();



