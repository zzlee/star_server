FmMobile.fbLogoutPg = {
PAGE_ID: "fbLogoutPg",
    
init: function(){
    
    $('#nav-bar').hide();
    //FmMobile.hideBack();
    $('#back_setting').click(function(){
                        $.mobile.changePage('setting-main.html');     
                             });
    $("#go_fb_logout").click(function(){
                             //---------- fixed nav bar btn bug ------
                             $("#btnMyUgc").children("img").attr({src:"images/m2.png"});
                             $("#btnTemplate").children("img").attr({src:"images/m1-active.png"});
                             $("#btnScreen").children("img").attr({src:"images/m3.png"});
                             $("#btnSetting").children("img").attr({src:"images/m4.png"});
                             //----------end of fixed nav bar btn bug ------
                             FmMobile.authPopup.FBLogout();
//---------- fixed nav bar btn bug ------
                             $("#btnMyUgc").children("img").attr({src:"images/m2.png"});
                             $("#btnTemplate").children("img").attr({src:"images/m1-active.png"});
                             $("#btnScreen").children("img").attr({src:"images/m3.png"});
                             $("#btnSetting").children("img").attr({src:"images/m4.png"});
                             //----------end of fixed nav bar btn bug ------
                             //  $.mobile.changePage('fb_login.html');
                            });
},
    
show: function(){
    FmMobile.headerCSS();
    //FmMobile.analysis.trackPage("/fbLogoutPg");
//    recordUserAction("enters fbLogoutPg");
}
};
