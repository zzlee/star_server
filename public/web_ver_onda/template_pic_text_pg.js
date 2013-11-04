FmMobile.template_pic_text_pg = {
	//  Page constants.
PAGE_ID: "template_pic_text_pg",
    
    //  Page methods.
show: function(){
   // FmMobile.analysis.trackPage("/template_pic_text_pg");
//recordUserAction("enters template_pic_text_pg");
    FmMobile.dummyDiv();
    /* ------  prefill user's previous text   ---- */
    if(FmMobile.userContent.text){
        FmMobile.userContent.text=FmMobile.userContent.text.replace(/\<n\>/ig,"\n");
        $("#ur_text").val(FmMobile.userContent.text);
    }

    /* ------ end of prefill user's previous text   ---- */
},
    
load: function(event, data){
    
	document.addEventListener("showkeyboard", function() {
		 if(device.platform != "Android"){
		 }else{
		 	$("#nav-bar").hide();
		 }
}, false);

document.addEventListener("hidekeyboard", function() {
        if(device.platform != "Android"){
		 }else{
		 	$("#nav-bar").show();
		 }
}, false);
    

   // FmMobile.userContent.text="aa";
    var textForUgcUtility;
    
    $("#ur_text").bind("blur",function(){
                        $("#nav-bar").show();
                       textForUgcUtility= $("#ur_text").val().replace(/\n/g,"<n>");
                       FmMobile.userContent.text=textForUgcUtility;
                       });
    
    
    $("#ur_text").bind("tap",function(){
                      $("#nav-bar").hide();
                       });
    
    
    $("#ur_text").keyup(function(){
                        var moreLineInBox=$("#ur_text").val();
                        moreLineInBox=$("#ur_text").val().replace(/\n/g,"<n>");
                        var moreLineInBox_2=moreLineInBox.split("<n>");
                        if(moreLineInBox_2.length>3){
                        FmMobile.showNotification("inAreaTextOver");
                        $("#ur_text").val(moreLineInBox_2[0]+"\n"+moreLineInBox_2[1]+"\n"+moreLineInBox_2[2]);
                        return false;
                        }
                        });
   
    //$("#nav-bar").show();
    
    
    $("#back_main").click(function(){
                          $.mobile.changePage("template-sub_template.html");
                          });
    
    
    $('#template_top_img_text_pic').attr({src:FmMobile.selectedTemplateBarImg});
    
    
    
    
    var url = $(this).data('url');
    
    
    
    var itemContentIsReady;
    
    
    
    var buttonClick_cb = function(event, ui) {
        
        console.log('button clicked!');
        //fileObjectID = event.data.objectID;
        //console.log('[buttonClick_cb()] fileObjectID = %s', fileObjectID);
        //alert('fileObjectID = '+fileObjectID );
        if($("#ur_text").val().length==0 ||$("#ur_text").val()==" "){
            FmMobile.showNotification("nullText");
        }else{
            
            var check_format= FmMobile.userContent.text.split("<n>");
            //FmMobile.userContent.text=check_format;
            if(check_format.length>3){
                FmMobile.showNotification("moreLines");
                return false;
                //alert("more than 4 lines!");
            }
            
            if(check_format[0].length >8){
                
                FmMobile.showNotification("moreWords");
                return false;
                
                
            }
            if(check_format[1] != undefined){
                if(check_format[1].length >8 ){
                    FmMobile.showNotification("moreWords");
                    return false;
                    
                }
            }
            
            if(check_format[2] != undefined){
                if(check_format[2].length >8 ){
                    FmMobile.showNotification("moreWords");
                    return false;
                    
                }
            }
        
        var getPhotoFail = function (message) {
            //alert('�⊥��詨����������活��);
        }
        
        
        var gotoPhotoCropper = function (imageURI) {
            
            FmMobile.userContent.picture.urlOfOriginal = imageURI;
            
            if ( (device.version > "6") && (device.platform != "Android")) {
                
                //Here is the workaround for iOS 6.0 and 6.0.1 subsampling issue (when drawing from a more-than-2M jpg to canvas)
                var tempImg = new Image();
                tempImg.src = imageURI;
                tempImg.onload = function() {
                    EXIF.getData( tempImg, function(){
                                 var orientation = EXIF.getTag(tempImg, "Orientation");
                                 subsamplingResize(imageURI, { maxWidth: 960, maxHeight: 960, orientation: orientation }, function(resultURI){
                                                   fileProcessedForCropperURI = resultURI;
                                                   $.mobile.changePage("template-photo_cropper.html");
                                                   });
                                 });
                    
                };
                
                
            }
            else {
               var tempImg = new Image();
                    tempImg.src = imageURI;
                    tempImg.onload = function() {
                        EXIF.getData( tempImg, function(){
                                     var orientation = EXIF.getTag(tempImg, "Orientation");
                                     subsamplingResize(imageURI, { maxWidth: 960, maxHeight: 960, orientation: orientation }, function(resultURI){
                                                       fileProcessedForCropperURI = resultURI;
                                                       $.mobile.changePage("template-photo_cropper.html");
                                                       });
                                     });
                        
                    }; 
                
            }
            
            console.log("version="+device.version);
            
        };
        
        if ( event.data.photoSource == "album" ) {
            navigator.camera.getPicture(gotoPhotoCropper, getPhotoFail,{
                                        quality: 50,
                                        destinationType: navigator.camera.DestinationType.FILE_URI,
                                        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                                        targetWidth: 1500,
                                        targetHeight: 1500
                                        });
            //FmMobile.analysis.trackEvent("Button", "Click", "album", 1);
        }
        else {
            navigator.camera.getPicture(gotoPhotoCropper, getPhotoFail,{
                                        quality: 50,
                                        destinationType: navigator.camera.DestinationType.FILE_URI,
                                        sourceType: navigator.camera.PictureSourceType.CAMERA,
                                        targetWidth: 1500,
                                        targetHeight: 1500
                                        });
            //FmMobile.analysis.trackEvent("Button", "Click", "camera", 1);
        }
    
        }
    };
    
    $('#btnUseCamera').bind( "click", { photoSource: "camera" }, buttonClick_cb);
    $('#btnUseAlbum').bind( "click", { photoSource: "album" }, buttonClick_cb);
    
    
}
}