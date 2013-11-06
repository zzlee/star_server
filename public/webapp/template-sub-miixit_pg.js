FmMobile.template_miixitPg = {
PAGE_ID: "template_miixitPg",
    
show: function(){
     FmMobile.dummyDiv();
  //  FmMobile.analysis.trackPage("/template_miixitPg");
//    recordUserAction("enters template_miixitPg");
    //$('.content-movie-img').attr("height",$('.content-movie-img').width()/757*439);
},
    
init: function(){
    $("#video_iOS").bind("durationchange", function() {
                   // alert("Current duration is: " + this.duration);
                         FmMobile.addDivFor7=true;
                    });
    
    /*
    $("#video_iOS").bind("tap",function(){
                         
                         FmMobile.addDivFor7=true;

                         });
    */
    
    $('#nav-bar').show();
    //FmMobile.changeIntroduceBackground();
    if(localStorage[FmMobile.selectedTemplate]=='hasReadHint'){
        $("#show_intro").hide();
        $("#close").hide();
    }else{
        $("#show_intro").show();
    }
    
//    if(device.platform == "Android"){
//    	//replace the <video> with <iframe>
//    	$("#video_iOS").hide();
//    	$("#iframe_Android").show();
//    }else if((device.platform == "iPhone") || (device.platform == "iPad") || (device.platform == "iPod touch")){
//    	$("#video_iOS").show();
//    	$("#iframe_Android").hide();
//    }
    $("#demoVideo").click(function(){
        if(false){
            FmMobile.openBrowser.openExternal("http://www.youtube.com/embed/3_mes5U5nlk?rel=0&showinfo=0&modestbranding=1&controls=1&autoplay=1");
        }else{
                          
            var videoFrame = $("<iframe>").attr({
                                                id: "3_mes5U5nlk",
                                                src: "http://www.youtube.com/embed/3_mes5U5nlk?rel=0&showinfo=0&modestbranding=1&controls=0&autoplay=1",
                                                class: "content-movie-img-demoVideo",
                                              frameborder: "0",
                                                style: "height:92%;"
                                                }).load(function(){
                                                        //TODO: find a better way to have callPlayer() called after videoFrame is prepended
                                                        setTimeout(function(){
                                                                  // callPlayer(ytVideoID,'playVideo');
                                                                   }, 1500);
                                                            FmMobile.addDivFor7 = true;
                                                        });

            var callPlayer = function (frame_id, func, args) {
                if (window.jQuery && frame_id instanceof jQuery){
                frame_id = frame_id.get(0).id;
                }
                var iframe = document.getElementById(frame_id);
                if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
                iframe = iframe.getElementsByTagName('iframe')[0];
                }

                if (iframe) {
                //Frame exists,
                iframe.contentWindow.postMessage(JSON.stringify({
                                                                "event": "command",
                                                                "func": func,
                                                                "args": args || [],
                                                                "id": frame_id
                                                                }), "*");
            }};

            $('#videoDiv').prepend(videoFrame);
            $('#video').remove();

                  
        }
    });
//

    $("#close").click(function(){
              $("#show_intro").hide();
              $('#close').hide();
              localStorage[FmMobile.selectedTemplate]='hasReadHint';
        });
    
    $('#back_main').click(function(){
              $.mobile.changePage("template-main_template.html");
                          
      });
    
    $('#next_step').click(function(){
                FmMobile.selectedSubTemplate=templateMgr.getSubTemplateList("miix_it")[0].id;
                          $.mobile.changePage("template_input_miixit.html");
                          });
    /*
     
     var a=templateMgr.getTemplateList();
     //b[1].subTemplate.text_only.name
     
     
     $("#sub_1").html('').append(a[0].subTemplate.text_only.name).click(function(){
     alert("hi");
     FmMobile.selectedSubTemplate=templateMgr.getTemplateList()[1].subTemplate.text_only.description;
     $.mobile.changePage("template-input_text.html");
     });
     
     /*
     console.dir(templateMgr.getTemplateList());
     
     
     alert(a[1].name);
     //templateMgr.getTemplateList();
     
     
     
     */
    
},
};
