FmMobile.tocPg = {
    PAGE_ID: "tocPg",
        
    show: function(){
        FmMobile.ajaxNewVideos();
        FmMobile.ajaxNewStoryVideos();
    },
        
    init: function(){
        if (localStorage._id) {
            $("#toc_menuBtn").show();
        }
        else {
            $("#toc_menuBtn").hide();
        }
    },
    
    buttonClicked: function(){
        FmMobile.analysis.trackEvent("Button", "Click", "ToC", 11);
        $.mobile.changePage("toc.html");
    },
};
