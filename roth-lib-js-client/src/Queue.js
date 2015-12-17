

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
	
	/**
	 * the task queue holding callbacks of certain event types
	 * @member {Object}
	 */
	this.task = {};
	
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
	 * queues init event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.layoutInit = function(callback)
	{
		return this.add(Event.LAYOUT_INIT, callback);
	};
	
	/**
	 * queues layout event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.layoutResource = function(callback)
	{
		return this.add(Event.LAYOUT_RESOURCE, callback);
	};
	
	/**
	 * queues component event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.layoutComponent = function(callback)
	{
		return this.add(Event.LAYOUT_COMPONENT, callback);
	};
	
	/**
	 * queues ready event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.layoutReady = function(callback)
	{
		return this.add(Event.LAYOUT_READY, callback);
	};
	
	/**
	 * queues init event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.pageInit = function(callback)
	{
		return this.add(Event.PAGE_INIT, callback);
	};
	
	/**
	 * queues layout event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.pageResource = function(callback)
	{
		return this.add(Event.PAGE_RESOURCE, callback);
	};
	
	/**
	 * queues component event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.pageComponent = function(callback)
	{
		return this.add(Event.PAGE_COMPONENT, callback);
	};
	
	/**
	 * queues ready event callback
	 * @method
	 * @param {Function} callback
	 * @returns {String}
	 */
	this.pageReady = function(callback)
	{
		return this.add(Event.PAGE_READY, callback);
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



