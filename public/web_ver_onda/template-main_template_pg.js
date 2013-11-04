FmMobile.template_mainTemplatePg = {
PAGE_ID: "template_mainTemplatePg",
  

    show: function(){
        FmMobile.dummyDiv();


        
//        recordUserAction("enters template_mainTemplatePg");
    },
        
    init: function(){
	delete localStorage.imgForCropper;
       // FmMobile.dummyDiv();
        FmMobile.myUgcScroll_y=0;
            TemplateMgr.getInstance(function(err, _templateMgr){
            if (!err) {
                    templateMgr = _templateMgr;
                /* --------- get main template dynamically  --------------*/
                    var parent=$("#start_mainTemplate");
                    parent.html("");
                                 
                                        //template_img.appendTo(my_icon);
                    //var temp=$("<div>").attr({class: "template"});
                   // parent.append(my_icon);z
                for(var i=0;i<templateMgr.getTemplateList().length;i++){
                                    var my_icon=$("<div>").attr({class:"my-video-icon"});
                                    var template_img=$("<img>").attr({id:templateMgr.getTemplateList()[i].id,
                                                                     class:"choose-script",
                                                                     src:templateMgr.getTemplateList()[i].representingImageUrl,
                                                                     title:templateMgr.getTemplateList()[i].topBarImageUrl
                                                                     });
                                    
                                    template_img.appendTo(my_icon);
                                    my_icon.appendTo(parent);

                   }
                  /*
                    for(var i=0;i<templateMgr.getTemplateList().length;i++){
                            var mainTemplate = $("<div>").attr({id:templateMgr.getTemplateList()[i].id,class: "choose-movie", title:templateMgr.getTemplateList()[i].name});
                            var templatePic = $("<div>").attr({class: "choose-movie-pic"});
                            var templatePicDummy = $("<div>").attr({class: "movie-pic-dummy"});
                            var templatePicImg=$("<img>").attr({src:templateMgr.getTemplateList()[i].representingImageUrl,class: "movie-pic-img"});
                            var templateName=$("<div>").attr({class:"template_name"});


                            templatePic.appendTo(mainTemplate);
                            templatePicDummy.appendTo(templatePic);
                            templatePicImg.appendTo(templatePic);
                            templateName.html(templateMgr.getTemplateList()[i].name);
                            templateName.appendTo(mainTemplate);
                            mainTemplate.appendTo(parent);
                        }
                   */
                         
                            $("#start_mainTemplate > div >img").click(function(){
                                      //alert("aa");
									   //$.mobile.changePage("template-sub_template.html");
									 
                                     FmMobile.selectedTemplateBarImg=this.title;
                                     FmMobile.selectedTemplate=this.id;
                                       if(FmMobile.selectedTemplate=='miix_it'){
                                                           $.mobile.changePage("template-sub-miixit.html");            
                                                                       }
                                        else if(FmMobile.selectedTemplate=='check_in'){
                                            $.mobile.changePage("template-sub-checkin.html");
                                        }else{
                                            $.mobile.changePage("template-sub_template.html");
                                        }
                                });
                                    
                                    /* -------------  判斷templete instruction 是否已看過 ------------  */
									
                                    for(var i=0;i<templateMgr.getTemplateList().length;i++){
                                    var temp=templateMgr.getTemplateList()[i].id;
                                    
                                    if(localStorage[temp]== 'hasReadHint'){
                                    localStorage[temp]='unReadHint';
                                    }
                                    
                                    }
                                    /*-------------------------------------*/
                          
                
                  /* --------- ends of get main template dynamically  --------------*/               
                    }else{
                    console.log("Fail to get templateMgr: "+err);
                }
            });
        
                       
		$('#nav-bar').show();
		$('#mainTemplateList').css("padding-bottom",$('#nav-bar').height()*0.95);
        
    },
};
