

var roth = roth || {};
roth.lib = roth.lib || {};
roth.lib.js = roth.lib.js || {};
roth.lib.js.cache = roth.lib.js.cache || {};
roth.lib.js.cache.key = "key" + (new Date().getTime());
document.write("<script src=\"script/cache.js?" + roth.lib.js.cache.key + "\"></script>");


var loadScript = loadScript || function(path, attributeMap)
{
	if(!attributeMap)
	{
		attributeMap = {};
	}
	var builder = "";
	builder += "<script ";
	attributeMap.src = path + "?" + roth.lib.js.cache.key;
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
	attributeMap.href = path + "?" + roth.lib.js.cache.key;
	attributeMap.rel = attributeMap.rel || "stylesheet";
	attributeMap.type = attributeMap.type || "text/css";
	for(var name in attributeMap)
	{
		builder += name + "=\"" + attributeMap[name] + "\" ";
	}
	builder += " />";
	document.write(builder);
};



