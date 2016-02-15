

roth.lib.js.client.Queue = roth.lib.js.client.Queue || function()
{
	
	
	var Event =
	{
		TEXT				: "text",
		LAYOUT_INIT			: "layoutInit",
		LAYOUT_RESOURCE		: "layoutResource",
		LAYOUT_COMPONENT	: "layoutComponent",
		LAYOUT_READY		: "layoutReady",
		PAGE_INIT			: "pageInit",
		PAGE_RESOURCE		: "pageResource",
		PAGE_COMPONENT		: "pageComponent",
		PAGE_READY			: "pageReady"
	};
	
	var Order = {};
	Order[Event.TEXT] 				= [];
	Order[Event.LAYOUT_INIT] 		= [];
	Order[Event.LAYOUT_RESOURCE] 	= [Event.TEXT, Event.LAYOUT_INIT];
	Order[Event.LAYOUT_COMPONENT] 	= [Event.LAYOUT_RESOURCE];
	Order[Event.LAYOUT_READY] 		= [Event.LAYOUT_COMPONENT];
	Order[Event.PAGE_INIT] 			= [];
	Order[Event.PAGE_RESOURCE] 		= [Event.TEXT, Event.LAYOUT_INIT, Event.PAGE_INIT];
	Order[Event.PAGE_COMPONENT] 	= [Event.PAGE_RESOURCE];
	Order[Event.PAGE_READY] 		= [Event.LAYOUT_READY, Event.PAGE_COMPONENT];
	
	
	this.task = {};
	
	
	this.text = function(callback)
	{
		return this.add(Event.TEXT, callback);
	};
	
	
	this.layoutInit = function(callback)
	{
		return this.add(Event.LAYOUT_INIT, callback);
	};
	
	
	this.layoutResource = function(callback)
	{
		return this.add(Event.LAYOUT_RESOURCE, callback);
	};
	
	
	this.layoutComponent = function(callback)
	{
		return this.add(Event.LAYOUT_COMPONENT, callback);
	};
	
	
	this.layoutReady = function(callback)
	{
		return this.add(Event.LAYOUT_READY, callback);
	};
	
	
	this.pageInit = function(callback)
	{
		return this.add(Event.PAGE_INIT, callback);
	};
	
	
	this.pageResource = function(callback)
	{
		return this.add(Event.PAGE_RESOURCE, callback);
	};
	
	
	this.pageComponent = function(callback)
	{
		return this.add(Event.PAGE_COMPONENT, callback);
	};
	
	
	this.pageReady = function(callback)
	{
		return this.add(Event.PAGE_READY, callback);
	};
	
	
	this.add = function(event, callback)
	{
		var id = IdUtil.generate();
		if(isFunction(callback))
		{
			this.task[id] =
			{
				event 		: event,
				callback 	: callback,
				started 	: false
			};
		}
		return id;
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



