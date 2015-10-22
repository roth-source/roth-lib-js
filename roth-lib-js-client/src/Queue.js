
roth.lib.js.client.Queue = roth.lib.js.client.Queue || function()
{
	var Event =
	{
		ENDPOINTS		: "endpoints",
		INIT			: "init",
		TEXT			: "text",
		LAYOUT			: "layout",
		PAGE			: "page",
		SECTIONS		: "sections",
		SECTION			: "section",
		COMPONENTS		: "components",
		COMPONENT		: "component",
		TRANSLATION		: "translation",
		FIELDS			: "fields",
		READY			: "ready",
		SHOW			: "show",
		CALLBACK		: "callback"
	};
	
	var Order = {};
	Order[Event.ENDPOINTS] 		= [];
	Order[Event.TEXT] 			= [];
	Order[Event.INIT] 			= [Event.ENDPOINTS];
	Order[Event.LAYOUT] 		= [Event.TEXT, Event.INIT];
	Order[Event.PAGE] 			= [Event.LAYOUT];
	Order[Event.SECTIONS] 		= [Event.PAGE];
	Order[Event.SECTION] 		= [Event.SECTIONS];
	Order[Event.COMPONENTS] 	= [Event.PAGE];
	Order[Event.COMPONENT] 		= [Event.COMPONENTS];
	Order[Event.TRANSLATION] 	= [Event.SECTION, Event.COMPONENT, Event.TEXT];
	Order[Event.FIELDS] 		= [Event.TRANSLATION];
	Order[Event.READY] 			= [Event.INIT, Event.FIELDS];
	Order[Event.SHOW] 			= [Event.READY];
	Order[Event.CALLBACK] 		= [Event.SHOW];
	
	this.task = {};
	
	this.endpoints = function(id, callback)
	{
		this.add(id, Event.ENDPOINTS, callback);
	};
	
	this.init = function(id, callback)
	{
		this.add(id, Event.INIT, callback);
	};
	
	this.text = function(id, callback)
	{
		this.add(id, Event.TEXT, callback);
	};
	
	this.layout = function(id, callback)
	{
		this.add(id, Event.LAYOUT, callback);
	};
	
	this.page = function(id, callback)
	{
		this.add(id, Event.PAGE, callback);
	};
	
	this.sections = function(id, callback)
	{
		this.add(id, Event.SECTIONS, callback);
	};
	
	this.section = function(id, callback)
	{
		this.add(id, Event.SECTION, callback);
	};
	
	this.components = function(id, callback)
	{
		this.add(id, Event.COMPONENTS, callback);
	};
	
	this.component = function(id, callback)
	{
		this.add(id, Event.COMPONENT, callback);
	};
	
	this.translation = function(id, callback)
	{
		this.add(id, Event.TRANSLATION, callback);
	};
	
	this.fields = function(id, callback)
	{
		this.add(id, Event.FIELDS, callback);
	};
	
	this.ready = function(id, callback)
	{
		this.add(id, Event.READY, callback);
	};
	
	this.show = function(id, callback)
	{
		this.add(id, Event.SHOW, callback);
	};
	
	this.callback = function(id, callback)
	{
		this.add(id, Event.CALLBACK, callback);
	};
	
	this.add = function(id, event, callback)
	{
		if(isFunction(callback))
		{
			this.task[id] =
			{
				event 		: event,
				callback 	: callback,
				started 	: false
			};
		}
	};
	
	this.complete = function(id)
	{
		if(isSet(id))
		{
			if(isSet(this.task[id]))
			{
				//console.log(id + " - completing " + this.task[id].event);
				delete this.task[id];
			}
			this.execute();
		}
	};
	
	this.execute = function()
	{
		for(var id in this.task)
		{
			var task = this.task[id];
			if(isSet(task) && task.started == false)
			{
				if(this.isTaskReady(task))
				{
					//console.log(id + " -   starting " + task.event);
					task.started = true;
					task.callback();
				}
			}
		}
	};
	
	this.isTaskReady = function(task)
	{
		for(var id in this.task)
		{
			if(this.hasEvent(this.task[id].event, Order[task.event]))
			{
				return false;
			}
		}
		return true;
	};
	
	this.hasEvent = function(event, order)
	{
		if(isSet(order) && order.length > 0)
		{
			if(order.indexOf(event) != -1)
			{
				return true;
			}
			for(var i in order)
			{
				if(this.hasEvent(event, Order[order[i]]))
				{
					return true;
				}
			}
		}
		return false;
	};
	
	this.stop = function()
	{
		this.task = {};
	};
	
};



