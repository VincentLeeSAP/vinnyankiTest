sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";
	
	return Controller.extend("com.vinnyanki.BaseController", {
	
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		
		getRootPath: function(url){
			var sRootPath = jQuery.sap.getModulePath("com.vinnyanki");
			var sImagePath = sRootPath + url;
			return sImagePath;
		},
		
		// doLog: function() {
		// 	console.log("base controller loaded");
		// },
		
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("overview", {}, true);
			}
		}
	});
 
});