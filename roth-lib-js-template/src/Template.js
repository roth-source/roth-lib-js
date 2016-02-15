

var roth = roth || {};
roth.lib = roth.lib || {};
roth.lib.js = roth.lib.js || {};
roth.lib.js.template = roth.lib.js.template || {};


roth.lib.js.template.Template = roth.lib.js.template.Template || function(config)
{
	
	this.config = typeof config === "object" ? config : {};
	
	this.escapeRegExp = function(value)
	{
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	
	this.syntaxRegExp = (function(self)
	{
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
		for(var name in Config)
		{
			if(self.config[name] === undefined || self.config[name] === null || self.config[name] == "")
			{
				self.config[name] = Config[name];
			}
		}
		var builder = "";
		builder += "\\t|";
		builder += "\\\\r\\\\n|";
		builder += "\\\\n|";
		builder += "\\r\\n|";
		builder += "\\n|";
		builder += "\\\\\"|";
		builder += "\\\"|";
		builder += self.escapeRegExp(self.config.openUnescapedExpression) + "|";
		builder += self.escapeRegExp(self.config.openEscapedExpression) + "|";
		builder += self.escapeRegExp(self.config.openStatement) + "|";
		builder += self.escapeRegExp(self.config.closeUnescapedExpression) + "|";
		builder += self.escapeRegExp(self.config.closeEscapedExpression) + "|";
		builder += self.escapeRegExp(self.config.closeStatement) + "|";
		return new RegExp(builder, "g");
	})
	(this);
	
};


roth.lib.js.template.Template.prototype.parseScope = function(scope)
{
	var parsedScope = ""
	if(typeof scope === "object")
	{
		for(var name in scope)
		{
			parsedScope += "var " + name + " = " + this.config.scopeVar + "[\"" + name + "\"];\n";
		}
	}
	return parsedScope;
};


roth.lib.js.template.Template.prototype.parse = function(source)
{
	var self = this;
	var escape = true;
	var parsedSource = "";
	parsedSource += "var " + self.config.escapeVar + " = function(" + self.config.argVar + ") { return " + self.config.argVar + ".replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\").replace(/>/g, \"&gt;\"); };\n";
	parsedSource += "var " + self.config.issetVar + " = function(" + self.config.argVar + ") { return "  + self.config.argVar + " !== undefined && " + self.config.argVar + " !== null };\n";
	parsedSource += "var " + self.config.tempVar + ";\nvar " + self.config.sourceVar + "=\"\";\n" + self.config.sourceVar + "+=\"";
	parsedSource += source.replace(self.syntaxRegExp, function(match, capture)
	{
		var replacement = "";
		switch(match)
		{
			case "\\t":
			{
				break;
			}
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
			case self.config.openUnescapedExpression:
			{
				replacement = "\"; try{" + self.config.tempVar + "=";
				escape = false;
				break;
			}
			case self.config.openEscapedExpression:
			{
				replacement = "\"; try{" + self.config.tempVar + "=";
				escape = false;
				break;
			}
			case self.config.openStatement:
			{
				replacement = "\";";
				escape = false;
				break;
			}
			case self.config.closeUnescapedExpression:
			{
				replacement = "; " + self.config.sourceVar + "+=(" + self.config.issetVar + "(" + self.config.tempVar + ")) ? new String(" + self.config.tempVar + ") : \"\";}catch(e){}; " + self.config.sourceVar + "+=\"";
				escape = true;
				break;
			}
			case self.config.closeEscapedExpression:
			{
				replacement = "; " + self.config.sourceVar + "+=(" + self.config.issetVar + "(" + self.config.tempVar + ")) ? " + self.config.escapeVar + "(new String(" + self.config.tempVar + ")) : \"\";}catch(e){}; " + self.config.sourceVar + "+=\"";
				escape = true;
				break;
			}
			case self.config.closeStatement:
			{
				replacement = self.config.sourceVar + "+=\"";
				escape = true;
				break;
			}
			default:
			{
				break;
			}
		}
		return replacement;
	});
	parsedSource += "\";\nreturn " + self.config.sourceVar + ";";
	return parsedSource;
};


roth.lib.js.template.Template.prototype.eval = function(parsedSource, scope)
{
	var self = this;
	return new Function(self.config.scopeVar, self.parseScope(scope) + parsedSource)(scope);
};


roth.lib.js.template.Template.prototype.render = function(source, scope)
{
	var self = this;
	return this.eval(self.parse(source, scope), scope);
};



