FmMobile.fbLoginPg = {
    PAGE_ID: "fbLoginPg",
        
    init: function(){
        
        $('#nav-bar').hide();
        //FmMobile.hideBack();
        $("#go_fb_login").click(function(){
            FmMobile.authPopup.init();
        });
    },

    show: function(){
        FmMobile.headerCSS();
        //FmMobile.analysis.trackPage("/fbLoginPg");
//        recordUserAction("enters fbLoginPg");
    }
};

