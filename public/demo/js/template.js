var template = {};
var imageUgcInstance = null;
var remotesite = serverUrl;

template.choosePicFile = function(){
	localStorage.selectedTemplate = "wow_pic";
	$("#wow_pic").click();
	document.getElementById('wow_pic').addEventListener('change', template.handleFileSelected, false);
	
};

template.choosePicTextFile = function(){
	localStorage.selectedTemplate = "wow_pic_text";
	$("#wow_pic_text").click();
	document.getElementById('wow_pic_text').addEventListener('change', template.handleFileSelected, false);
};

template.handleFileSelected = function(event){
	var files = eventt.target.files; // FileList object
	var reader = new FileReader();
	// Closure to capture the file information.
	reader.onload = (function(theFile) {
		return function(e) {
		  // Render thumbnail.
			console.log(e.target.result);
			localStorage.setItem('selectedPhoto', e.target.result);
		};
	})(files[0]);
		 // Read in the image file as a data URL.
	reader.readAsDataURL(files[0]);
	if(localStorage.selectedPhoto != undefined){
		template.genImage(localStorage.selectedTemplate);
	}
};


template.genImage = function(selectedTemplate, text){
//	var imageUgcInstance = null;
	var userContent = {
			text: null,
			picture: {
				urlOfOriginal: null, //the URL of the original picture that the user chooses
				urlOfOriginalIsFromAndroidAlbum: false, //A flag to indicate that the picture is from Android album.  This is used to overcome the problem that photos taken from Android photo album does not contnet any file extension
				urlOfCropped: null, //the URL of the picture that the user crops. (It is normally a base64 string got from canvas.toDataURL() )
				crop: {_x:0, _y:0, _w:0, _h:0},  // _x=x_crop/width_picture; _y=y_crop/height_picture; _w=width_crop/width_picture;  _h=height_crop/height_picture
			},
			thumbnail:{
//				url:'https://graph.facebook.com/'+ localStorage.fb_userID+'/picture?width=200&height=200' //Android
				url: ""
	    
			}
	};
	
	//wow_pic, wow_pic_text 
	ImageUgc.getInstance("mood", selectedTemplate , userContent, function(err, _imageUgc) {
        if (!err) {
            imageUgcInstance = _imageUgc;
            doohPreviewImageUrl = imageUgcInstance.getDoohPreviewImageUrl();
            window.location = remotesite + "/template-preview.html";
         }else{
//        	 console.log(err);
        	 alert(err);
         }
	});
	
};