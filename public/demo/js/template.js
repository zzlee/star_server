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
//template.choosePicTextFile = function(){
//
//	window.location = serverUrl + "/upload_text.html";
//	
//};

/** To catch photo selected from your local system. */
template.handleFileSelected = function(event){
	var files = event.target.files; // FileList object
//	var reader = new FileReader();
	
	
	var reader = new FileReader();
        // do sth.
        	// Closure to capture the file information.
        	reader.onload = (function(theFile) {
        	         			return function(e) {
        	            		// Render thumbnail.
//        	            		alert("selected photo : " + e.target.result);
        	            		localStorage.setItem('selectedPhoto', e.target.result);
        	         			};
        				})(files[0]);
        	            //Read in the image file as a data URL.
        	reader.readAsDataURL(files[0]);

//	if(localStorage.selectedPhoto == undefined){
//		alert("請重新選擇圖片。");
//	}
//	alert(localStorage.selectedPhoto);
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
//	console.log("userContent: ");
//	console.dir(userContent);
	localStorage.longImageUrl = null;
	localStorage.doohPreviewImageUrl = null;
	//wow_pic, wow_pic_text 
	ImageUgc.getInstance(selectedTemplate, selectedSubTemplate , userContent, function(err, _imageUgc) {
        if (!err) {
            imageUgcInstance = _imageUgc;
            localStorage.longImageUrl = imageUgcInstance.getImageUrl();
            localStorage.doohPreviewImageUrl = imageUgcInstance.getDoohPreviewImageUrl();
            localStorage.customizableObjects = imageUgcInstance.getCustomizableObjects();
            //window.location = remotesite + "/preview.html";
            template.uploadToServer();
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
			title : "today's mood"
	};
    var ugcProjectId = localStorage.selectedTemplate +'-'+ ugcInfo.ownerId._id +'-'+ (new Date()).toISOString().replace(/[-:.]/g, "");
    var reultURI = localStorage.longImageUrl.replace('image/octet-stream');
    var doohPreviewResultURI = localStorage.doohPreviewImageUrl.replace('image/octet-stream');
    
    async.series([
                      function(callback){
                          //upload original image user content file to server if there is one
                          var iterator = function(aCustomizableObject, cbOfIterator) {
//                                console.dir(aCustomizableObject);
                              if ((aCustomizableObject.type=="image") || (aCustomizableObject.type=="video") ) { 
                                  var options = {};
                                  options.fileKey = "file";
                                  options.fileName = aCustomizableObject.content;
                                  options.mimeType = "image/jpeg"; //TODO: to have mimeType customizable? 
                                  options.chunkedMode = true;
                                
//                                  var templateCustomizableObjects = template.customizableObjects;
//                                  var imageCustomizableObjectWidth = null;
//                                  var imageCustomizableObjectHeight = null;
//                                  for (var i=0;i<templateCustomizableObjects.length;i++){
//                                      if (templateCustomizableObjects[i].type == "image"){
//                                          imageCustomizableObjectWidth = templateCustomizableObjects[i].width;
//                                          imageCustomizableObjectHeight = templateCustomizableObjects[i].height;
//                                          break;
//                                      }
//                                  }
                                  
                                  var params = {};
                              	var userContent = {
                            			text: null,
                            			picture: {
                            				urlOfOriginal: null, //the URL of the original picture that the user chooses
                            				urlOfOriginalIsFromAndroidAlbum: false, //A flag to indicate that the picture is from Android album.  This is used to overcome the problem that photos taken from Android photo album does not contnet any file extension
                            				urlOfCropped: localStorage.selectedPhoto, //the URL of the picture that the user crops. (It is normally a base64 string got from canvas.toDataURL() )
                            				crop: {_x:0, _y:0, _w:0, _h:0},  // _x=x_crop/width_picture; _y=y_crop/height_picture; _w=width_crop/width_picture;  _h=height_crop/height_picture
                            			},
                            			thumbnail:{
//                            				url:'https://graph.facebook.com/'+ localStorage.fb_userID+'/picture?width=200&height=200' //Android
                            				url: localStorage.profilePhoto
                            	    
                            			}
                            	};
                                  params.projectID = ugcProjectId; //for server side to save user content to specific project folder
                                  //for server side to crop the user content image
                                  params.croppedArea_x = userContent.picture.crop._x;
                                  params.croppedArea_y = userContent.picture.crop._y;
                                  params.croppedArea_width = userContent.picture.crop._w;
                                  params.croppedArea_height = userContent.picture.crop._h;
                                  //for server side to zoom the user content image to the same size as original footage image
//                                  params.obj_OriginalWidth = imageCustomizableObjectWidth;
//                                  params.obj_OriginalHeight = imageCustomizableObjectHeight;
                                  params.miixToken = localStorage.miixToken;
                                  
                                  options.params = params;
                                  console.dir(options);
                                  $.ajax( url+"/test", {
                                      type: "POST",
                                      data: options,
                                      success: function(data, textStatus, jqXHR ){
                                          console.log("Successfully upload result image UGC to server.");
                                          callback(null);
                                      },
                                      error: function(jqXHR, textStatus, errorThrown){
                                          console.log("Failed to upload image UGC to server: "+errorThrown);
                                          callback("Failed to upload image UGC to server: "+errorThrown);
                                      }
                                  });
                                  
//                                  ft.upload(userContent.picture.urlOfOriginal, , uploadSuccess_cb, uploadFail_cb, options);
                              }
                              else {
                                  cbOfIterator(null);
                              }
                          };
                          var tmpCustomObj = JSON.parse(localStorage.customizableObjects);
                          async.eachSeries(tmpCustomObj, iterator, function(errOfEachSeries){
                        	  console.log("callback");
                              callback(errOfEachSeries);
                          });
                          
                      },
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