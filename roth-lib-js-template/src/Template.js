

/**
 * @class
 * @param {object} [config]
 */
roth.lib.js.template.Template = roth.lib.js.template.Template || function(config)
{
	/**
	 * @lends Template.prototype
	 */
	
	var self = this;
	
	var Config =
	{
		openUnescapedExpression 	: "{{{",
		openEscapedExpression 		: "{{",
		openStatement 				: "{%",
		closeUnescapedExpression	: "}}}",
		closeEscapedExpression		: "}}",
		closeStatement				: "%}",
		scopeVar					: "$_d",
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
		builder += "\\\\r\\\\n|";
		builder += "\\\\n|";
		builder += "\\r\\n|";
		builder += "\\n|";
		builder += "\\\\\"|";
		builder += "\\\"|";
		builder += escapeRegExp(config.openUnescapedExpression) + "|";
		builder += escapeRegExp(config.openEscapedExpression) + "|";
		builder += escapeRegExp(config.openStatement) + "|";
		builder += escapeRegExp(config.closeUnescapedExpression) + "|";
		builder += escapeRegExp(config.closeEscapedExpression) + "|";
		builder += escapeRegExp(config.closeStatement) + "|";
		//builder += "defined\\((.+?)\\)";
		return new RegExp(builder, "g");
	})();
	
	/**
	 * parse scope object into flattened strings
	 * @method
	 * @param {Object} scope
	 * @returns {String}
	 */
	this.parseScope = function(scope)
	{
		var parsedScope = ""
		if(typeof scope === "object")
		{
			for(var name in scope)
			{
				parsedScope += "var " + name + " = " + config.scopeVar + "[\"" + name + "\"];\n";
			}
		}
		return parsedScope;
	};
	
	/**
	 * creates a parsed source string from the source
	 * @method
	 * @param {String} source
	 * @returns {String}
	 */
	this.parse = function(source)
	{
		var escape = true;
		var parsedSource = "";
		parsedSource += "var " + config.escapeVar + " = function(" + config.argVar + ") { return " + config.argVar + ".replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\").replace(/>/g, \"&gt;\"); };\n";
		parsedSource += "var " + config.issetVar + " = function(" + config.argVar + ") { return "  + config.argVar + " !== undefined && " + config.argVar + " !== null };\n";
		parsedSource += "var " + config.tempVar + ";\nvar " + config.sourceVar + "=\"\";\n" + config.sourceVar + "+=\"";
		parsedSource += source.replace(syntaxRegExp, function(match, capture)
		{
			var replacement = "";
			switch(match)
			{
				case "\\r\\n":
				case "\\n":
				{
					replacement = escape ? "\\\\n" : "\\n";
					break;
				}
				case "\r\n":
				case "\n":
				{
					replacement = escape ? "\\n" : "\n";
					break;
				}
				case "\\\"":
				{
					replacement = escape ? "\\\\\\\"" : "\\\"";
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
					/*
					if(match.indexOf("defined") == 0)
					{
						replacement = "typeof " + capture + " !== " + "\"undefined\"";
					}
					*/
					break;
				}
			}
			return replacement;
		});
		parsedSource += "\";\nreturn " + config.sourceVar + ";";
		return parsedSource;
	};
	
	/**
	 * renders template by evaling parsed source with scope object
	 * @method
	 * @param {String} parsedSource
	 * @param {Object} scope
	 * @returns {String}
	 */
	this.renderParsed = function(parsedSource, scope)
	{
		parsedSource = self.parseScope(scope) + parsedSource;
		return new Function(config.scopeVar, parsedSource)(scope);
	};
	
	/**
	 * parses and renders source with scope data
	 * @method
	 * @param {String} source
	 * @param {Object} scope
	 * @returns {String}
	 */
	this.render = function(source, scope)
	{
		return self.renderParsed(self.parse(source, scope), scope);
	};
	
};



