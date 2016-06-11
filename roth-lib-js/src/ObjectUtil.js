


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
	},
	
	
	equals : function(object1, object2)
	{
		var equals = false;
		if(!isSet(object1) && !isSet(object2))
		{
			equals = true;
		}
		else if(isArray(object1) && isArray(object2))
		{
			equals = JSON.stringify(object1) == JSON.stringify(object2);
		}
		else if(isObject(object1) && isObject(object2))
		{
			equals = JSON.stringify(object1) == JSON.stringify(object2);
		}
		else
		{
			equals = object1 == object2;
		}
		return equals;
	}
	
	
};



