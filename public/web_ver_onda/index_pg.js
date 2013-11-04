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
        if(localStorage.fb_userID){
            $.mobile.changePage("template-main_template.html");
        }
        else {
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
        
    
};
