FmMobile.verificationPg = {
PAGE_ID: "verificationPg",
    
    init: function(){
        FmMobile.bindClickEventToNavBar();
        $("#verify").click(function(){
            $.mobile.changePage('phone_num_input.html');
        });
    },
        
    show: function(){
        FmMobile.analysis.trackPage("/verificationPg");
//        recordUserAction("enters verificationPg");
    },
};

