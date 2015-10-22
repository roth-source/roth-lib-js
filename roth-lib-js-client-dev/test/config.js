var client = new roth.lib.js.client.Client();

client.config.viewPath = "test/view/";
client.config.devPath = "resources/";
client.config.devServicePath = "test/dev/service/"

client.config.layout =
{
	"test" :
	{
		"service" : "index"
	}
};

client.config.module =
{
	"index" :
	{
		"layout" : "test",
		"page" :
		{
			"index" :
			{
				
			}
		}
	}
};

client.init();

client.config.dev =
{
	"index" :
	{
		"link" :
		{
			"index" : ["#"]
		},
		"service" :
		{
			"initTest" :
			{
				"request"	: [],
				"response"	: ["test1", "test2", "test3"]
			},
			"initIndex" :
			{
				"request"	: [],
				"response"	: ["test1", "test2", "test3"]
			}
		}
	},
	"payment" :
	{
		"param" :
		{
			"account" : "1234",
			"person" : "1234",
			"context" : "1234",
			"payment" : "1234",
			"client" : "asdfasdf"
		},
		"link" :
		{
			"register" 				: ["#/pay/register/account/{{ account }}/"],
			"amount" 				: ["#/pay/amount/context/{{ context }}/", "#/pay/amount/person/{{ person }}/"],
			"method"				: ["#/pay/method/context/{{ context }}/"],
			"confirm" 				: ["#/pay/confirm/context/{{ context }}/"],
			"receipt" 				: ["#/pay/receipt/payment/{{ payment }}/"],
			"details"				: ["#/boarding/details/client/{{ client }}/"]
		}
	},
	"portal" :
	{
		"link" :
		{
			"login"					: ["#/portal/login/"],
			"home"					: ["#/portal/home/"],
			"payments"				: ["#/portal/payments/"],
			"methods"				: ["#/portal/methods/"],
			"maintenance"			: ["#/portal/maintenance/"],
			"settings"				: ["#/portal/settings/"]
		}
	},
	"admin" :
	{
		"link" :
		{
			"login"					: ["#/admin/login/"],
			"dashboard"				: ["#/admin/login/page/dashboard/"]
		}
	},
	"internal" :
	{
		"link" :
		{
			"clients"				: ["#/admin/login/module/internal/page/clients/"]
		}
	},
	"boarding" :
	{
		"param" :
		{
			"client" : "1234",
			"package" : "1234"
		},
		"link" :
		{
			"client"				: ["#/boarding/client/"],
			"pricing"				: ["#/boarding/pricing/client/{{ client }}/", "#/boarding/pricing/client/{{ client }}/package/{{ package }}/"],
			"details"				: ["#/boarding/details/client/{{ client }}/"],
			"settings"				: ["#/boarding/settings/client/{{ client }}/"],
			"properties"			: ["#/boarding/properties/client/{{ client }}/"],
			"channels"				: ["#/boarding/channels/client/{{ client }}/"]
		},
		"service" :
		{
			"initBoarding":
			{
				"request"			: [],
				"response"			: []
			},
			"initClient":
			{
				"request"			: [],
				"response"			: []
			},
			"submitClient":
			{
				"request"			: [],
				"response"			: []
			},
			"initPricing":
			{
				"request"			: ["new", "package"],
				"response"			: ["none", "bundled-new", "bundled-edit", "product-new", "product-edit"]
			},
			"createPricing":
			{
				"request"			: [],
				"response"			: []
			},
			"deletePricing":
			{
				"request"			: [],
				"response"			: []
			},
			"submitPricing":
			{
				"request"			: ["bundled", "product"],
				"response"			: []
			},
			"startEnrollment":
			{
				"request"			: [],
				"response"			: []
			},
			"initDetails":
			{
				"request"			: [],
				"response"			: ["new", "bankserv", "other"]
			},
			"submitDetails":
			{
				"request"			: ["bankserv", "other"],
				"response"			: []
			},
			"initSettings":
			{
				"request"			: [],
				"response"			: ["new", "existing"]
			},
			"submitSettings":
			{
				"request"			: [],
				"response"			: []
			},
			"initProperties":
			{
				"request"			: [],
				"response"			: ["new", "existing"]
			},
			"createProperty":
			{
				"request"			: [],
				"response"			: []
			},
			"deleteProperty":
			{
				"request"			: [],
				"response"			: []
			},
			"updateProperty":
			{
				"request"			: [],
				"response"			: []
			},
			"updateTarget":
			{
				"request"			: [],
				"response"			: []
			},
			"uploadProperties":
			{
				"request"			: [],
				"response"			: []
			},
			"submitProperties":
			{
				"request"			: [],
				"response"			: []
			},
			"initBankAccount":
			{
				"request"			: [],
				"response"			: []
			},
			"submitBankAccount":
			{
				"request"			: [],
				"response"			: []
			},
			"initChannels":
			{
				"request"			: [],
				"response"			: []
			},
			"getAccountChannels":
			{
				"request"			: [],
				"response"			: []
			},
			"submitChannels":
			{
				"request"			: [],
				"response"			: []
			}
		}
	}
};

