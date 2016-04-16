
var moduleDependencies =
{
	common	 	: [],
	person 		: [ "common" ]
};

var web = new roth.lib.js.web.Web("index", moduleDependencies);

web.hash.defaultModule = "person";
web.hash.defaultPage = "test";

web.init();

