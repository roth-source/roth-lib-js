

roth.lib.js.web.View = function()
{
	
};


roth.lib.js.web.View.prototype._init = function(web)
{
	this.web = web;
	this.config = web.config;
	this.template = web.template;
	this.register = web.register;
	this.hash = web.hash;
	this.text = web.text;
	this.layout = web.layout;
	this.page = web.page;
	this.context = web.context;
};


roth.lib.js.web.View.prototype.loadComponentInit = function(element, componentName, service, method, request, data, callback)
{
	var self = this;
	element = this.wrap(element);
	if(element.length > 0)
	{
		var service = isValidString(service) ? service : element.attr(this.config.attr.service);
		var method = isValidString(method) ? method : element.attr(this.config.attr.method);
		if(isValidString(service) && isValidString(method))
		{
			request = isObject(request) ? request : {};
			$.extend(true, request, this.hash.cloneParam(), ObjectUtil.parse(element.attr(this.config.attr.request)));
			var success = function(response)
			{
				data = isObject(data) ? data : {};
				$.extend(true, data, response);
				self.loadComponent(element, componentName, data, callback);
			};
			var error = function(errors)
			{
				self.loadComponent(element, componentName, data, callback);
			};
			var complete = function()
			{
				
			};
			this.service(service, method, request, success, error, complete);
		}
		else
		{
			this.loadComponent(element, componentName, data, callback);
		}
	}
	else
	{
		console.error("element not found");
	}
};


roth.lib.js.web.View.prototype.loadComponent = function(element, componentName, data, callback)
{
	var component = null;
	element = this.wrap(element);
	if(element.length > 0)
	{
		var module = this.hash.getModule();
		var componentConstructor = this.register.getComponentConstructor(module, componentName);
		if(isFunction(componentConstructor))
		{
			var componentConfig = isObject(componentConstructor.config) ? componentConstructor.config : {};
			component = this.register.constructView(componentConstructor, this.web);
			if(isSet(component))
			{
				component.element = element;
				this.web._loadComponent(component, data, true);
				if(isFunction(component.ready))
				{
					component.ready(data, component);
				}
				component.element.show();
				if(isFunction(component.visible))
				{
					component.visible(data, component);
				}
				if(isFunction(callback))
				{
					callback(data, component);
				}
			}
		}
	}
	else
	{
		console.error("element not found");
	}
	return component;
};


roth.lib.js.web.View.prototype.service = function(service, method, request, success, error, complete, group)
{
	this.web.service(service, method, request, success, error, complete, group, this);
};


roth.lib.js.web.View.prototype.eval = function(code, scope)
{
	var names = [];
	var values = [];
	forEach(scope, function(value, name)
	{
		names.push(name);
		values.push(value);
	});
	return new Function(names.join(), code).apply(this, values);
};


roth.lib.js.web.View.prototype.groupElements = function(element, active)
{
	active = isSet(active) ? active : true;
	var selector = "";
	selector += "input[name][type=hidden]" + (active ? ":enabled" : "") + ", ";
	selector += "input[name][type!=hidden][type!=radio][" + this.config.attr.required + "]" + (active ? ":include" : "") + ", ";
	selector += "select[name][" + this.config.attr.required + "]" + (active ? ":include" : "") + ", ";
	selector += "textarea[name][" + this.config.attr.required + "]" + (active ? ":include" : "") + ", ";
	selector += "[" + this.config.attr.radioGroup + "][" + this.config.attr.required + "]:has(input[name][type=radio]" + (active ? ":include" : "") + ") ";
	return element.find(selector);
};


roth.lib.js.web.View.prototype.request = function(element, service, method)
{
	var self = this;
	var elementRegExp = new RegExp("^(\\w+)(?:\\[|$)");
	var indexRegExp = new RegExp("\\[(\\d+)?\\]", "g");
	var valid = true;
	var request = this.hash.cloneParam();
	var fields = [];
	this.groupElements(element).each(function()
	{
		var field = self.validate($(this));
		if(!field.valid)
		{
			valid = false;
		}
		if(isDebug())
		{
			fields.push(field);
		}
		if(valid && isValidString(field.name) && isValid(field.value))
		{
			var tempObject = request;
			var names = field.name.split(".");
			for(var i in names)
			{
				var lastElement = (i == names.length - 1);
				var elementMatcher = elementRegExp.exec(names[i]);
				if(elementMatcher)
				{
					var elementName = elementMatcher[1];
					var indexes = [];
					var indexMatcher;
					while((indexMatcher = indexRegExp.exec(names[i])) !== null)
					{
						var index = indexMatcher[1];
						indexes.push(index ? parseInt(index) : -1);
					}
					if(indexes.length > 0)
					{
						var tempElement = tempObject[elementName];
						if(!isArray(tempElement))
						{
							tempElement = [];
							tempObject[elementName] = tempElement;
						}
						tempObject = tempElement;
						for(var j in indexes)
						{
							var index = indexes[j];
							var lastIndex = (j == indexes.length - 1);
							if(!lastIndex)
							{
								var tempElement = tempObject[index];
								if(!isArray(tempElement))
								{
									tempElement = [];
									tempObject[index] = tempElement;
								}
								tempObject = tempElement;
							}
							else
							{
								var tempElement = null;
								if(index >= 0)
								{
									if(lastElement)
									{
										tempElement = field.value
										tempObject[index] = tempElement;
									}
									else if(isSet(tempObject[index]))
									{
										tempElement = tempObject[index];
									}
									else
									{
										tempElement = {};
										tempObject[index] = tempElement;
									}
								}
								else
								{
									tempElement = lastElement ? field.value : {};
									tempObject.push(tempElement);
								}
								tempObject = tempElement;
							}
						}
					}
					else
					{
						if(!lastElement)
						{
							var tempElement = tempObject[elementName];
							if(!isObject(tempElement))
							{
								tempElement = {};
								tempObject[elementName] = tempElement;
							}
							tempObject = tempElement;
						}
						else
						{
							tempObject[elementName] = field.value;
						}
					}
				}
			}
		}
	});
	if(valid)
	{
		return request;
	}
	else
	{
		if(isDebug())
		{
			var i = fields.length;
			while(i--)
			{
				if(fields[i].valid)
				{
					fields.splice(i, 1);
				}
				else
				{
					delete fields[i].element;
				}
			}
			var group = "INVALID" + (isValidString(service) && isValidString(method) ? " : " + service + " / " + method : "");
			var log = "\n\n" + JSON.stringify(fields, null, 4) + "\n\n";
			console.groupCollapsed(group);
			console.log(log);
			console.groupEnd();
		}
		return null;
	}
};


roth.lib.js.web.View.prototype.update = function(element)
{
	var self = this;
	element = this.wrap(element);
	var field = this.validate(element);
	if(field.valid && field.name)
	{
		var updateValue = element.attr(this.config.attr.updateValue);
		if(field.value != updateValue)
		{
			var request = this.hash.cloneParam();
			request.name = field.name;
			request.value = field.value;
			this.submit(element, request, function()
			{
				element.attr(self.config.attr.updateValue, field.value);
			},
			function()
			{
				element.val(element.attr(self.config.attr.updateValue));
			},
			function()
			{
				
			});
		}
	}
};


roth.lib.js.web.View.prototype.submit = function(element, request, success, error, complete)
{
	var self = this;
	element = this.wrap(element);
	var disable = element.attr(this.config.attr.disable);
	var submitGroup = element.attr(this.config.attr.submitGroup);
	var prerequest = element.attr(this.config.attr.prerequest);
	var presubmit = element.attr(this.config.attr.presubmit);
	var service = element.attr(this.config.attr.service);
	var method = element.attr(this.config.attr.method);
	var successAttr = element.attr(this.config.attr.success);
	var errorAttr = element.attr(this.config.attr.error);
	var completeAttr = element.attr(this.config.attr.complete);
	var disabler = this.register.disabler[disable];
	submitGroup = isValidString(submitGroup) ? submitGroup : method;
	var groupElement = $("[" + this.config.attr.group + "='" + submitGroup + "']");
	var scope =
	{
		data : this.data,
		config : this.config,
		register : this.register,
		hash : this.hash,
		text : this.text,
		layout : this.layout,
		page : this.page,
		context : this.context,
		node : element[0],
		element : element,
		groupElement : groupElement
	};
	if(!isFunction(disabler))
	{
		disabler = this.register.disabler._default;
	}
	if(isFunction(disabler))
	{
		disabler(element, true);
	}
	if(isValidString(prerequest))
	{
		if(this.eval("return " + prerequest, scope) === false)
		{
			if(isFunction(disabler))
			{
				disabler(element, false);
			}
			return;
		}
	}
	if(!isObject(request))
	{
		request = this.request(groupElement, service, method);
	}
	if(isObject(request))
	{
		$.extend(true, request, ObjectUtil.parse(element.attr(this.config.attr.request)));
		scope.request = request;
		if(isValidString(presubmit))
		{
			if(this.eval("return " + presubmit, scope) === false)
			{
				if(isFunction(disabler))
				{
					disabler(element, false);
				}
				return;
			}
		}
		if(isValidString(service) && isValidString(method))
		{
			this.service(service, method, request, function(data)
			{
				scope.data = data;
				if(isFunction(disabler))
				{
					disabler(element, false);
				}
				if(isFunction(success))
				{
					success(data, request, element);
				}
				if(isValidString(successAttr))
				{
					self.eval(successAttr, scope);
				}
			},
			function(errors)
			{
				scope.errors = errors;
				if(isFunction(disabler))
				{
					disabler(element, false);
				}
				if(isFunction(error))
				{
					error(errors, request, element);
				}
				if(isValidString(errorAttr))
				{
					self.eval(errorAttr, scope);
				}
			},
			function()
			{
				if(isFunction(complete))
				{
					complete();
				}
				if(isValidString(completeAttr))
				{
					self.eval(completeAttr, scope);
				}
			},
			submitGroup);
		}
	}
	else
	{
		if(isFunction(disabler))
		{
			disabler(element, false);
		}
	}
};


roth.lib.js.web.View.prototype.wrap = function(element, selector)
{
	if(isSet(element))
	{
		if(element instanceof jQuery)
		{
			return element;
		}
		else if(element.nodeType)
		{
			return $(element);
		}
		else if(isString(element))
		{
			if(isString(selector))
			{
				return $(selector.replace("{name}", element));
			}
			else
			{
				return $(element);
			}
		}
		else
		{
			return $();
		}
	}
	else
	{
		return $();
	}
};


roth.lib.js.web.View.prototype.filter = function(element)
{
	var self = this;
	element = this.wrap(element);
	var field = {};
	field.element = element;
	field.name = element.attr(this.config.attr.radioGroup);
	field.value = null;
	field.formValue = null;
	field.tag = element.prop("tagName").toLowerCase();
	field.type = null;
	field.filter = element.attr(this.config.attr.filter);
	if(field.name)
	{
		field.formValue = element.find("input[type=radio][name='" + field.name + "']:include:checked").val();
		field.value = field.formValue;
	}
	else
	{
		field.name = element.attr("name");
		field.type = element.attr("type");
		if(field.type == "checkbox")
		{
			var value = element.attr("value");
			if(isSet(value))
			{
				field.value = element.is(":checked") ? value : null;
			}
			else
			{
				field.value = element.is(":checked");
			}
		}
		else if(field.type == "file")
		{
			field.value = element.attr(this.config.attr.fileValue);
		}
		else
		{
			field.formValue = element.val();
			field.value = field.formValue;
			if(isValidString(field.value))
			{
				field.value = field.value;
				if(isValidString(field.filter))
				{
					var scope =
					{
						data : this.data,
						config : this.config,
						register : this.register,
						hash : this.hash,
						text : this.text,
						layout : this.layout,
						page : this.page,
						context : this.context,
						node : element[0],
						element : element,
						field : field,
						value : field.value
					};
					for(var name in this.register.filterer)
					{
						scope[name] = this.register.filterer[name];
					}
					field.value = this.eval("return " + field.filter, scope);
				}
			}
		}
	}
	return field;
};


roth.lib.js.web.View.prototype.validateGroup = function(element)
{
	var self = this;
	var validGroup = true;
	this.groupElements(element).each(function()
	{
		var field = self.validate($(this));
		if(!field.valid)
		{
			validGroup = false;
		}
	});
	return validGroup;
};


roth.lib.js.web.View.prototype.validate = function(element)
{
	var self = this;
	element = this.wrap(element);
	var field = this.filter(element);
	field.visible = element.is(":visible");
	field.required =  StringUtil.equals(element.attr(this.config.attr.required), "true");
	field.defined = !isEmpty(field.value);
	field.valid = !(field.required && !field.defined) ? true : false;
	field.validate = element.attr(this.config.attr.validate);
	if(field.visible && (field.required || field.defined))
	{
		if(isValidString(field.validate))
		{
			var scope =
			{
				data : this.data,
				config : this.config,
				register : this.register,
				hash : this.hash,
				text : this.text,
				layout : this.layout,
				page : this.page,
				context : this.context,
				node : element[0],
				element : element,
				field : field,
				value : field.value
			};
			for(var name in this.register.validator)
			{
				scope[name] = this.register.validator[name];
			}
			field.valid = this.eval("return " + field.validate, scope);
		}
	}
	this.feedback(element, field);
	return field;
};


roth.lib.js.web.View.prototype.file = function(element, callback)
{
	var self = this;
	element = this.wrap(element);
	var files = element[0].files;
	if(files.length > 0)
	{
		var file = files[0];
		if(file)
		{
			var reader  = new FileReader();
			reader.onload = function(event)
			{
				element.attr(self.config.attr.fileValue, reader.result);
				if(isFunction(callback))
				{
					callback(reader.result);
				}
			};
			reader.readAsDataURL(file);
		}
	}
};


roth.lib.js.web.View.prototype.feedback = function(element, field)
{
	var self = this;
	element = this.wrap(element);
	var module = this.hash.getModule();
	var page = this.hash.getPage();
	var feedback = element.attr(this.config.attr.feedback);
	var feedbacker = this.register.feedbacker[feedback];
	if(!isFunction(feedbacker))
	{
		 feedbacker = this.register.feedbacker._default;
	}
	if(isFunction(feedbacker))
	{
		feedbacker(element, field);
	}
};


roth.lib.js.web.View.prototype.resetGroups = function()
{
	this.resetGroupsValidation();
	this.resetGroupsValue();
};


roth.lib.js.web.View.prototype.resetGroup = function(element)
{
	this.resetGroupValidation(element);
	this.resetGroupValue(element);
};


roth.lib.js.web.View.prototype.reset = function(element)
{
	this.resetValidation(element);
	this.resetValue(element);
};


roth.lib.js.web.View.prototype.resetGroupsValidation = function()
{
	var self = this;
	$("[" + this.config.attr.group + "]").each(function()
	{
		self.resetGroupValidation($(this));
	});
};


roth.lib.js.web.View.prototype.resetGroupValidation = function(element)
{
	var self = this;
	element = this.wrap(element, "[" + this.config.attr.group + "='{name}']");
	this.groupElements(element, false).each(function()
	{
		self.resetValidation($(this));
	});
};


roth.lib.js.web.View.prototype.resetValidation = function(element)
{
	this.feedback(element);
};


roth.lib.js.web.View.prototype.resetGroupsValue = function()
{
	var self = this;
	$("[" + this.config.attr.group + "]").each(function()
	{
		self.resetGroupValue($(this));
	});
};


roth.lib.js.web.View.prototype.resetGroupValue = function(element)
{
	var self = this;
	element = this.wrap(element, "[" + this.config.attr.group + "='{name}']");
	this.groupElements(element, false).each(function()
	{
		self.resetValue($(this));
	});
	this.web._defaults(element);
};


roth.lib.js.web.View.prototype.resetValue = function(element)
{
	this.feedback(element);
	var tag = element.prop("tagName").toLowerCase();
	var type = element.attr("type");
	element.val("");
	if(type == "file")
	{
		element.attr(this.config.attr.fileValue, "");
	}
};


roth.lib.js.web.View.prototype.key = function(event, key)
{
	var keyCode = event.which || event.keyCode;
	return (keyCode == key);
};


roth.lib.js.web.View.prototype.enter = function(event)
{
	return this.key(event, 13);
};


roth.lib.js.web.View.prototype.escape = function(event)
{
	return this.key(event, 27);
};


roth.lib.js.web.View.prototype.backspace = function(event)
{
	return this.key(event, 8);
};


roth.lib.js.web.View.prototype.enterSubmit = function(event)
{
	var self = this;
	if(this.enter(event))
	{
		var element = $(event.target);
		var groupElement = element.closest("[" + self.config.attr.group + "]");
		if(groupElement.length > 0)
		{
			var group = groupElement.attr(self.config.attr.group);
			if(isSet(group))
			{
				var submitElement = groupElement.find("[" + self.config.attr.submitGroup + "='" + group + "'], [" + self.config.attr.method + "='" + group + "']");
				if(submitElement.length > 0)
				{
					self.submit(submitElement);
				}
			}
		}
	}
};
