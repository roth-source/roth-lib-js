
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
		},
		
		getValue : function(object, path)
		{
			var paths = path.split(".");
			for(var i in paths)
			{
				if(object[paths[i]])
				{
					object = object[paths[i]];
				}
				else
				{
					object = null;
					break;
				}
			}
			return object;
		}
		
	};
	
})();



