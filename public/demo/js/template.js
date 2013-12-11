var template = {};
template.checkFile = function(template){
	 var fileElement = document.getElementById(inputId);
     var fileExtension = "";
     if (fileElement.value.lastIndexOf(".") > 0) {
         fileExtension = fileElement.value.substring(fileElement.value.lastIndexOf(".") + 1, fileElement.value.length);
     }
     if (fileExtension != "gif") {
    		 return true;
//    	 }else{
//    		 
//    	 }
    		 
     }else {
         alert("請選擇.jpg或是.gif的圖檔");
         return false;
     }
	
};

template.genImage = function(selectedTemplate){
	//wow_pic 
	ImageUgc.getInstance("mood", selectedTemplate , FmMobile.userContent, function(err, _imageUgc) {
        if (!err) {
            FmMobile.imageUgcInstance = _imageUgc;
//            FmMobile.viewerBackFlag='backPreview';
            FmMobile.imgForFullPageViewer=FmMobile.imageUgcInstance.getDoohPreviewImageUrl();
            $.mobile.changePage("template-preview.html");
//            $.mobile.hidePageLoadingMsg();
         }else{
         console.log(err);
             }
        });
	
};