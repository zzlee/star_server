

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
             * Upload the UGC to server
             * 
             * @param ugcProjectId
             * @param ugcInfo
             * @param cbOfUploadToServer
             */
            uploadToServer:function(ugcInfo, cbOfUploadToServer){
                var ugcProjectId = mainTemplateId +'-'+ "100006239742920" +'-'+ (new Date()).toISOString().replace(/[-:.]/g, "");
                var reultURI = ugcCanvas.toDataURL('image/png').replace('image/octet-stream');
                var doohPreviewResultURI = doohPreview.getPreviewImageUrl().replace('image/octet-stream');
                var dataJsonFile = null;
                
                async.series([
				/*
                    function(callback){
                        //upload original image user content file to server if there is one
                        var iterator = function(aCustomizableObject, cbOfIterator) {
                              console.dir(aCustomizableObject);
                            if ((aCustomizableObject.type=="image") || (aCustomizableObject.type=="video") ) { 
                                var options = new FileUploadOptions();
                                options.fileKey = "file";
                                options.fileName = aCustomizableObject.content;
                                options.mimeType = "image/jpeg"; //TODO: to have mimeType customizable? 
                                options.chunkedMode = true;
                              
                                var templateCustomizableObjects = template.customizableObjects;
                                var imageCustomizableObjectWidth = null;
                                var imageCustomizableObjectHeight = null;
                                for (var i=0;i<templateCustomizableObjects.length;i++){
                                    if (templateCustomizableObjects[i].type == "image"){
                                        imageCustomizableObjectWidth = templateCustomizableObjects[i].width;
                                        imageCustomizableObjectHeight = templateCustomizableObjects[i].height;
                                        break;
                                    }
                                }
                                
                                var params = {};
                                params.projectID = ugcProjectId; //for server side to save user content to specific project folder
                                //for server side to crop the user content image
                                params.croppedArea_x = userContent.picture.crop._x;
                                params.croppedArea_y = userContent.picture.crop._y;
                                params.croppedArea_width = userContent.picture.crop._w;
                                params.croppedArea_height = userContent.picture.crop._h;
                                //for server side to zoom the user content image to the same size as original footage image
                                params.obj_OriginalWidth = imageCustomizableObjectWidth;
                                params.obj_OriginalHeight = imageCustomizableObjectHeight;
                                params.miixToken = localStorage.miixToken;
                                
                                options.params = params;
                                options.chunkedMode = true;
                                
                                var ft = new FileTransfer();
                                
                                ft.onprogress = function(progressEvent) {
                                    if (progressEvent.lengthComputable) {
                                        var uploadPercentage = progressEvent.loaded / progressEvent.total * 100;
                                        console.log("uploadPercentage=" + uploadPercentage.toString());
                                    } else {
                                        console.log("upload some chunk....");
                                    }
                                };
                                
                                var uploadSuccess_cb = function(r) {
                                    cbOfIterator(null);
                                };
                                
                                var uploadFail_cb = function(error) {
//                                    if(aCustomizableObject.type == "text"){
//                                        FmMobile.showNotification("uploadFailed");
//                                        $('#clickImgEffect').show("normal");
//                                        $('#afterClickBack').show("normal");
//                                        $('#afterClickSent').show("normal");
//                                        $.mobile.hidePageLoadingMsg();
//                                    }
                                    console.log("upload error source " + error.source);
                                    console.log("upload error target " + error.target);
                                    cbOfIterator("Failed to uplaod user content file to server: "+error.code);
                                };
                                
                                ft.upload(userContent.picture.urlOfOriginal, starServerURL+"/miix/videos/user_content_files", uploadSuccess_cb, uploadFail_cb, options);
                            }
                            else {
                                cbOfIterator(null);
                            }
                        };
                        async.eachSeries(customizableObjects, iterator, function(errOfEachSeries){
                            callback(errOfEachSeries);
                        });
                        
                    },*/
                    function(callback){
                        //upload result image UGC to server
                        $.ajax( starServerURL+"/miix/base64_image_ugcs/"+ugcProjectId, {
                            type: "PUT",
                            data: {
                                imgBase64: reultURI,
                                imgDoohPreviewBase64: doohPreviewResultURI,
                                ownerId: "5260a61b74b753c009000005",
                                ownerFbUserId: "100006239742920",
                                contentGenre: mainTemplateId,
                                title: ugcInfo.title,
                                customizableObjects: JSON.stringify(customizableObjects),
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
                    /*
                    function(callback){
                        //save uploading data to a json file
                        var data = {
                                imgBase64: reultURI,
                                imgDoohPreviewBase64: doohPreviewResultURI,
                                ownerId: ugcInfo.ownerId._id,
                                ownerFbUserId: ugcInfo.ownerId.fbUserId,
                                contentGenre: mainTemplateId,
                                title: ugcInfo.title,
                                customizableObjects: JSON.stringify(customizableObjects)
                            };
                        
                        function gotFS(fileSystem) {
                            fileSystem.root.getFile("data.json", {create: true, exclusive: false}, gotFileEntry, fail);
                        }

                        function gotFileEntry(fileEntry) {
                            fileEntry.createWriter(gotFileWriter, fail);
                        }

                        function gotFileWriter(writer) {
                            writer.onwriteend = function(evt) {
                                callback(null);
                            };
                            writer.write(JSON.stringify(data));
                        }

                        function fail(error) {
                            //console.log(error.code);
                            callback("Failed to save the uploading data to a json file: "+error.code);
                        }
                        
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

                    } */
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
                var bgImage = null;
                ugcCanvas = document.createElement('canvas');
                ugcCanvas.setAttribute("id","ugcCanvas");
                
                context = ugcCanvas.getContext('2d');
                context.webkitImageSmoothingEnabled = true;
                bgImage = new Image();
                bgImage.src = template.backgroundImageUrl; //TODO: TemplateMgr output cleaner url
                bgImage.onload = function(){
                    //ugcCanvas.width = bgImage.width;
                    //ugcCanvas.height = bgImage.height;
                		 ugcCanvas.width = 1743;
                    	ugcCanvas.height = 260;
                   		 context.drawImage(bgImage,0,0,1743,260);
                    callback(null);
                };
                bgImage.onerror = function(){
                    callback("Failed to load the background image "+imageUrl);
                };
                bgImage.onabort = function(){
                    callback("Failed to load the background image "+imageUrl+" (aborted)");
                };
            },
            function(callback){
                //draw the customizable objects
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

