FmMobile.settingFaqPg = {
PAGE_ID: "settingFaqPg",
    
show: function(){
    FmMobile.headerCSS();
    //FmMobile.analysis.trackPage("/settingFaqPg");
//    recordUserAction("enters settingFaqPg");
},
    
init: function(){
	//FmMobile.changeBackground();

    $('#nav-bar').show();
    //FmMobile.hideBack();
    $("#back_setting").click(function(){
                             $.mobile.changePage("setting-main.html");
                             });
}
};
