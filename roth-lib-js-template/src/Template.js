

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
			escapeVar					: "$_e",
			issetVar					: "$_i",
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
	
	this.escape = function(value)
	{
		return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	};
	
	this.isset = function(value)
	{
		return value !== undefined && value !== null;
	};
	
};


roth.lib.js.template.Template.prototype.parse = function(source)
{
	var self = this;
	var escape = true;
	var parsedSource = "";
	parsedSource += "var " + self.config.tempVar + "; var " + self.config.sourceVar + "=\"\"; " + self.config.sourceVar + "+=\"";
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
	parsedSource += "\"; return " + self.config.sourceVar + ";";
	return parsedSource;
};


roth.lib.js.template.Template.prototype.eval = function(parsedSource, scope)
{
	var names = [];
	var values = [];
	names.push(this.config.escapeVar);
	values.push(this.escape);
	names.push(this.config.issetVar);
	values.push(this.isset);
	if(scope != null && typeof scope === "object")
	{
		for(var name in scope)
		{
			names.push(name);
			values.push(scope[name]);
		}
	}
	return new Function(names.join(), parsedSource).apply(this, values);
};


roth.lib.js.template.Template.prototype.render = function(source, scope)
{
	return this.eval(this.parse(source), scope);
};



