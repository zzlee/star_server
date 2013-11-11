FmMobile.template_pic_pg = {
	//  Page constants.
    PAGE_ID: "template_pic_pg",
    
    //  Page methods.
    show: function(){
   
    },
    
    load: function(event, data){
	
        FmMobile.userContent.text=null;
        
        $("#nav-bar").show();
        
        $("#back_main").click(function(){
                              $.mobile.changePage("template-sub_template.html");
                              });
				  
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
    }
}
