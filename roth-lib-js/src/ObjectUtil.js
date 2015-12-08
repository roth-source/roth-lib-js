

/**
 * A utility for manipulating objects.
 * @namespace ObjectUtil
 */
var ObjectUtil = ObjectUtil ||
{
	
	/**
	 * Eval a string into an object.
	 * @memberof ObjectUtil
	 * @method
	 * @param {*} value
	 * @returns {Object}
	 */
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
	
	/**
	 * Retrieve an element from an object using a dot notation path.
	 * @memberof ObjectUtil
	 * @method
	 * @param {Object} object
	 * @param {path} path
	 * @returns {*}
	 */
	find : function(object, path)
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



