

roth.lib.js.web.Dev = roth.lib.js.web.Dev || (function()
{
	
	var Dev = function()
	{
		var self = this;
		this.template = new roth.lib.js.template.Template();
		this.selectHtml = "<div id=\"{{ id }}-select\" class=\"roth-dev-select\"><div class=\"roth-dev-select-header\">{{ context }}</div><div class=\"roth-dev-select-body\"><div class=\"roth-dev-radio-button-group\">{% forEach(values, function(value, i, loop) { %}<label class=\"roth-dev-radio-button {{ loop.first ? \"roth-dev-radio-button-active\" : \"\" }}\" onclick=\"$(this).siblings().removeClass('roth-dev-radio-button-active');$(this).addClass('roth-dev-radio-button-active');\"><input class=\"roth-dev-radio-input\" name=\"{{ id }}-response\" value=\"{{ value }}\" type=\"radio\" autocomplete=\"off\" {{ loop.first ? \"checked\" : \"\" }} />{{ value }}</label>{% }); %}</div></div><div class=\"roth-dev-select-footer\"><button id=\"{{ id }}-once\" type=\"button\" class=\"roth-dev-button roth-dev-button-once\">Once</button><button id=\"{{ id }}-session\" type=\"button\" class=\"roth-dev-button roth-dev-button-session\">Session</button></div></div>";
		$('<style></style>').html(".roth-dev-selects{display:none;position:absolute;left:0;top:0;right:0;bottom:0;text-align:center;z-index:10000;background-color:rgba(0, 0, 0, 0.5);box-sizing:border-box;font-family:\"Helvetica Neue\",Helvetica,Arial,sans-serif;font-weight:700;font-size:14px;}.roth-dev-select{background-color:#fff;color:#4b4b4b;text-align:left;width:300px;margin:30px auto;padding:0;background-clip:padding-box;border:1px solid rgba(0, 0, 0, 0.2);border-radius:6px;outline:0 none;box-shadow:0 5px 15px rgba(0, 0, 0, 0.5);}.roth-dev-select-header{font-size:16px;padding:15px;border-bottom:1px solid #e5e5e5;}.roth-dev-select-body{max-height:300px;overflow-y:auto;padding:15px;}.roth-dev-select-footer{padding:15px;border-top: 1px solid #e5e5e5;text-align:right;}.roth-dev-radio-button-group{width:100%;display:inline-block;vertical-align:middle;}.roth-dev-radio-button{margin:-1px 0 0 0;padding:6px 12px;text-align:center;border:1px solid #dadada;display:block;width:100%;box-sizing:border-box;cursor:pointer;border-radius:0;position:relative;}.roth-dev-radio-button:hover{box-shadow:0 3px 5px rgba(0, 0, 0, 0.125) inset;background-color:#e6e6e6;border-color:#adadad;z-index:2;}.roth-dev-radio-button.roth-dev-radio-button-active{box-shadow:0 3px 5px rgba(0, 0, 0, 0.125) inset;background-color:#e6e6e6;border-color:#adadad;z-index:2;}.roth-dev-radio-button-group > .roth-dev-radio-button:first-child{border-radius:4px 4px 0 0;}.roth-dev-radio-button-group > .roth-dev-radio-button:last-child{border-radius:0 0 4px 4px;}.roth-dev-radio-input{position:absolute;clip:rect(0px, 0px, 0px, 0px);pointer-events:none;}.roth-dev-button{border-radius:1px;padding:6px 12px;margin:0 2px;cursor:pointer;display:inline-block;font-family:inherit;font-size:inherit;font-weight:inherit;color:#fff;border:1px solid transparent;}.roth-dev-button.roth-dev-button-once{background-color:#5bc0de;}.roth-dev-button.roth-dev-button-once:hover{background-color:#31b0d5;}.roth-dev-button.roth-dev-button-session{background-color:#47acc3;}.roth-dev-button.roth-dev-button-session:hover{background-color:#42a0b5;}").appendTo("head");
		this.selects = $("<div class=\"roth-dev-selects\"></div>");
		$(document).ready(function()
		{
			self.selects.appendTo("body");
		});
		
		this.service = (function()
		{
			var service = {};
			var url = "dev/service.json";
			var success = function(data)
			{
				service = data;
			};
			$.ajax(
			{
				url : url,
				dataType : "json",
				cache : false,
				async : false,
				success : success
			});
			return service;
		})
		();
		
	};
	
	
	Dev.prototype.getResponseScenarios = function(service, method)
	{
		var scenarios = [];
		if(isObject(this.service) && isObject(this.service[service]) && isObject(this.service[service][method]) && isArray(this.service[service][method].response))
		{
			scenarios = this.service[service][method].response;
		}
		return scenarios;
	};


	Dev.prototype.select = function(context, values, callback)
	{
		var self = this;
		var value = sessionStorage.getItem(context);
		if(!value)
		{
			var id = IdUtil.generate();
			var select = $(this.template.render(this.selectHtml, { id : id, context : context, values : values}));
			select.find("#" + id + "-once").click(function()
			{
				var value = select.find("input[type='radio'][name='" + id + "-response']:checked").val();
				if(!isSet(value))
				{
					value = values[0];
				}
				select.remove();
				if(self.selects.children().length == 0)
				{
					self.selects.hide();
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
				if(self.selects.children().length == 0)
				{
					self.selects.hide();
				}
				sessionStorage.setItem(context, value);
				callback(value);
			});
			self.selects.append(select);
			self.selects.show();
		}
		else
		{
			callback(value);
		}
	};
	
	return Dev;
	
})();



