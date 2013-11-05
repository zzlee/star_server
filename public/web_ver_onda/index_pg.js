// index.html
FmMobile.indexPg = {
    
    PAGE_ID: "indexPg",
    
    //  Page methods.
    init: function(){
    	FM_LOG("[indexPg.init] ");
        // Query Availabe New Video in Background.
        if(localStorage.fb_userID){
//            FmMobile.ajaxNewVideos();
//            FmMobile.ajaxNewStoryVideos();
        }
        FmMobile.bindClickEventToNavBar();
        $('#nav-bar').hide();
    },
        
    show: function(){
        FM_LOG("[indexPg.show]");
        //localStorage.fb_userID
        if(localStorage.fb_userID && !localStorage._id){

        	 
        	 var url = "http://jean.ondascreen.com/members/fb_info";
             data = {"authResponse": {
             	"appGenre":"ondascreen",
                 "userID": localStorage.fb_userID,
                 "userName": localStorage.fb_name,
                 "email": localStorage.email,
                 "accessToken": localStorage.fb_accessToken,
                 "expiresIn":  localStorage.expiresIn,
                 //"deviceToken": "",
                 //"devicePlatform": "",
                 //"device": "",
                 "timestamp": Date.now()
                 }
             };
             
             $.post(url, data, function(response){
                 FM_LOG("[SignUp with FB]: ");
                 if(response.data){
                     localStorage._id = response.data._id;
                     localStorage.miixToken = response.data.miixToken;
                     localStorage.fb_accessToken = response.data.accessToken;
                     localStorage.verified = (response.data.verified) ? response.data.verified : 'false';
                     
                    
                     FmMobile.userContent.fb_name=localStorage.fb_name;
                    //localStorage.verified='true';//此行為了測試電話認證！
                     FM_LOG("localStorage" + JSON.stringify(localStorage));
                    
//                     if(localStorage.verified == 'true'){
//                         $.mobile.changePage("template-main_template.html");
//                    
//                     }else{
//                         $.mobile.changePage("cellphone_login.html");
//                     }

                 }else{
                        FM_LOG("[Sinup with FB failed!]");
                 }
             });
             FmMobile.indexPg.getProfilePhoto(localStorage.fb_userID);
             $.mobile.changePage("template-main_template.html");
        }else if(localStorage.fb_userID && localStorage._id){
        	FmMobile.indexPg.getProfilePhoto(localStorage.fb_userID);
       	 	$.mobile.changePage("template-main_template.html");
       	 
        }else {
       		$.mobile.changePage("orientation_1.html");	
        }
        
        
     //test
     //$.mobile.changePage("template-main_template.html");
     //end of test
    },
        
    beforeshow: function(){
        /*
        TemplateMgr.getInstance(function(err, _templateMgr){
                                //alert("templatmgr");
                                if (!err) {
                                templateMgr = _templateMgr;
                                FmMobile.mycount=templateMgr.getTemplateList().length;
                                alert(FmMobile.mycount);
                                }
                                else {
                                console.log("Fail to get templateMgr: "+err);
                                }
                                });
*/
        FM_LOG("[indexPg.beforeshow]");
        //uploadingMgr.showAll($("#index_contentArea"));
        
    },
    
    
    getProfilePhoto: function(fbId){
    	FM_LOG("[indexPg.getProfilePhoto]");
		var img64url = remotesite + "/members/" + fbId + "/thumbnail";

		$.ajax({
			type: 'GET',
			url: img64url,
			async: true,
			success: function(res){
				if(res){
					FmMobile.userContent.thumbnail.url = res;
				}
			},
      		error: function(jqXHR, textStatus, errorThrown ){
 	   			//FM_LOG("[error]jqXHR : " + JSON.stringify(jqXHR));
 	   			//FM_LOG("[error]textStatus : " + JSON.stringify(textStatus));
 	   			//FM_LOG("[error]errorThrown : " + errorThrown);
 	   			console.log("error");
 	   
    		}
		});
//    	var img64url = "/members/" + localStorage + "/thumbnail";
//    	img64Loader = function(imgURL, img64load_cb){
//            $.ajax({
//                url: 'http://img64.com/?q=' + encodeURIComponent(imgURL),
//                dataType: 'json'
//            }).then(function (image) {
//                img64load_cb(image.data);
//            });
//        };
    },
        
    
};
