
roth.lib.js.template.Template = roth.lib.js.template.Template || function(config)
{
	var self = this;
	
	var Config =
	{
		openUnescapedExpression 	: "{{{",
		openEscapedExpression 		: "{{",
		openStatement 				: "{%",
		closeUnescapedExpression	: "}}}",
		closeEscapedExpression		: "}}",
		closeStatement				: "%}",
		dataVar						: "$_d",
		escapeVar					: "$_e",
		issetVar					: "$_i",
		argVar						: "$_a",
		tempVar						: "$_t",
		sourceVar					: "$_s"
	};
	
	var escapeRegExp = function(value)
	{
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	
	var syntaxRegExp = (function()
	{
		config = typeof config === "object" ? config : {};
		for(var name in Config)
		{
			if(config[name] === undefined || config[name] === null || config[name] == "")
			{
				config[name] = Config[name];
			}
		}
		var builder = "";
		builder += "\\r\\n|";
		builder += "\\n|";
		builder += "\\\"|";
		builder += escapeRegExp(config.openUnescapedExpression) + "|";
		builder += escapeRegExp(config.openEscapedExpression) + "|";
		builder += escapeRegExp(config.openStatement) + "|";
		builder += escapeRegExp(config.closeUnescapedExpression) + "|";
		builder += escapeRegExp(config.closeEscapedExpression) + "|";
		builder += escapeRegExp(config.closeStatement) + "|";
		builder += "defined\\((.+?)\\)";
		return new RegExp(builder, "g");
	})();
	
	this.parse = function(source, data)
	{
		var escape = true;
		var parsedSource = "";
		if(typeof data === "object")
		{
			for(var name in data)
			{
				parsedSource += "var " + name + " = " + config.dataVar + "[\"" + name + "\"];\n";
			}
		}
		parsedSource += "var " + config.escapeVar + " = function(" + config.argVar + ") { return " + config.argVar + ".replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\").replace(/>/g, \"&gt;\"); };\n";
		parsedSource += "var " + config.issetVar + " = function(" + config.argVar + ") { return "  + config.argVar + " !== undefined && " + config.argVar + " !== null };\n";
		parsedSource += "var " + config.tempVar + ";\nvar " + config.sourceVar + "=\"\";\n" + config.sourceVar + "+=\"";
		parsedSource += source.replace(syntaxRegExp, function(match, capture)
		{
			var replacement = "";
			switch(match)
			{
				case "\r\n":
				case "\n":
				{
					replacement = escape ? "\\n" : "\n";
					break;
				}
				case "\"":
				{
					replacement = escape ? "\\\"" : "\"";
					break;
				}
				case config.openUnescapedExpression:
				{
					replacement = "\"; try{" + config.tempVar + "=";
					escape = false;
					break;
				}
				case config.openEscapedExpression:
				{
					replacement = "\"; try{" + config.tempVar + "=";
					escape = false;
					break;
				}
				case config.openStatement:
				{
					replacement = "\";";
					escape = false;
					break;
				}
				case config.closeUnescapedExpression:
				{
					replacement = "; " + config.sourceVar + "+=(" + config.issetVar + "(" + config.tempVar + ")) ? new String(" + config.tempVar + ") : \"\";}catch(e){}; " + config.sourceVar + "+=\"";
					escape = true;
					break;
				}
				case config.closeEscapedExpression:
				{
					replacement = "; " + config.sourceVar + "+=(" + config.issetVar + "(" + config.tempVar + ")) ? " + config.escapeVar + "(new String(" + config.tempVar + ")) : \"\";}catch(e){}; " + config.sourceVar + "+=\"";
					escape = true;
					break;
				}
				case config.closeStatement:
				{
					replacement = config.sourceVar + "+=\"";
					escape = true;
					break;
				}
				default:
				{
					if(match.indexOf("defined") == 0)
					{
						replacement = "typeof " + capture + " !== " + "\"undefined\"";
					}
					break;
				}
			}
			return replacement;
		});
		parsedSource += "\";\nreturn " + config.sourceVar + ";";
		return parsedSource;
	};
	
	this.renderParsed = function(parsedSource, data)
	{
		return new Function(config.dataVar, parsedSource)(data);
	};
	
	this.render = function(source, data)
	{
		return this.renderParsed(this.parse(source, data), data);
	};
	
};



