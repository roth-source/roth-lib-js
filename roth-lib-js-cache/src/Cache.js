

var roth = roth || {};
roth.lib = roth.lib || {};
roth.lib.js = roth.lib.js || {};
roth.lib.js.cache = roth.lib.js.cache || {};
roth.lib.js.cache.key = "k" + (new Date().getTime());
document.write("<script src=\"script/cache.js?key=" + roth.lib.js.cache.key + "\"></script>");


var loadScript = loadScript || function(path, attributeMap)
{
	if(!attributeMap)
	{
		attributeMap = {};
	}
	var builder = "";
	builder += "<script ";
	attributeMap.src = path + "?key=" + roth.lib.js.cache.key;
	for(var name in attributeMap)
	{
		builder += name + "=\"" + attributeMap[name] + "\" ";
	}
	builder += "></script>";
	document.write(builder);
};


var loadLink = loadLink || function(path, attributeMap)
{
	if(!attributeMap)
	{
		attributeMap = {};
	}
	var builder = "";
	builder += "<link ";
	attributeMap.href = path + "?key=" + roth.lib.js.cache.key;
	attributeMap.rel = attributeMap.rel || "stylesheet";
	attributeMap.type = attributeMap.type || "text/css";
	for(var name in attributeMap)
	{
		builder += name + "=\"" + attributeMap[name] + "\" ";
	}
	builder += " />";
	document.write(builder);
};



roth.lib.js.cache.version = "0.2.0-SNAPSHOT";
