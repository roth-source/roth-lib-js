
roth.lib.js.client.Queue = roth.lib.js.client.Queue || function()
{
	var Event =
	{
		LOAD_ENDPOINTS		: "loadEndpoints",
		LOAD_INITIALIZER	: "loadInitializer",
		LOAD_TEXT			: "loadText",
		LOAD_LAYOUT			: "loadLayout",
		LOAD_PAGE			: "loadPage",
		LOAD_SECTIONS		: "loadSections",
		LOAD_SECTION		: "loadSection",
		LOAD_COMPONENTS		: "loadComponents",
		LOAD_COMPONENT		: "loadComponent",
		INIT_TEXT			: "initText",
		INIT_HANDLERS		: "initHandlers",
		INIT_LAYOUT			: "initLayout",
		INIT_PAGE			: "initPage",
		SHOW_VIEW			: "showView"
	};
	
	var Order = {};
	Order[Event.LOAD_ENDPOINTS] 	= [];
	Order[Event.LOAD_TEXT] 			= [];
	Order[Event.LOAD_INITIALIZER] 	= [Event.LOAD_ENDPOINTS];
	Order[Event.LOAD_LAYOUT] 		= [Event.LOAD_TEXT, Event.LOAD_INITIALIZER];
	Order[Event.LOAD_PAGE] 			= [Event.LOAD_LAYOUT];
	Order[Event.LOAD_SECTIONS] 		= [Event.LOAD_PAGE];
	Order[Event.LOAD_SECTION] 		= [Event.LOAD_SECTIONS];
	Order[Event.LOAD_COMPONENTS] 	= [Event.LOAD_PAGE];
	Order[Event.LOAD_COMPONENT] 	= [Event.LOAD_COMPONENTS];
	Order[Event.INIT_TEXT] 			= [Event.LOAD_SECTION, Event.LOAD_COMPONENT, Event.LOAD_TEXT];
	Order[Event.INIT_HANDLERS] 		= [Event.INIT_TEXT];
	Order[Event.INIT_LAYOUT] 		= [Event.LOAD_INITIALIZER, Event.INIT_HANDLERS];
	Order[Event.INIT_PAGE] 			= [Event.LOAD_INITIALIZER, Event.INIT_HANDLERS];
	Order[Event.SHOW_VIEW] 			= [Event.INIT_LAYOUT, Event.INIT_PAGE];
	
	this.task = {};
	
	this.loadEndpoints = function(id, callback)
	{
		this.add(id, Event.LOAD_ENDPOINTS, callback);
	};
	
	this.loadInitializer = function(id, callback)
	{
		this.add(id, Event.LOAD_INITIALIZER, callback);
	};
	
	this.loadText = function(id, callback)
	{
		this.add(id, Event.LOAD_TEXT, callback);
	};
	
	this.loadLayout = function(id, callback)
	{
		this.add(id, Event.LOAD_LAYOUT, callback);
	};
	
	this.loadPage = function(id, callback)
	{
		this.add(id, Event.LOAD_PAGE, callback);
	};
	
	this.loadSections = function(id, callback)
	{
		this.add(id, Event.LOAD_SECTIONS, callback);
	};
	
	this.loadSection = function(id, callback)
	{
		this.add(id, Event.LOAD_SECTION, callback);
	};
	
	this.loadComponents = function(id, callback)
	{
		this.add(id, Event.LOAD_COMPONENTS, callback);
	};
	
	this.loadComponent = function(id, callback)
	{
		this.add(id, Event.LOAD_COMPONENT, callback);
	};
	
	this.initText = function(id, callback)
	{
		this.add(id, Event.INIT_TEXT, callback);
	};
	
	this.initHandlers = function(id, callback)
	{
		this.add(id, Event.INIT_HANDLERS, callback);
	};
	
	this.initLayout = function(id, callback)
	{
		this.add(id, Event.INIT_LAYOUT, callback);
	};
	
	this.initPage = function(id, callback)
	{
		this.add(id, Event.INIT_PAGE, callback);
	};
	
	this.showView = function(id, callback)
	{
		this.add(id, Event.SHOW_VIEW, callback);
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
		if(isSet(this.task[id]))
		{
			//console.log(id + " - completing " + this.task[id].event);
			delete this.task[id];
		}
		this.execute();
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
	
};
