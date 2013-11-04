FmMobile.fbLoginSuccessPg = {
PAGE_ID: "fbLoginSuccessPg",
    
init: function(){
    //FmMobile.bindClickEventToNavBar();
    $("#start_template").click(function(){
                          $.mobile.changePage('template-main_template.html');
                          
                          });
    
    
    
},
    
show: function(){
//    FmMobile.analysis.trackPage("/fbLoginSuccessPg");
//    recordUserAction("enters fbLoginSuccessPg");
},
};

