var template = {};
var imageUgcInstance = null;
var remotesite = serverUrl;
var url = domainUrl;


/** Choose one image template */
template.choosePicFile = function(){
	localStorage.selectedTemplate = "wow_pic";
	localStorage.selectedSubTemplate = "picture_only";
	localStorage.text = "";
	template.genImage(localStorage.selectedTemplate, localStorage.selectedSubTemplate, localStorage.text);
	
};

/** Choose photo and text template */
template.choosePicTextFile = function(){

	window.location = serverUrl + "/upload_text.html";
	
};

/** To catch photo selected from your local system. */
template.handleFileSelected = function(event){
	var files = event.target.files; // FileList object
	var reader = new FileReader();
	// Closure to capture the file information.
	reader.onload = (function(theFile) {
	         			return function(e) {
	            		// Render thumbnail.
//	            		console.log("selected photo : " + e.target.result);
	            		localStorage.setItem('selectedPhoto', e.target.result);
	         			};
				})(files[0]);
	            //Read in the image file as a data URL.
	reader.readAsDataURL(files[0]);
//	if(localStorage.selectedPhoto == undefined){
//		alert("請重新選擇圖片。");
//	}
	
};

/** Start to generate Image */
template.genImage = function(selectedTemplate, selectedSubTemplate, text){
//	console.log("[template.genImage]");
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
        	 alert(err);
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
    
    async.series([
                  function(callback){
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
                	        	console.log("Upload result image UGC to server");
                	            callback(null);
                	        },
                	        error: function(jqXHR, textStatus, errorThrown){
                	            callback("Failed to upload image UGC to server: "+errorThrown);
                	        }
                	    });
                  },
                  function(callback){
	                  var settings_push_after_confirm = {
	                          type: "PUT",
	                          cache: false,
	                          asycn:false,
	                          data:{ 
	                              miixToken: localStorage.miixToken,
	                              vjson: {
	                                  read: true
	                              }
	                          },
	                          success: function(data, textStatus, jqXHR ){
	                        	  //Do nothing
	                          },
	                          error: function(jqXHR, textStatus, errorThrown){
	                        	  //Do Nothing
	                          }                       
	                  };
	                  var settings_push_center = {
	                          type: "GET",
	                          cache: false,
	                          data:{ miixToken: localStorage.miixToken },
	                          success: function(data, textStatus, jqXHR ){
	                              var iterator = function(aPush){
//	                            	  console.log('push msg: ' + aPush.content);
                                      alert(aPush.content.substring(0,14) + "排定時段後，你會收到facebook預告，通知播出日期時間。");
                                      //Let DB know user read the msg
                                      $.ajax(url + "/miix/message/" + aPush._id ,settings_push_after_confirm);
	                              };
	                              async.eachSeries(data, iterator, function(err, results){
	                                  if (!err){
//	                                	  console.log("async.eachSeries no error");
	                                      callback(null);
	                                  }
	                                  else {
	                                	  callback('Failed to change the read value of db to true: '+err);
	                                  }
	                              });
	                          },
	                          error: function(jqXHR, textStatus, errorThrown){
	                              callback("settings_push_center " + errorThrown);
	                          }                       
	                  };
	                  
	                  $.ajax(url + "/miix/members/" + localStorage._id + "/message", settings_push_center);
                  }],
                  function(err){
    					if(err){
    						alert(err);
    					}
    	
    			});//end of async.series
   
};