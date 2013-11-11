FmMobile.codeInputPg = {
PAGE_ID: "codeInputPg",
    
    init: function(){
        //FmMobile.bindClickEventToNavBar();
        $("#verify_code").click(function(){
            FmMobile.authentication.sendCode();
        });
        $("#back_phoneNumber").click(function(){
                                     $.mobile.changePage('phone_num_input.html');
         });
        
    },
        
    show: function(){
        FmMobile.analysis.trackPage("/codeInputPg");
//        recordUserAction("enters codeInputPg");
    },
};

