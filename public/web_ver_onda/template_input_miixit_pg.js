FmMobile.template_input_miixit = {
	//  Page constants.
PAGE_ID: "template_input_miixit",
    
    //  Page methods.
show: function(){
    //FmMobile.analysis.trackPage("/template_input_miixit");
    //recordUserAction("enters template_input_miixit");
    FmMobile.dummyDiv();
},
    
load: function(event, data){
    // FmMobile.userContent.text="aaa";
    $('#template_name_3').html(FmMobile.selectedTemplateName);
    //FmMobile.bindClickEventToNavBar();
    
    $("#nav-bar").show();
    if ( localStorage._id ) {
        userName = localStorage._id;
    }
    else {
        userName = "anonymous";
    }
    
    
    // if(FmMobile.selectedTemplate=="cultural_and_creative"){
    
    $("#back_main").click(function(){
                          $.mobile.changePage("template-sub-miixit.html");
                          });
    
    /*
     if(FmMobile.selectedTemplate=="cultural_and_creative"){
     
     $("#template_name_2").html('').append(templateMgr.getTemplateList()[0].name);
     }else if(FmMobile.selectedTemplate=="mood"){
     $("#template_name_2").html('').append(templateMgr.getTemplateList()[1].name);
     }else if(FmMobile.selectedTemplate=="miix_it"){
     $("#template_name_2").html('').append(templateMgr.getTemplateList()[3].name);
     }
     */
    
    
    
    
    
    var itemContentIsReady;
    
    
    
    var buttonClick_cb = function(event, ui) {
        
        
        
        
        
        
    };
    
    $('#btnUseCamera').bind( "click", { photoSource: "camera" }, buttonClick_cb);
    $('#btnUseAlbum').bind( "click", { photoSource: "album" }, buttonClick_cb);
    
    
}
};
