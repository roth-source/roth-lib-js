

/**
 * A utility for manipulating cookies.
 * @namespace CookieUtil
 */
var CookieUtil = CookieUtil ||
{
	
	/**
	 * Gets the cookie value of the specified key.
	 * @memberof CookieUtil
	 * @method
	 * @param {String} key
	 * @returns {String}
	 */
	get : function(key)
	{
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	
	/**
	 * Sets the cookie value of the specified key.
	 * @memberof CookieUtil
	 * @method
	 * @param {String} key
	 * @param {String} value
	 * @param {Number|String|Date} [end]
	 * @param {String} [path]
	 * @param {String} [domain]
	 * @param {Boolean} [secure]
	 * @returns {Boolean}
	 */
	set : function(key, value, end, path, domain, secure)
	{
		if(!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) { return false; }
		var expires = "";
		if(end)
		{
			switch(end.constructor)
			{
				case Number:
					expires = end === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + end;
					break;
				case String:
					expires = "; expires=" + end;
					break;
				case Date:
					expires = "; expires=" + end.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + expires + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (secure ? "; secure" : "");
		return true;
	},
	
	/**
	 * Removes the cookie value of the specified key.
	 * @memberof CookieUtil
	 * @method
	 * @param {String} key
	 * @param {String} [path]
	 * @param {String} [domain]
	 * @returns {Boolean}
	 */
	remove : function(key, path, domain)
	{
		if(!key || !this.has(key)) { return false; }
		document.cookie = encodeURIComponent(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( domain ? "; domain=" + domain : "") + ( path ? "; path=" + path : "");
		return true;
	},
	
	/**
	 * Checks for existence of a cookie with specified key.
	 * @memberof CookieUtil
	 * @method
	 * @param {String} key
	 * @returns {Boolean}
	 */
	has : function(key)
	{
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	}
	
};



