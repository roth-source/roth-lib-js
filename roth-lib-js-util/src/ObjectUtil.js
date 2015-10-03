
var ObjectUtil = ObjectUtil || (function()
{
	
	return {
		
		parse : function(value)
		{
			var object = null;
			try
			{
				if(isObject(value))
				{
					object = value;
				}
				else
				{
					eval("object = " + value);
				}
			}
			catch(e)
			{
				
			}
			return isObject(object) ? object : {};
		}
		
	};
	
})();



