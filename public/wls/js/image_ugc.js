

ImageUgc = (function(){
        
    function constructor(mainTemplateId, subTemplateId, userContent, cb_constructor){
        
        //object's private members		
        var DOOH_ID = "taipei_arena";
        var templateMgr = null;
        var template = null;
        var doohPreviewTemplate = null;
        var doohPreview = null;
        var ugcCanvas = null;
        var context = null;
        var customizableObjects = [];
        

        var obj = {
            //==public services of ImageUgc==
            /**
             * Get the URL of this image UGC
             */
            getImageUrl: function(){
                return ugcCanvas.toDataURL('image/png');
            },
            
            /**
             * Get the URL of the DOOH preview of this image UGC
             */
            getDoohPreviewImageUrl: function(){
                return doohPreview.getPreviewImageUrl();  
            },
            /**
             *  Get the object of meta data
             */
            getCustomizableObjects: function(){
            	return JSON.stringify(customizableObjects);
            },
            
            /**
             * Upload the UGC to server
             * 
             * @param ugcProjectId
             * @param ugcInfo
             * @param cbOfUploadToServer
             */
            uploadToServer:function(ugcInfo, cbOfUploadToServer){
//                var ugcProjectId = mainTemplateId +'-'+ ugcInfo.ownerId._id +'-'+ (new Date()).toISOString().replace(/[-:.]/g, "");
            	var ugcProjectId = ugcInfo.projectId;
                var reultURI = ugcCanvas.toDataURL('image/png').replace('image/octet-stream');
                var doohPreviewResultURI = doohPreview.getPreviewImageUrl().replace('image/octet-stream');
//                var dataJsonFile = null;
                
                async.series([
                    function(callback){
                        //upload result image UGC to server
                        $.ajax("/miix/web/base64_image_ugcs/" + ugcProjectId, {
                            type: "PUT",
                            data: {
                                imgBase64: reultURI,
                                imgDoohPreviewBase64: doohPreviewResultURI,
                                ownerId: ugcInfo.ownerId._id,
                                ownerFbUserId: ugcInfo.ownerId.fbUserId,
                                contentGenre: "wls",
                                title: ugcInfo.title,
                                //customizableObjects: JSON.stringify(customizableObjects),
								customizableObjects: localStorage.customizableObjects,
                                miixToken: "53768608",
                                time: (new Date()).getTime()
                            },
                            success: function(data, textStatus, jqXHR ){
                                console.log("Successfully upload result image UGC to server.");
                                callback(null);
                            },
                            error: function(jqXHR, textStatus, errorThrown){
                                console.log("Failed to upload image UGC to server: "+errorThrown);
                                callback("Failed to upload image UGC to server: "+errorThrown);
                            }
                        });
                    }
                ],
                function(err, results){
                    if (cbOfUploadToServer){
                        cbOfUploadToServer(err, results);
                    }
                });
                
                
            }
            //==end of public services of ImageUgc==
        };
        
        async.series([
            function(callback){
                //get templateMgr
                TemplateMgr.getInstance(function(err, _templateMgr){
                    var userContentUri = null;
                    var userContentFileName = null;
                    if (!err) {
                        templateMgr = _templateMgr;
                        template = templateMgr.getSubTemplate(mainTemplateId, subTemplateId);
                        doohPreviewTemplate = templateMgr.getDoohPreviewTemplate(mainTemplateId, subTemplateId, DOOH_ID);
                        var templateCustomizableObjects = template.customizableObjects;
                        for (var i=0;i<templateCustomizableObjects.length;i++){
                            customizableObjects[i] = {
                                    id: templateCustomizableObjects[i].id,
                                    type: templateCustomizableObjects[i].type
                            };
                            if (customizableObjects[i].type == "text"){
                                customizableObjects[i].content = userContent.text;
                            }
                            else if (customizableObjects[i].type == "image"){
                                userContentUri = userContent.picture.urlOfOriginal;
                                if (userContentUri){
                                 //   userContentFileName = userContentUri.substr(userContentUri.lastIndexOf('/')+1);
									userContentFileName = userContentUri;
                                }
                                customizableObjects[i].content = userContentFileName;
                            }
                        }
                        
                        callback(null, obj);
                    }
                    else {
                        callback('Failed to get TemplateMgr instance :'+err, null);
                    }
                });
            },
            function(callback){
                //initiate canvas related variables
                bgImage_long = null;
                ugcCanvas = document.createElement('canvas');
                ugcCanvas.setAttribute("id","ugcCanvas");
                
                context = ugcCanvas.getContext('2d');
                context.webkitImageSmoothingEnabled = true;
                bgImage_long = new Image();
                bgImage_long.src = template.backgroundImageUrl; //TODO: TemplateMgr output cleaner url
                bgImage_long.onload = function(){
                    //ugcCanvas.width = bgImage.width;
                    //ugcCanvas.height = bgImage.height;
                		 ugcCanvas.width = bgImage_long.width;
                    	ugcCanvas.height = bgImage_long.height;
                   		 context.drawImage(bgImage_long,0,0);
                    callback(null);
                };
                bgImage_long.onerror = function(){
                    callback("Failed to load the background image "+imageUrl);
                };
                bgImage_long.onabort = function(){
                    callback("Failed to load the background image "+imageUrl+" (aborted)");
                };
            },
            function(callback){
                //draw the customizable objects

				var imageUrl = userContent.picture.urlOfCropped;
				//template.customizableObjects
				for(var i = 0 ; i < template.customizableObjects.length ; i++){
					if(i < 2){
						ugcUtility.drawImage( context, imageUrl, template.customizableObjects[i].x, template.customizableObjects[i].y, template.customizableObjects[i].width, template.customizableObjects[i].height, template.customizableObjects[i].angle, function(errOfDrawImage){
							callback(errOfDrawImage);
						});
					}else{
						break;
						callback(null);
					}
				}
				
				/*
                var imageUrl = null;
                var iteratorDrawCustomizalbeObjects = function(aCustomizableObject, cbOfIterator){
					
                    if (aCustomizableObject.type == "image"){
                        imageUrl = userContent.picture.urlOfCropped;
                        ugcUtility.drawImage( context, imageUrl, aCustomizableObject.x, aCustomizableObject.y, aCustomizableObject.width, aCustomizableObject.height, aCustomizableObject.angle, function(errOfDrawImage){
                            cbOfIterator(errOfDrawImage);
                        });
                    }
					
                    else if (aCustomizableObject.type == "thumbnail"){
						
                        imageUrl = userContent.thumbnail.url;
						
                        ugcUtility.drawFbNameText( context, localStorage.fb_name, aCustomizableObject.fb_x, aCustomizableObject.fb_y, aCustomizableObject.fbNameWidth, aCustomizableObject.lineHeight, aCustomizableObject.fb_angle,aCustomizableObject.fb_color);
                        ugcUtility.drawImage( context, imageUrl, aCustomizableObject.x, aCustomizableObject.y, aCustomizableObject.width, aCustomizableObject.height, aCustomizableObject.angle, function(errOfDrawImage){
                            if(aCustomizableObject.x2){
                                ugcUtility.drawImage(context, imageUrl, aCustomizableObject.x2, aCustomizableObject.y2, aCustomizableObject.width, aCustomizableObject.height, aCustomizableObject.angle, function(errOfDrawImage){
                                    cbOfIterator(errOfDrawImage);
                                });
                            }
                            else {
                                cbOfIterator(errOfDrawImage);
                            }
                        });
						
                    }
                    else if (aCustomizableObject.type == "text"){
                        ugcUtility.drawChineseText( context, userContent.text, aCustomizableObject.x, aCustomizableObject.y, aCustomizableObject.width, aCustomizableObject.lineHeight, aCustomizableObject.angle,aCustomizableObject.fontColor);
                        cbOfIterator(null);
                    }
					
                };
                async.eachSeries(template.customizableObjects, iteratorDrawCustomizalbeObjects, function(err){
                    if (!err) {
                        callback(null);
                    }
                    else {
                        callback('Failed to draw the customizable objects: '+err);
                    }
                });
				
				*/
            },
            function(callback){
                //create DOOH preview
                if (doohPreviewTemplate){
                    //var ugcDoohPreviewBgImageUrl = templateMgr.getTemplateFolderPath(mainTemplateId)+mainTemplateId+'/'+subTemplateId+'/'+doohPreviewTemplate.backgroundImageUrl; //TODO: TemplateMgr output cleaner url
                    //var customizableObjects = doohPreviewTemplate.customizableObjects;
                    DoohPreview.getInstance(DOOH_ID, doohPreviewTemplate, userContent, function(errOfGetInstance, _doohPreview){
                        if (!errOfGetInstance){
                            doohPreview = _doohPreview;
                            callback(null);
                        }
                        else {
                            callback('Failed to create DOOH preview instance: '+errOfGetInstance);
                        }
                        
                    });
                }
                else {
                    callback('Failed to get DOOH preview template');
                }
            }
        ],
        function(err, results){
            if (!err) {
                cb_constructor(null, obj);
            }
            else {
                cb_constructor('Failed to initiate an ImageUgc object: '+err, null);
//            	cb_constructor("您忘了選擇圖片！", null);
            }
        });
    }
    
    return {
        getInstance: function(mainTemplateId, subTemplateId, userContent, got_cb){
                constructor(mainTemplateId, subTemplateId, userContent, function(err, _uInstance){
                    got_cb(err, _uInstance);
                });
        }
    };
})();

