FmMobile.customerQuestionPg = {
    PAGE_ID: "customerQuestionPg",
        
    show: function(){
        FmMobile.headerCSS();
       // FmMobile.analysis.trackPage("/customerQuestionPg");
//        recordUserAction("enters customerQuestionPg");
    },
        
    init: function(){
//    	FmMobile.changeBackground();
    	FmMobile.dummyDiv();
        
        $('#select').bind("tap",function(){
                          $('#nav-bar').hide();
                          });
        $('#question_text').bind("tap",function(){
                          $('#nav-bar').hide();
                          });
        $('#input_id').bind("tap",function(){
                          $('#nav-bar').hide();
                          });


        $('#select').bind("blur",function(){
                          $('#nav-bar').show();
                          });
        $('#question_text').bind("blur",function(){
                                 $('#nav-bar').show();
                                 });
        $('#input_id').bind("blur",function(){
                            $('#nav-bar').show();
                            });
        

        
        
    	if(false){
    		$("div[class^='setting-content']").attr({class:"setting-content-qa",style:"padding-bottom:24%;"});
    	}
        $('#nav-bar').show();
//        $("#userQuesiotns").html('');
       // FmMobile.hideBack();
        $("#back_setting").click(function(){
                                 $.mobile.changePage("setting-main.html");
        });
        
        var memberId =localStorage._id;

        // post customer question
        
        $("#customer_button").click(function(){
                                    
                                    
                                    if($("#question_text").val().length==0 ||$("#question_text").val()==" "){
                                    FmMobile.showNotification("nullText");
                                    return false;
                                    }
                    $(".customer_button_sent").hide("normal",function(){
                                        if(FmMobile.checkNetwork()){
                                        var input_id=$("#input_id").val(); // input_id (影片代碼）
                                        var question_text=$("#question_text").val(); //question_text 問題敘述
                                        var select=$("#select option:selected").val(); //問題種類
                                        console.log("click");
                                        console.log("[question] # of video : " + input_id);
                                        console.log("[question] description : " + question_text);
                                        console.log("[question] type : " + select);
                                        $.ajax({
                                               type: "POST",
                                               url: starServerURL+"/miix_service/"+memberId+"/questions",
                                               data: {
                                               
                                               "no":input_id,
                                               "question":question_text,
                                               "genre":select,
                                               "miixToken": localStorage.miixToken
                                               }
                                               }).done(function( result ) {
                                                       
                                                       FmMobile.showNotification("settingQaSend");
                                                       
                                                       $('#input_id').val("");
                                                       
                                                       $('#question_text').val("");
                                                       $.mobile.changePage("setting-main.html");
                                                       console.log(result);
                                                       });
                                                                    }//End of CheckNetwork
                                        FmMobile.analysis.trackEvent("Button", "Ask", select, 4 );     
                    });//End of .customer_button_sent
        });
        
        //get answer
        //TODO: get token from other place
        //
        if(FmMobile.checkNetwork()){
            $.get(starServerURL+"/miix_service/"+memberId+"/questions",{miixToken: localStorage.miixToken},function(data,status){
                //alert("get"+status);
                //alert(data[1].question);
                console.log(data);
                //alert(data[1].questionTime);

               
                  
                  
                  if(data.message.length!=0){
                   $("#userQuesiotns").html('');
                  
                  for(var i=0;i<data.message.length;i++){
                  var _d= new Date((data.message[i].questionTime));
                  var _y=_d.getFullYear();
                  var _m=_d.getMonth()+1;
                  var dayOfmonth=_d.getDate();
                  var hour=_d.getHours();
                  var minute=_d.getMinutes();
                  var timeOutput_q=_y+"年"+_m+"月"+dayOfmonth+"號"+" "+hour+":"+minute;
                  
                  var a_d= new Date((data.message[i].answerTime));
                  var a_y=a_d.getFullYear();
                  var a_m=a_d.getMonth()+1;
                  var a_dayOfmonth=a_d.getDate();
                  var a_hour=a_d.getHours();
                  var a_minute=a_d.getMinutes();
                  var a_timeOutput=a_y+"年"+a_m+"月"+a_dayOfmonth+"號"+" "+a_hour+":"+a_minute;
                  
                  console.log(data.message[i].question);
                  
                  
                  if(!data.message[i].answer){
                  $("#userQuesiotns").append("<div class='question'>Question : "+
                                             data.message[i].question+"<br>"+"<div class='time'>"+
                                             timeOutput_q+"</div>"+"<br></div><div class='answer'>"+"Ans : (尚未回復您的問題！抱歉！) "+
                                             "<hr>"
                                             
                                             );
                  
                  
                  }else{
                  
                  $("#userQuesiotns").append("<div class='question'>Question : "+
                                             data.message[i].question+"<br>"+"<div class='time'>"+
                                             timeOutput_q+"</div>"+"<br></div><div class='answer'>"+"Ans : "+
                                             data.message[i].answer+"<br>"+"<div class='time'>"+
                                             a_timeOutput+"</div>"+"<br></div>"+
                                             "<hr>");
                  }
                  }

                  
                  
                  }


                                  
            });
        }//End of Check network
    }
};
