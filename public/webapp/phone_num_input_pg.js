
FmMobile.phoneNumInputPg = {
PAGE_ID: "phoneNumInputPg",
  
    init: function(){
        //FmMobile.bindClickEventToNavBar();
        
        $("#phone_num").click(function(){
                              //if(FmMobile.myflag){
           FmMobile.authentication.getCode();
                                 //                           }else{
                               //navigator.notification.alert("請於三分鐘後再發送一次認證碼請求,謝謝！");
                              //}
                              //FmMobile.myflag=false;
                              //setTimeout(function(){FmMobile.myflag=true},180000); //180000
                              });
        
        $("#nav-bar").hide();
        
        
    },
        
    show: function(){
        FmMobile.analysis.trackPage("/phoneNumInputPg");
//        recordUserAction("enters phoneNumInputPg");
    },
};

