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

    $("#go_cropper").click(function(){
	      if(localStorage.imgForCropper == undefined){
	    	  alert("你沒有選擇照片。");
	    	  return false;
		  }
	   
	      fileProcessedForCropperURI = localStorage.imgForCropper;
	      FmMobile.userContent.picture.urlOfOriginal = localStorage.imgForCropper;
	      $.mobile.changePage("template-photo_cropper.html");
    });
	  


    $('#template_top_img_pic').attr({src:FmMobile.selectedTemplateBarImg});        
    
    
    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        var reader = new FileReader();

          // Closure to capture the file information.
        reader.onload = (function(theFile) {
        	return function(e) {
              // Render thumbnail.
        		var span = document.createElement('span');
        		span.innerHTML = ['<img class="thumb" src="', e.target.result,
                                '" title="', escape(theFile.name), '"/>'].join('');
                
              localStorage.setItem('imgForCropper', e.target.result);
              document.getElementById('list').src= localStorage.imgForCropper;

            };
          })(files[0]);

          // Read in the image file as a data URL.
          reader.readAsDataURL(files[0]);
      }
      document.getElementById('files').addEventListener('change', handleFileSelect, false);
    
    
    
    var buttonClick_cb = function(event, ui) {
        
    };
    
    $('#btnUseCamera').bind( "click", { photoSource: "camera" }, buttonClick_cb);
    $('#btnUseAlbum').bind( "click", { photoSource: "album" }, buttonClick_cb);
    
    
}
};
