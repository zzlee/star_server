FmMobile.settingAboutPg = {
    PAGE_ID: "settingAboutPg",
        
    show: function(){
        FmMobile.headerCSS();
        //FmMobile.analysis.trackPage("/settingAboutPg");
//        recordUserAction("enters settingAboutPg");
    },
        
    init: function(){
    	//FmMobile.changeBackground();
    	if(false){
    		$("a").attr({style:"color:#999;"});
    	}
        $('#nav-bar').show();
        $("#back_setting").click(function(){
                                 $.mobile.changePage("setting-main.html");
         });
       // FmMobile.hideBack();
        
//        $("#contentAboutMiixIt>a").click(function(){
//            FmMobile.openBrowser("http://www.feltmeng.com/");
//                                         
//        });
        
    }
};