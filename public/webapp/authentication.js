var FmMobile = window.FmMobile || {};

var DEBUG = true,
FM_LOG = (DEBUG) ? function(str){ console.log("\n[FM] "+str); } : function(str){} ;


var local = false,
localhost = "http://localhost:3000",
remotesite = starServerURL, //"http://192.168.5.188", //"http://www.feltmeng.idv.tw",
domain = (local) ?  localhost : remotesite;

var myflag=true;

FmMobile.authentication = {
    
    init: function(){
        //deprecated?
        if(localStorage.verified == 'true'){
            console.log("verified is true");
            $.mobile.changePage("booking_choose_movie.html");
            
        }else{
             console.log("verified is false");
            this.verification();
        }
        
    },
    
    
    verification: function(){
        $.mobile.changePage("login_toc.html");
    },
    
    
    getCode: function(){
        // TODO - $.get('codeGeneration', data, function(res){});
        var phoneNum = $("#phoneNum_input").attr("value");
                console.log(phoneNum);

 var phoneNum_int = parseInt(phoneNum.substring(1,phoneNum.length))
        console.log(phoneNum_int);
        if(isNaN(phoneNum_int) || phoneNum_int < 900000000 || phoneNum_int > 999999999){
//             navigator.notification.alert("號碼錯囉...");
            FmMobile.showNotification("wrongPhoneNumber");
            $("#phoneNum_input").attr("value", "09XXXXXXXX");
            return;
        }else if(FmMobile.myflag){
            var url = remotesite + "/members/authentication_code",
            data = {
            phoneNum: phoneNum,
            fb_userID: localStorage.fb_userID,
            userID: localStorage._id,
            miixToken: localStorage.miixToken
            };
            
            $.get(url, data, function(res){

                  //alert("test");
                  if(res.message){
                      FmMobile.myflag=false;
                  console.log(res.message);
                  FmMobile.showNotification("waitForCode");
                  //navigator.notification.alert(res.message);
                      $.mobile.changePage("code_input.html");
                  setTimeout(function(){FmMobile.myflag=true},60000);
                  }else{
                      console.log("[authentication.getCode] : " + res.error);
                  }
                  });
            

        }else{
//            navigator.notification.alert("請於三分鐘後再發送一次認證碼請求,謝謝！");
            FmMobile.showNotification("reSendCode");
        
        }
      //  FmMobile.myflag=false;
        //setTimeout(function(){FmMobile.myflag=true},60000);
        
    },
    
    sendCode: function(){
        // TODO - $.post('codeVerification', data, function(res){});
        var code = $("#code_input").attr("value");
        var code_int = parseInt(code);
        
        if(isNaN(code_int) || code_int > 9999){
             FmMobile.showNotification('inputWrongCode');
            $("#code_input").attr("value", "");
            return;
        }
        
        var url = remotesite + "/api/codeVerification",
            data = {
                code: code,
                userID: localStorage._id,
                fb_userID: localStorage.fb_userID,
                miixToken: localStorage.miixToken
            };
        
        $.post(url, data, function(res){
           if(res.message){
               localStorage.verified = true;
//               navigator.notification.alert(res.message, function(){
//                                            $.mobile.changePage("login_success.html");
//                                            }, "認證");
                console.log("[authentication.sendCode] : " + res.message);
               FmMobile.showNotification("codeVerifySuccess");
               $.mobile.changePage("login_success.html");
               
           }else{
               FmMobile.showNotification('inputWrongCode');

//               navigator.notification.alert(res.error);
               console.log("[authentication.sendCode] : " + res.error);
           }
        });
    },
};