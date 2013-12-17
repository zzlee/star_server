var template = {};
var imageUgcInstance = null;
var remotesite = serverUrl;
var url = domainUrl;


/** Choose one image template */
template.choosePicFile = function(){
//	console.log("[template.choosePicFile]");
	localStorage.selectedTemplate = "wow_pic";
	localStorage.selectedSubTemplate = "picture_only";
	localStorage.text = "";
	template.genImage(localStorage.selectedTemplate, localStorage.selectedSubTemplate, localStorage.text);
	
};

/** Choose photo and text template */
template.choosePicTextFile = function(){
	localStorage.selectedTemplate = "wow_pic_text";
	localStorage.selectedSubTemplate = "picture_plus_text";
	window.location = serverUrl + "/upload_text.html";
//	$("#wow_pic_text").click(function(){
//		document.getElementById('wow_pic_text').addEventListener('change', template.handleFileSelected, true);	
//	});
	
};

/** To catch photo selected from your local system. */
template.handleFileSelected = function(event){
	console.log("[template.handleFileSelected]");
	var files = event.target.files; // FileList object
	var reader = new FileReader();
	// Closure to capture the file information.
	reader.onload = (function(theFile) {
	         			return function(e) {
	            		// Render thumbnail.
	            		console.log("selected photo : " + e.target.result);
	            		localStorage.setItem('selectedPhoto', e.target.result);
	         			};
				})(files[0]);
	            //Read in the image file as a data URL.
	reader.readAsDataURL(files[0]);
	if(localStorage.selectedPhoto != undefined){
		alert("請重新選擇圖片。");
	}
	
};

/** Start to generate Image */
template.genImage = function(selectedTemplate, selectedSubTemplate, text){
	console.log("[template.genImage]");
	var userContent = {
			text: text,
			picture: {
				urlOfOriginal: null, //the URL of the original picture that the user chooses
				urlOfOriginalIsFromAndroidAlbum: false, //A flag to indicate that the picture is from Android album.  This is used to overcome the problem that photos taken from Android photo album does not contnet any file extension
				urlOfCropped: localStorage.selectedPhoto, //the URL of the picture that the user crops. (It is normally a base64 string got from canvas.toDataURL() )
				crop: {_x:0, _y:0, _w:0, _h:0},  // _x=x_crop/width_picture; _y=y_crop/height_picture; _w=width_crop/width_picture;  _h=height_crop/height_picture
			},
			thumbnail:{
//				url:'https://graph.facebook.com/'+ localStorage.fb_userID+'/picture?width=200&height=200' //Android
				url: localStorage.profilePhoto
	    
			}
	};
	console.log("userContent: ");
	console.dir(userContent);
	localStorage.longImageUrl = null;
	localStorage.doohPreviewImageUrl = null;
	//wow_pic, wow_pic_text 
	ImageUgc.getInstance(selectedTemplate, selectedSubTemplate , userContent, function(err, _imageUgc) {
        if (!err) {
            imageUgcInstance = _imageUgc;
            localStorage.longImageUrl = imageUgcInstance.getImageUrl();
            localStorage.doohPreviewImageUrl = imageUgcInstance.getDoohPreviewImageUrl();
            localStorage.customizableObjects = imageUgcInstance.getCustomizableObjects();
            window.location = remotesite + "/preview.html";
         }else{
        	 console.log(err);
         }
	});
	
};


template.uploadToServer = function(){
	var ugcInfo = {
			ownerId:{
				_id : localStorage._id,
				fbUserId : localStorage.fbId
			},
			contentGenre : localStorage.selectedTemplate,
			title : "today'smood"
	};
    var ugcProjectId = localStorage.selectedTemplate +'-'+ ugcInfo.ownerId._id +'-'+ (new Date()).toISOString().replace(/[-:.]/g, "");
    var reultURI = localStorage.longImageUrl.replace('image/octet-stream');
    var doohPreviewResultURI = localStorage.doohPreviewImageUrl.replace('image/octet-stream');
	
    //upload result image UGC to server
    $.ajax( url+"/miix/base64_image_ugcs/" + ugcProjectId, {
        type: "PUT",
        data: {
            imgBase64: reultURI,
            imgDoohPreviewBase64: doohPreviewResultURI,
            ownerId: ugcInfo.ownerId._id,
            ownerFbUserId: ugcInfo.ownerId.fbUserId,
            contentGenre: "mood",
            title: ugcInfo.title,
            customizableObjects: localStorage.customizableObjects,
            miixToken: localStorage.miixToken,
            time: (new Date()).getTime()
        },
        success: function(data, textStatus, jqXHR ){
            console.log("Successfully upload result image UGC to server.");
//            callback(null);
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log("Failed to upload image UGC to server: "+errorThrown);
//            callback("Failed to upload image UGC to server: "+errorThrown);
        }
    });
	
}