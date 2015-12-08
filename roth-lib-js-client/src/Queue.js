

/**
 * @class
 */
roth.lib.js.client.Queue = roth.lib.js.client.Queue || function()
{
	/**
	 * @lends Queue.prototype
	 */
	
	var Event =
	{
		CONFIG			: "config",
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
	Order[Event.CONFIG] 		= [];
	Order[Event.TEXT] 			= [Event.CONFIG];
	Order[Event.INIT] 			= [Event.CONFIG];
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
	
	/**
	 * the task queue holding callbacks of certain event types
	 * @member {Object}
	 */
	this.task = {};
	
	/**
	 * queues config event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.config = function(callback)
	{
		return this.add(Event.CONFIG, callback);
	};
	
	/**
	 * queues init event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.init = function(callback)
	{
		return this.add(Event.INIT, callback);
	};
	
	/**
	 * queues text event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.text = function(callback)
	{
		return this.add(Event.TEXT, callback);
	};
	
	/**
	 * queues layout event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.layout = function(callback)
	{
		return this.add(Event.LAYOUT, callback);
	};
	
	/**
	 * queues page event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.page = function(callback)
	{
		return this.add(Event.PAGE, callback);
	};
	
	/**
	 * queues sections event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.sections = function(callback)
	{
		return this.add(Event.SECTIONS, callback);
	};
	
	/**
	 * queues section event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.section = function(callback)
	{
		return this.add(Event.SECTION, callback);
	};
	
	/**
	 * queues components event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.components = function(callback)
	{
		return this.add(Event.COMPONENTS, callback);
	};
	
	/**
	 * queues component event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.component = function(callback)
	{
		return this.add(Event.COMPONENT, callback);
	};
	
	/**
	 * queues translation event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.translation = function(callback)
	{
		return this.add(Event.TRANSLATION, callback);
	};
	
	/**
	 * queues fields event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.fields = function(callback)
	{
		return this.add(Event.FIELDS, callback);
	};
	
	/**
	 * queues ready event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.ready = function(callback)
	{
		return this.add(Event.READY, callback);
	};
	
	/**
	 * queues show event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.show = function(callback)
	{
		return this.add(Event.SHOW, callback);
	};
	
	/**
	 * queues callback event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.callback = function(callback)
	{
		return this.add(Event.CALLBACK, callback);
	};
	
	/**
	 * queues the event callback
	 * @method
	 * @param {String} event
	 * @param {Function} callback
	 * @returns {String}
	 */
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
	
	/**
	 * completes the task and runs execute
	 * @method
	 * @param {String} id
	 */
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
	
	/**
	 * executes the next available task
	 * @method
	 */
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
	
	/**
	 * checks if task is ready for execution
	 * @method
	 * @param {Object} task
	 * @returns {Boolean}
	 */
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
	
	/**
	 * checks if the event is in the order list
	 * @method
	 * @param {String} event
	 * @param {String} order
	 * @returns {Boolean}
	 */
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
	
	/**
	 * clears the task object to stop execution
	 * @method
	 */
	this.stop = function()
	{
		this.task = {};
	};
	
};



