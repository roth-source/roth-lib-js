

/**
 * @class
 */
roth.lib.js.client.Hash = roth.lib.js.client.Hash || function()
{
	/**
	 * @lends Hash.prototype
	 */
	
	/**
	 * the current location hash value
	 * @member {String}
	 */
	this.value = null;
	
	/**
	 * the current lang
	 * @member {String}
	 */
	this.lang = null;
	
	/**
	 * the current layout
	 * @member {String}
	 */
	this.layout = null;
	
	/**
	 * the current module
	 * @member {String}
	 */
	this.module = null;
	
	/**
	 * the current page
	 * @member {String}
	 */
	this.page = null;
	
	/**
	 * the current param object
	 * @member {Object}
	 */
	this.param = {};
	
	/**
	 * the current text
	 * @member {String}
	 */
	this.text = null;
	
	/**
	 * the current search object
	 * @member {Object}
	 */
	this.search = null;
	
	/**
	 * the current context path
	 * @member {String}
	 */
	this.context = null;
	
	/**
	 * the default module copied from the config
	 * @member {String}
	 */
	this.defaultModule = "index";
	
	/**
	 * the default page copied from the config
	 * @member {String}
	 */
	this.defaultPage = "index";	
	
	/**
	 * the lang storage key
	 * @member {String}
	 */
	this.langStorage = "lang";
	
	/**
	 * the previously loaded lang, layout, module, page, param
	 * @member {Object}
	 */
	this.loaded = {};
	
	/**
	 * is a new location hash value
	 * @member {Boolean}
	 */
	this.newValue = false;
	
	/**
	 * is a new lang
	 * @member {Boolean}
	 */
	this.newLang = false;
	
	/**
	 * is a new layout
	 * @member {Boolean}
	 */
	this.newLayout = false;
	
	/**
	 * is a new module
	 * @member {Boolean}
	 */
	this.newModule = false;
	
	/**
	 * is a new page
	 * @member {Boolean}
	 */
	this.newPage = false;
	
	/**
	 * is a new text
	 * @member {Boolean}
	 */
	this.newText = false;
	
	/**
	 * check existence of param on hash
	 * @method
	 * @param {String} name
	 * @returns {Boolean}
	 */
	this.hasParam = function(name)
	{
		return isSet(this.param[name]);
	};
	
	/**
	 * gets the param by name or uses default value
	 * @method
	 * @param {String} name
	 * @param {String} [defaultValue]
	 * @returns {String}
	 */
	this.getParam = function(name, defaultValue)
	{
		var value = this.param[name];
		return isValidString(value) ? value : defaultValue;
	};
	
	/**
	 * gets the size of the param object
	 * @method
	 * @returns {Number}
	 */
	this.getParamSize = function()
	{
		return Object.keys(this.param).length;
	};
	
	/**
	 * checks if the param object is empty
	 * @method
	 * @returns {Boolean}
	 */
	this.isParamEmpty = function()
	{
		return this.getParamSize() == 0;
	};
	
	/**
	 * gets the module name or default module
	 * @method
	 * @returns {String}
	 */
	this.getModule = function()
	{
		return isSet(this.module) ? this.module : this.defaultModule;
	};
	
	/**
	 * gets the page name or default page
	 * @method
	 * @returns {String}
	 */
	this.getPage = function()
	{
		return isSet(this.page) ? this.page : this.defaultPage;
	};
	
	/**
	 * sets the location hash value and checks for change
	 * @method
	 * @param {String} value
	 */
	this.setValue = function(value)
	{
		this.value = value;
		this.newValue = this.value != this.loaded.value;
	};
	
	/**
	 * sets the lang value and checks for change
	 * @method
	 * @param {String} lang
	 */
	this.setLang = function(lang)
	{
		this.lang = lang;
		this.newLang = this.lang != this.loaded.lang;
	};
	
	/**
	 * sets the layout value and checks for change
	 * @method
	 * @param {String} layout
	 */
	this.setLayout = function(layout)
	{
		this.layout = layout;
		this.newLayout = this.layout != this.loaded.layout;
	};
	
	/**
	 * sets the module value and checks for change
	 * @method
	 * @param {String} module
	 */
	this.setModule = function(module)
	{
		this.module = module;
		this.newModule = this.module != this.loaded.module;
	};
	
	/**
	 * sets the page value and checks for change
	 * @method
	 * @param {String} page
	 */
	this.setPage = function(page)
	{
		this.page = page;
		this.newPage = this.newModule || this.page != this.loaded.page;
	};
	
	/**
	 * sets the text value and checks for change
	 * @method
	 * @param {String} page
	 */
	this.setText = function(text)
	{
		this.text = text;
		this.newText = this.text != this.loaded.text;
	};
	
	/**
	 * is a new value
	 * @method
	 * @returns {Boolean}
	 */
	this.isNewValue = function()
	{
		return this.newValue;
	}
	
	/**
	 * is a new lang
	 * @method
	 * @returns {Boolean}
	 */
	this.isNewLang = function()
	{
		return this.newLang;
	}
	
	/**
	 * is a new layout
	 * @method
	 * @returns {Boolean}
	 */
	this.isNewLayout = function()
	{
		return this.newLayout;
	}
	
	/**
	 * is a new module
	 * @method
	 * @returns {Boolean}
	 */
	this.isNewModule = function()
	{
		return this.newModule;
	}
	
	/**
	 * is a new page
	 * @method
	 * @returns {Boolean}
	 */
	this.isNewPage = function()
	{
		return this.newPage;
	}
	
	/**
	 * is a new text
	 * @method
	 * @returns {Boolean}
	 */
	this.isNewText = function()
	{
		return this.newText;
	}
	
	/**
	 * changes the lang and reloads page
	 * @method
	 * @param {String} lang
	 */
	this.changeLang = function(lang)
	{
		this.setLang(lang);
		this.refresh();
	};
	
	/**
	 * changes history to last location
	 * @method
	 */
	this.back = function()
	{
		window.history.back();
	};
	
	/**
	 * assigns location hash to new page
	 * @method
	 * @param {String} module
	 * @param {String} page
	 * @param {Object} param
	 */
	this.next = function(module, page, param)
	{
		if(!isValidString(page))
		{
			window.location.assign(module);
		}
		else
		{
			window.location.assign(this.build(module, page, param));
		}
	};
	
	/**
	 * replaces the location of new page
	 * @method
	 * @param {String} module
	 * @param {String} page
	 * @param {Object} param
	 */
	this.replace = function(module, page, param)
	{
		if(!isValidString(page))
		{
			window.location.replace(module);
		}
		else
		{
			window.location.replace(this.build(module, page, param));
		}
	};
	
	/**
	 * refreshes the location
	 * @method
	 */
	this.refresh = function()
	{
		window.location.replace(this.build(this.module, this.page, this.param));
	};
	
	/**
	 * calls a location reload
	 * @method
	 */
	this.reload = function()
	{
		window.location.reload();
	};
	
	/**
	 * builds a module, page, and param object into a hash
	 * @method
	 * @param {String} module
	 * @param {String} page
	 * @param {Object} param
	 */
	this.build = function(module, page, param)
	{
		var hash = "#";
		if(isValidString(module))
		{
			hash += "/" + module + "/";
			if(isValidString(page))
			{
				hash += page + "/";
				param = isObject(param) ? param : this.param;
				for(var name in param)
				{
					var value = param[name];
					if(isSet(value))
					{
						hash += encodeURIComponent(name) + "/";
						if(isArray(value))
						{
							hash += "[";
							var seperator = "";
							for(var i in value)
							{
								hash += seperator;
								hash += encodeURIComponent(value[i]);
								seperator = ",";
							}
							hash += "]/";
						}
						else
						{
							hash += encodeURIComponent(value) + "/";
						}
					}
				}
			}
		}
		return hash;
	};
	
	/**
	 * parses the hash value and checks if the hash is valid
	 * @method
	 * @returns {Boolean}
	 */
	this.isValid = function()
	{
		var hash = "#/";
		var lang = null;
		var i = 1;
		var values = window.location.hash.split("/");
		if(isValid(values[i]))
		{
			if(values[i].length == 2)
			{
				this.lang = null;
				lang = values[i];
				hash += values[i] + "/";
				i++;
			}
		}
		if(isValid(values[i]))
		{
			this.setModule(values[i]);
			hash += values[i] + "/";
			i++;
		}
		if(isValid(values[i]))
		{
			this.setPage(values[i]);
			hash += values[i] + "/";
			i++;
		}
		this.param = {};
		var name = null;
		for(i; i < values.length; i++)
		{
			if(isValid(values[i]))
			{
				if(name === null)
				{
					name = values[i];
				}
				else
				{
					var value = decodeURIComponent(values[i]);
					var matches = value.match(/^\[(.*?)\]$/);
					if(isNotEmpty(matches))
					{
						this.param[name] = matches[1].split(",");
					}
					else
					{
						this.param[name] = value;
					}
					hash += name + "/";
					hash += values[i] + "/";
					name = null;
				}
			}
		}
		if(isNull(this.search))
		{
			this.search = {};
			var nameValues = window.location.search.substr(1).split("&");
			for(var i = 0; i < nameValues.length; i++)
			{
				var nameValue = nameValues[i].split("=", 2);
				if(nameValue.length == 2)
				{
					var name = nameValue[0];
					var value = nameValue[1];
					this.search[name] = decodeURIComponent(value.replace(/\+/g, " "));
				}
			}
		}
		if(isNull(this.context))
		{
			this.context = getContext();
			if(isNull(this.context))
			{
				if(isSet(this.search.context))
				{
					this.context = this.search.context;
				}
				if(isNull(this.context))
				{
					if(isHyperTextProtocol())
					{
						var path = window.location.pathname.substr(1);
						var index = path.lastIndexOf("/");
						if(index > -1)
						{
							path = path.slice(0, index);
						}
						this.context = path;
					}
				}
			}
		}
		var blankHash = window.location.hash == "" || window.location.hash == "#";
		if(!blankHash && window.location.hash != hash)
		{
			window.location.replace(hash);
			return false;
		}
		else if(isSet(lang))
		{
			localStorage.setItem(this.langStorage, lang);
			this.refresh();
			return false;
		}
		else
		{
			this.setValue(window.location.hash);
			this.newLang = false;
			return true;
		}
	};
	
	/**
	 * sets the current param object to the loaded object
	 * @method
	 */
	this.loadedParam = function()
	{
		this.loaded.param = this.param;
	};
	
	/**
	 * sets the current hash value to the loaded object
	 * @method
	 */
	this.loadedValue = function()
	{
		this.loaded.value = this.value;
	};
	
	/**
	 * sets the current lang to the loaded object
	 * @method
	 */
	this.loadedLang = function()
	{
		this.loaded.lang = this.lang;
	};
	
	/**
	 * sets the current layout to the loaded object
	 * @method
	 */
	this.loadedLayout = function()
	{
		this.loaded.layout = this.layout;
	};
	
	/**
	 * sets the current module to the loaded object
	 * @method
	 */
	this.loadedModule = function()
	{
		this.loaded.module = this.module;
	};
	
	/**
	 * sets the current page to the loaded object
	 * @method
	 */
	this.loadedPage = function()
	{
		this.loaded.page = this.page;
	};
	
	/**
	 * sets the current page to the loaded object
	 * @method
	 */
	this.loadedText = function()
	{
		this.loaded.text = this.text;
	};
	
	/**
	 * creates a console group for a new page load and logs params
	 * @method
	 */
	this.log = function()
	{
		console.groupEnd();
		var group = "";
		group += "PAGE : ";
		group += this.lang + " / ";
		group += this.getModule() + " / ";
		group += this.getPage() + " / ";
		console.group(group + JSON.stringify(this.param));
	};
	
	/**
	 * clones the param object
	 * @method
	 * @returns {Object}
	 */
	this.cloneParam = function()
	{
		return $.extend({}, this.param);;
	}
	
	/**
	 * clones the loaded param object
	 * @method
	 * @returns {Object}
	 */
	this.cloneLoadedParam = function()
	{
		return isSet(this.loaded.param) ? $.extend({}, this.loaded.param) : {};
	}
	
};



