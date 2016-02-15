


var ObjectUtil = ObjectUtil ||
{
	
	
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
	
	
	find : function(object, path)
	{
		var paths = path.split(".");
		for(var i in paths)
		{
			if(isSet(object[paths[i]]))
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



