FmMobile.settingTermPg = {
PAGE_ID: "settingTermPg",
    
show: function(){
    FmMobile.headerCSS();
    //FmMobile.analysis.trackPage("/settingTermPg");
//    recordUserAction("enters settingTermPg");
},
    
init: function(){
	//FmMobile.changeBackground();
    $('#nav-bar').show();
   // FmMobile.hideBack();
    $("#back_setting").click(function(){
             $.mobile.changePage("setting-main.html");
                     });
    
}
};