FmMobile.facebookSharePg = {
PAGE_ID: "facebookSharePg",
    
show: function(){
    FmMobile.headerCSS();
    FmMobile.analysis.trackPage("/facebookSharePg");
//    recordUserAction("enters facebookSharePg");
    
    
},
    
init: function(){
    //test
        $("#nav-bar").hide();
        $('#youtubePlay').hide();
        $('#shareFbPhoto').hide();
        FmMobile.hideBack();
    
        if(FmMobile.shareFbType=="video"){
        	if(FmMobile.myUgcPg.Type == "live"){
        		FmMobile.analysis.trackEvent("Content", "Share", "liveVideo", 2 );	
        	}else{
        		FmMobile.analysis.trackEvent("Content", "Share", "video", 2 );
        	}
            $('#youtubePlay').attr({src:FmMobile.youtubeVideoUrl, style: "height: 90%;"});
            $('#youtubePlay').show();
        }else if(FmMobile.shareFbType=="image"){
            if(FmMobile.myUgcPg.Type == "live"){
            	FmMobile.analysis.trackEvent("Content", "Share", "liveImage", 2 );
                $('#shareFbPhoto').attr({src:FmMobile.srcForMyUgcViewer, style: "height: 90%;margin-top:10.32px"});
            }else{
                var checkImgType = FmMobile.srcForMyUgcViewer.split('_');
                if(checkImgType[checkImgType.length - 1] != "preview.png"){
                	FmMobile.analysis.trackEvent("Content", "Share", "longImage", 2 );
                    var shareContent = $("#share_content");
                    shareContent.attr({class: "content-movie-long",style:"margin-bottom:0;margin-top:0px;"});
                    shareContent.html("");
                    var dummyDivLong = $("<div>").attr({class:"movie-pic-dummy-long"});
    //                var widget = $("<div>").attr({class: "content-movie-long"});
                    dummyDivLong.appendTo(shareContent);
                    if(device.platform != "Android"){
                    	this.imageThumbnail = $("<img>").attr({
                                                          id: "shareFbPhoto",
                                                          src: FmMobile.srcForMyUgcViewer,
                                                          class: "content-movie-img-long",
                                                          style: "margin-top:7.41px"
                                                          });
                    }else{
                        this.imageThumbnail = $("<img>").attr({
                            	id: "shareFbPhoto",
                            	src: FmMobile.srcForMyUgcViewer,
                            	class: "content-movie-img-long",
                            	style: "margin-top:16%"
                            });
                    }
                    this.imageThumbnail.appendTo(shareContent);
                    
                }else{
                	FmMobile.analysis.trackEvent("Content", "Share", "previewImage", 2 );
                    $('#shareFbPhoto').attr({src:FmMobile.srcForMyUgcViewer, style: "margin-top:10.32px"});
                }

//                $('#shareFbPhoto').attr({src:FmMobile.srcForMyUgcViewer});
            }
            $('#shareFbPhoto').show();
        }
    
            $('#go_preview').click(function(){
                if(FmMobile.checkNetwork()){
                    FmMobile.userContent.text=$('#ur_text').val();
                                   
                                   if(FmMobile.myUgcPg.Type == "live"){
                                          if(FmMobile.liveType=="miix_story"){
                                   FmMobile.analysis.trackEvent("Button", "Share", "Video", 2 );
                                   FmMobile.authPopup.postFbVideoMessage_live();

                                   }else{
                                   FmMobile.analysis.trackEvent("Button", "Share", "Video", 2 );
                                   FmMobile.authPopup.postFbMessage_live();

                                   }
                                                                      }else{
                                                       
                    if(FmMobile.shareFbType=="video"){
                    	FmMobile.analysis.trackEvent("Button", "Share", "Video", 2 );
                        FmMobile.authPopup.postFbVideoMessage();
                    }else if(FmMobile.shareFbType=="image"){
                    	FmMobile.analysis.trackEvent("Button", "Share", "Image", 2 );
                        FmMobile.authPopup.postFbMessage();
                               
                    }

                                   }
                                       
                    $.mobile.changePage('my_ugc.html');
                }
            });
    
        $("#back_setting").click(function(){
            $.mobile.changePage('my_ugc.html');
        });
   },
};