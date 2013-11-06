FmMobile.settingTocPg = {
PAGE_ID: "settingTocPg",
    
show: function(){
    FmMobile.headerCSS();
   // FmMobile.analysis.trackPage("/settingTocPg");
//    recordUserAction("enters settingTocPg");
},
    
init: function(){
	//mMobile.changeBackground();
    $('#nav-bar').show();
  //  FmMobile.hideBack();
    $("#back_setting").click(function(){
         $.mobile.changePage("setting-main.html");
        });
}
};
