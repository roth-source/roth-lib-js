

/**
 * @class
 */
roth.lib.js.client.dev.Dev = roth.lib.js.client.dev.Dev || function(config)
{
	/**
	 * @lends Dev.prototype
	 */
	
	var self = this;
	var template = new roth.lib.js.template.Template();
	var selects = $('<div class="roth-dev-selects"></div>');
	selects.appendTo("body");
	
	(function()
	{
		var devRenderer = function(html)
		{
			return template.render(html, { config : config });
		};
		config.renderer.devRenderer = devRenderer;
		config.layout = isSet(config.layout) ? config.layout : {};
		config.layout[config.devLayout] =
		{
			init : false,
			path : config.getDevLayoutPath(),
			renderer : "devRenderer"
		};
		config.module[config.devModule] =
		{
			init : false,
			layout : config.devLayout,
			renderer : "devRenderer",
			page : {}
		};
		config.module[config.devModule].page[config.devLinksPage] =
		{
			path : config.getDevLinksPath()
		};
		config.module[config.devModule].page[config.devServicesPage] =
		{
			path : config.getDevServicesPath()
		};
		config.module[config.devModule].page[config.devConfigPage] =
		{
			path : config.getDevConfigPath()
		};
	})
	();
	
	/**
	 * Asks mock developer to select from a list of options.
	 * @method
	 * @param {String} context
	 * @param {Array} values
	 * @param {Function} callback
	 */
	this.select = function(context, values, callback)
	{
		var value = sessionStorage.getItem(context);
		if(!value)
		{
			$.ajax(
			{
				type		: "GET",
				url			: config.getDevSelectPath(),
				dataType	: "html",
				crossDomain	: true,
				success		: function(html)
				{
					var id = IdUtil.generate();
					var select = $(template.render(html, { id : id, context : context, values : values}));
					select.find("#" + id + "-once").click(function()
					{
						var value = select.find("input[type='radio'][name='" + id + "-response']:checked").val();
						if(!isSet(value))
						{
							value = values[0];
						}
						select.remove();
						if(selects.children().length == 0)
						{
							selects.hide();
						}
						callback(value);
					});
					select.find("#" + id + "-session").click(function()
					{
						var value = select.find("input[type='radio'][name='" + id + "-response']:checked").val();
						if(!isSet(value))
						{
							value = values[0];
						}
						select.remove();
						if(selects.children().length == 0)
						{
							selects.hide();
						}
						sessionStorage.setItem(context, value);
						callback(value);
					});
					selects.append(select);
					selects.show();
				},
				error		: function(jqXHR, textStatus, errorThrown)
				{
					callback(values[0]);
				}
			});
		}
		else
		{
			callback(value);
		}
	};
	
};



