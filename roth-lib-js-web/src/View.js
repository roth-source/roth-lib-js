

roth.lib.js.web.View = roth.lib.js.web.View || (function()
{
	
	var View = function()
	{
		
	};
	
	
	View.prototype._init = function(web)
	{
		this._references(web);
		if(isFunction(this.init))
		{
			return this.init();
		}
	};
	
	
	View.prototype._references = function(web)
	{
		this.web = web;
		this.config = web.config;
		this.handler = web.handler;
		this.template = web.template;
		this.register = web.register;
		this.hash = web.hash;
		this.text = web.text;
		this.layout = web.layout;
		this.page = web.page;
		this.context = web.context;
	};
	
	
	View.prototype._change = function(changeParam)
	{
		var self = this;
		if(!isObject(changeParam))
		{
			changeParam = this.hash.changeParam;
		}
		if(isFunction(this.change))
		{
			this.change(changeParam);
		}
		forEach(this._components, function(component)
		{
			component._change(changeParam);
		});
	};
	
	
	View.prototype._ready = function()
	{
		var self = this;
		if(isFunction(this.ready) && !isTrue(this._readied))
		{
			this.ready();
			this._readied = true;
		}
		forEach(this._components, function(component)
		{
			component._ready();
		});
	};
	
	
	View.prototype._visible = function()
	{
		var self = this;
		if(isFunction(this.visible) && isSet(this.element) && !isTrue(this._visibled) && this.element.is(":visible"))
		{
			this.visible();
			this._visibled = true;
		}
		forEach(this._components, function(component)
		{
			component._visible();
		});
	};
	
	
	View.prototype.appendComponentInit = function(element, componentName, service, method, request, data, callback)
	{
		this.loadComponentInit(element, componentName, service, method, request, data, callback, true);
	};
	
	
	View.prototype.loadComponentInit = function(element, componentName, service, method, request, data, callback, append)
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
				var serviceRequest = this.hash.cloneParam();
				$.extend(true, serviceRequest, request, ObjectUtil.parse(element.attr(this.config.attr.request)));
				var success = function(response)
				{
					data = isObject(data) ? data : {};
					$.extend(true, data, response);
					self.loadComponent(element, componentName, data, callback, append);
				};
				var error = function(errors)
				{
					self.loadComponent(element, componentName, data, callback, append);
				};
				var complete = function()
				{
					
				};
				this.service(service, method, serviceRequest, success, error, complete);
			}
			else
			{
				this.loadComponent(element, componentName, data, callback, append);
			}
		}
		else
		{
			console.error("element not found");
		}
	};
	
	
	View.prototype.appendComponent = function(element, componentName, data, callback)
	{
		this.loadComponent(element, componentName, data, callback, true);
	};
	
	
	View.prototype.loadComponent = function(element, componentName, data, callback, append)
	{
		var component = null;
		element = this.wrap(element);
		if(element.length > 0)
		{
			var module = this.hash.getModule();
			var componentConstructor = this.register.getComponentConstructor(module, componentName);
			if(isFunction(componentConstructor))
			{
				if(!isObject(data))
				{
					data = {};
				}
				var componentConfig = isObject(componentConstructor.config) ? componentConstructor.config : {};
				component = this.register.constructView(componentConstructor, data, this.web);
				if(isSet(component))
				{
					component.element = element;
					component.parent = this;
					if(!isArray(this._components))
					{
						this._components = [];
					}
					this._components.push(component);
					this.web._loadComponent(component, true, null, append);
					component._ready();
					component._change();
					component.element.show();
					component._visible();
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


	View.prototype.service = function(service, method, request, success, error, complete, group)
	{
		this.web.service(service, method, request, success, error, complete, group, this);
	};


	View.prototype.eval = function(code, scope)
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


	View.prototype.groupElements = function(element, active)
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


	View.prototype.request = function(element, feedback, service, method, requestError, scope)
	{
		var self = this;
		var elementRegExp = new RegExp("^(\\w+)(?:\\[|$)");
		var indexRegExp = new RegExp("\\[(\\d+)?\\]", "g");
		var valid = true;
		var request = this.hash.cloneParam();
		var fields = [];
		this.groupElements(element).each(function()
		{
			var field = self.validate($(this), feedback);
			if(!field.valid)
			{
				valid = false;
			}
			if(isDebug())
			{
				fields.push(field);
			}
			if(valid && isValidString(field.name)) // && isValid(field.value))
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
			if(isValidString(requestError))
			{
				if(isObject(scope))
				{
					scope.fields = fields;
				}
				this.eval(requestError, scope)
			}
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


	View.prototype.update = function(element)
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


	View.prototype.submit = function(element, request, success, error, complete)
	{
		var self = this;
		element = this.wrap(element);
		var disable = element.attr(this.config.attr.disable);
		var submitGroup = element.attr(this.config.attr.submitGroup);
		var prerequest = element.attr(this.config.attr.prerequest);
		var requestError = element.attr(this.config.attr.requestError);
		var presubmit = element.attr(this.config.attr.presubmit);
		var service = element.attr(this.config.attr.service);
		var method = element.attr(this.config.attr.method);
		var successAttr = element.attr(this.config.attr.success);
		var errorAttr = element.attr(this.config.attr.error);
		var completeAttr = element.attr(this.config.attr.complete);
		var disabler = this.handler.disabler[disable];
		submitGroup = isValidString(submitGroup) ? submitGroup : method;
		var groupElement = $("[" + this.config.attr.group + "='" + submitGroup + "']");
		var scope =
		{
			data : this.data,
			config : this.config,
			handler : this.handler,
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
			disabler = this.handler.disabler._default;
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
			request = this.request(groupElement, true, service, method, requestError, scope);
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
					var enable = true;
					if(isFunction(success))
					{
						success(data, request, element);
					}
					if(isValidString(successAttr))
					{
						enable = self.eval(successAttr, scope);
					}
					if(isFunction(disabler) && !isFalse(enable))
					{
						disabler(element, false);
					}
				},
				function(errors)
				{
					scope.errors = errors;
					if(isFunction(error))
					{
						error(errors, request, element);
					}
					if(isValidString(errorAttr))
					{
						self.eval(errorAttr, scope);
					}
					if(isFunction(disabler))
					{
						disabler(element, false);
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


	View.prototype.wrap = function(element, selector)
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


	View.prototype.filter = function(element)
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
							handler : this.handler,
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
						for(var name in this.handler.filterer)
						{
							scope[name] = this.handler.filterer[name];
						}
						field.value = this.eval("return " + field.filter, scope);
					}
				}
				else if(isArray(field.value))
				{
					var i = field.value.length;
					while(i--)
					{
						if(!isValidString(field.value[i]))
						{
							field.value.splice(i, 1);
						}
					}
				}
			}
		}
		if(!isValid(field.value))
		{
			field.value = null;
		}
		return field;
	};


	View.prototype.validateGroup = function(element, feedback)
	{
		var self = this;
		var validGroup = true;
		this.groupElements(element).each(function()
		{
			var field = self.validate($(this), feedback);
			if(!field.valid)
			{
				validGroup = false;
			}
		});
		return validGroup;
	};


	View.prototype.validate = function(element, feedback)
	{
		var self = this;
		element = this.wrap(element);
		var field = this.filter(element);
		field.visible = element.is(":visible");
		field.include = field.visible || isTrue(element.attr(this.config.attr.include));
		field.required =  isTrue(element.attr(this.config.attr.required));
		field.defined = !isEmpty(field.value);
		field.valid = !(field.required && !field.defined) ? true : false;
		field.validate = element.attr(this.config.attr.validate);
		if(field.include && field.valid && field.defined)
		{
			if(isValidString(field.validate))
			{
				var scope =
				{
					data : this.data,
					config : this.config,
					handler : this.handler,
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
				for(var name in this.handler.validator)
				{
					scope[name] = this.handler.validator[name];
				}
				field.valid = this.eval("return " + field.validate, scope);
			}
		}
		if(!isFalse(feedback))
		{
			this.feedback(element, field);
		}
		return field;
	};


	View.prototype.file = function(element, callback)
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


	View.prototype.feedback = function(element, field)
	{
		var self = this;
		element = this.wrap(element);
		var module = this.hash.getModule();
		var page = this.hash.getPage();
		var feedback = element.attr(this.config.attr.feedback);
		var feedbacker = this.handler.feedbacker[feedback];
		if(!isFunction(feedbacker))
		{
			 feedbacker = this.handler.feedbacker._default;
		}
		if(isFunction(feedbacker))
		{
			feedbacker(element, field);
		}
	};


	View.prototype.resetGroups = function()
	{
		this.resetGroupsValidation();
		this.resetGroupsValue();
	};


	View.prototype.resetGroup = function(element)
	{
		this.resetGroupValidation(element);
		this.resetGroupValue(element);
	};


	View.prototype.reset = function(element)
	{
		this.resetValidation(element);
		this.resetValue(element);
	};


	View.prototype.resetGroupsValidation = function()
	{
		var self = this;
		$("[" + this.config.attr.group + "]").each(function()
		{
			self.resetGroupValidation($(this));
		});
	};


	View.prototype.resetGroupValidation = function(element)
	{
		var self = this;
		element = this.wrap(element, "[" + this.config.attr.group + "='{name}']");
		this.groupElements(element, false).each(function()
		{
			self.resetValidation($(this));
		});
	};


	View.prototype.resetValidation = function(element)
	{
		this.feedback(element);
	};


	View.prototype.resetGroupsValue = function()
	{
		var self = this;
		$("[" + this.config.attr.group + "]").each(function()
		{
			self.resetGroupValue($(this));
		});
	};


	View.prototype.resetGroupValue = function(element)
	{
		var self = this;
		element = this.wrap(element, "[" + this.config.attr.group + "='{name}']");
		this.groupElements(element, false).each(function()
		{
			self.resetValue($(this));
		});
		this.web._defaults(element);
	};


	View.prototype.resetValue = function(element)
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


	View.prototype.key = function(event, key)
	{
		var keyCode = event.which || event.keyCode;
		return (keyCode == key);
	};


	View.prototype.enter = function(event)
	{
		return this.key(event, 13);
	};


	View.prototype.escape = function(event)
	{
		return this.key(event, 27);
	};


	View.prototype.backspace = function(event)
	{
		return this.key(event, 8);
	};


	View.prototype.enterSubmit = function(event)
	{
		var self = this;
		if(this.enter(event))
		{
			var element = $(event.target);
			element.blur();
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
	
	return View;
	 
})();



