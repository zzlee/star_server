FmMobile.template_pic_pg = {
	//  Page constants.
    PAGE_ID: "template_pic_pg",
    
    //  Page methods.
    show: function(){
      //  FmMobile.analysis.trackPage("/template_pic_pg");
//        recordUserAction("enters template_pic_pg");
        FmMobile.dummyDiv();
    },
    
    load: function(event, data){
	/*
	var elephant = document.getElementById("elephant");
	
	elephant.addEventListener("load", function () {
    alert("fff");
    var imgCanvas = document.createElement("canvas"),
        imgContext = imgCanvas.getContext("2d");
 
    // Make sure canvas is as big as the picture
    imgCanvas.width = elephant.width;
    imgCanvas.height = elephant.height;
 
    // Draw image into canvas element
    imgContext.drawImage(elephant, 0, 0, elephant.width, elephant.height);
 
    // Get canvas contents as a data URL
    var imgAsDataURL = imgCanvas.toDataURL("image/png");
 
    // Save image into localStorage
    try {
        localStorage.setItem("elephant", imgAsDataURL);
        alert("good!");
    }
    catch (e) {
        alert("ff");
        console.log("Storage failed: " + e);
    }
}, false); 
	
	*/
	
	
	
        FmMobile.userContent.text=null;
        
        //FmMobile.bindClickEventToNavBar();
        
        $("#nav-bar").show();
        /*
        if ( localStorage._id ) {
            userName = localStorage._id;
        }
        else {
            userName = "anonymous";
        }
        */
        
        
       // if(FmMobile.selectedTemplate=="cultural_and_creative"){
            
        $("#back_main").click(function(){
                              $.mobile.changePage("template-sub_template.html");
                              });
							  
							  
							   $("#go_cropper").click(function(){
							      if(localStorage.imgForCropper == undefined){
								  alert("妳什麼都沒選...");
								  return false;
								  }
							   
							   fileProcessedForCropperURI = localStorage.imgForCropper;
							   FmMobile.userContent.picture.urlOfOriginal = localStorage.imgForCropper;
                                $.mobile.changePage("template-photo_cropper.html");
                              });
							  
        
        
       $('#template_top_img_pic').attr({src:FmMobile.selectedTemplateBarImg});        
        //$('#template_name_2').html(FmMobile.selectedTemplateName);
        
        /*
        if(FmMobile.selectedTemplate=="cultural_and_creative"){
                        $("#template_name_3").html('').append(templateMgr.getTemplateList()[0].name);
        }else if(FmMobile.selectedTemplate=="mood"){
            $("#template_name_3").html('').append(templateMgr.getTemplateList()[1].name);
        }else if(FmMobile.selectedTemplate=="miix_it"){
             $("#template_name_3").html('').append(templateMgr.getTemplateList()[3].name);
        }
         */

        
        
        
        var url = $(this).data('url');
        
        
        
        var itemContentIsReady;
        
        //-------------------------------------------------------------------
		
		  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
  //  for (var i = 0, f; f = files[i]; i++) {

      // Only process image files.
     // if (!files[0].type.match('image.*')) {
       // continue;
      //}

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
          var span = document.createElement('span');
          span.innerHTML = ['<img class="thumb" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
            
            //alert("ww");
          localStorage.setItem('imgForCropper', e.target.result);
                      document.getElementById('list').src= localStorage.imgForCropper;

        };
      })(files[0]);

      // Read in the image file as a data URL.
      reader.readAsDataURL(files[0]);
   // }
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);

/*
  if(localStorage.imgForCropper) { 
 
         var span = document.createElement('span');
          span.innerHTML = ['<img class="thumb" src="', localStorage.imgForCropper,
                            '" title="test"/>'];

          //document.getElementById('list').insertBefore(span, null);
    
    }*/
		//------------------------------------------------------------------
        
        var buttonClick_cb = function(event, ui) {
		alert("tt");
		
            /*
            console.log('button clicked!');
            //fileObjectID = event.data.objectID;
            //console.log('[buttonClick_cb()] fileObjectID = %s', fileObjectID);
            //alert('fileObjectID = '+fileObjectID );
            
            
            var getPhotoFail = function (message) {
                //alert('没�到��，�選一次�');
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
                                     //alert(orientation);
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
                console.log("version="+device.platform+"\n"+device.version);
                
            };
            
            if ( event.data.photoSource == "album" ) {
                navigator.camera.getPicture(gotoPhotoCropper, getPhotoFail,{
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                                             targetWidth: 1500,
                                            targetHeight: 1500
                                            });
               // FmMobile.analysis.trackEvent("Button", "Click", "album", 1);
            }
            else {
                navigator.camera.getPicture(gotoPhotoCropper, getPhotoFail,{
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            targetWidth: 1500,
                                            targetHeight: 1500
                                            });
               // FmMobile.analysis.trackEvent("Button", "Click", "camera", 1);
            }
			
			*/
        };
        
        $('#btnUseCamera').bind( "click", { photoSource: "camera" }, buttonClick_cb);
        $('#btnUseAlbum').bind( "click", { photoSource: "album" }, buttonClick_cb);
        
        
    }
}
