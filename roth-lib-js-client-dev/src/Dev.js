
roth.lib.js.client.dev.Dev = roth.lib.js.client.dev.Dev || function(config)
{
	var self = this;
	var template = new roth.lib.js.template.Template();
	
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
			path : config.getDevLayoutPath(),
			renderer : "devRenderer",
			cache : false
		};
		config.module[config.devModule] =
		{
			layout : config.devLayout,
			renderer : "devRenderer",
			cache : false,
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
	
	this.select = function(context, values, callback)
	{
		var id = "dev-modal-" + IdUtil.generate();
		var value = sessionStorage.getItem(context);
		if(!isTrue(value))
		{
			$.ajax(
			{
				type		: "GET",
				url			: config.getDevSelectPath(),
				dataType	: "html",
				crossDomain	: true,
				success		: function(html)
				{
					html = template.render(html, { id : id, context : context, values : values});
					$("body").append(html);
					var modal = $("#" + id);
					modal.modal(
					{
						backdrop : "static",
						keyboard : false,
						show : true
					});
					$("#" + id + "-once").click(function()
					{
						var value = modal.find("input[type='radio'][name='response']:checked").val();
						if(!isSet(value))
						{
							value = modal.find("input[type='radio'][name='response']").first().val();
						}
						modal.modal("hide").remove();
						callback(value);
					});
					$("#" + id + "-session").click(function()
					{
						var value = modal.find("input[type='radio'][name='response']:checked").val();
						if(!isSet(value))
						{
							value = modal.find("input[type='radio'][name='response']").first().val();
						}
						modal.modal("hide").remove();
						sessionStorage.setItem(context, value);
						callback(value);
					});
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



