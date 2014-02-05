

DoohPreview = (function(){
        
    function constructor(doohId, doohPreviewTemplate, userContent, cbOfConstructor){
        
        var doohInfo = null;
        var doohPreviewCanvas = null;
        var templateMgr = null
        var context = null;
        
        /**
         * function to draw an image on a specific quadrilateral <br>
         * 
         * The implementation so far is a temporary one using a rotated rectangle approximate the quadrilateral 
         * @param context
         * @param imageUrl
         * @param quadrilateral an object consisting the coordinates of four corners of the quadrilateral
         *     <ul>
         *     <li>x_ul, y_ul: the coordinates of upper left corner
         *     <li>x_ur, y_ur: the coordinates of upper right corner
         *     <li>x_ll, y_ll: the coordinates of lower left corner
         *     <li>x_lr, y_lr: the coordinates of lower right corner
         *     </ul>
         * @param cbOfDrawQuadrilateralImage
         */
        var drawQuadrilateralImage = function( context, imageUrl, quadrilateral, cbOfDrawQuadrilateralImage, alpha ){
            var q = quadrilateral;
            var width = Math.sqrt( (q.x_ur-q.x_ul)*(q.x_ur-q.x_ul)+(q.y_ur-q.y_ul)*(q.y_ur-q.y_ul) );
            var height = Math.sqrt( (q.x_ll-q.x_ul)*(q.x_ll-q.x_ul)+(q.y_ll-q.y_ul)*(q.y_ll-q.y_ul) );
            var angle = Math.atan( (q.y_ur-q.y_ul)/(q.x_ur-q.x_ul) )/Math.PI*180;
            ugcUtility.drawImage(context, imageUrl, q.x_ul, q.y_ul, width, height, angle, cbOfDrawQuadrilateralImage, alpha);
        };
        
        
        var obj = {
            //==public services of DoohPreview==
            /**
             * Get the URL of DOOH preview image
             */
            getPreviewImageUrl: function() {
                return doohPreviewCanvas.toDataURL('image/png');
            }
        };
        
        async.series([
            function(callback){
                //get DOOH preview info
                DoohInfo.getInstance(function(errOfGetDoohInfoInstance, _doohInfo){
                    if (!errOfGetDoohInfoInstance){
                        doohInfo = _doohInfo;
                        callback(null);
                    }
                    else {
                        callback('Failed to get DOOH preview info: '+errOfGetDoohInfoInstance);
                    }
                });
            },
            function(callback){
              //get templateMgr
                TemplateMgr.getInstance(function(err, _templateMgr){
                    if (!err) {
                        templateMgr = _templateMgr;
                        callback(null);
                    }
                    else {
                        callback('Failed to get TemplateMgr instance');
                    }
                });
            },
            function(callback){
                //initiate canvas related variables
                doohPreviewCanvas = document.createElement('canvas');
                doohPreviewCanvas.setAttribute("id","doohPreviewCanvas");
                
                context = doohPreviewCanvas.getContext('2d');
                context.webkitImageSmoothingEnabled = true;
                bgImage_dooh = null;
                bgImage_dooh = new Image();
                bgImage_dooh.src = doohPreviewTemplate.backgroundImageUrl;
                bgImage_dooh.onload = function(){
                    //console.log("bgImage.width="+bgImage.width+"  bgImage.height="+bgImage.height);
                   // doohPreviewCanvas.width = bgImage.width;
                    //doohPreviewCanvas.height = bgImage.height;
                      
//                      if(FmMobile.selectedTemplate=="miix_it"){
//                      doohPreviewCanvas.width = 720;
//                      doohPreviewCanvas.height = 405;
//                      context.drawImage(bgImage,0,0,720,405);
//                      }else{
                      doohPreviewCanvas.width = bgImage_dooh.width;
                      doohPreviewCanvas.height = bgImage_dooh.height;
                    context.drawImage(bgImage_dooh,0,0);
//                      }
                    callback(null);
                };
                bgImage_dooh.onerror = function(){
                    callback("Failed to load the background image "+doohPreviewTemplate.backgroundImageUrl);
                };
                bgImage_dooh.onabort = function(){
                    callback("Failed to load the background image "+doohPreviewTemplate.backgroundImageUrl+" (aborted)");
                };
            }, 
            function(callback){
                //draw the customizable objects
                var imageUrl = null;
                var iteratorDrawCustomizalbeObjects = function(aCustomizableObject, cbOfIterator){
                    if (aCustomizableObject.type == "image"){
                        imageUrl = userContent.picture.urlOfCropped;
                        drawQuadrilateralImage( context, imageUrl, aCustomizableObject.quadrilateral, function(errOfDrawQuadrilateralImage){
                            cbOfIterator(errOfDrawQuadrilateralImage);
                        }, aCustomizableObject.alpha);
                    }
                    else if (aCustomizableObject.type == "thumbnail"){
                        imageUrl = userContent.thumbnail.url;
                        ugcUtility.drawFbNameText( context, localStorage.fb_name, aCustomizableObject.fb_x, aCustomizableObject.fb_y, aCustomizableObject.width, aCustomizableObject.lineHeight, aCustomizableObject.fb_angle, aCustomizableObject.fb_color, aCustomizableObject.fb_font);
                        drawQuadrilateralImage( context, imageUrl, aCustomizableObject.quadrilateral, function(errOfDrawQuadrilateralImage){
                            if(aCustomizableObject.quadrilateral2){
                                drawQuadrilateralImage( context, imageUrl, aCustomizableObject.quadrilateral2, function(errOfDrawQuadrilateralImage){
                                    cbOfIterator(errOfDrawQuadrilateralImage);
                                });
                            }
                            else {
                                cbOfIterator(errOfDrawQuadrilateralImage);
                            }
                        });
                    }
                    else if (aCustomizableObject.type == "text"){
                        ugcUtility.drawChineseText( context, userContent.text, aCustomizableObject.x, aCustomizableObject.y, aCustomizableObject.width, aCustomizableObject.lineHeight, aCustomizableObject.angle, aCustomizableObject.fontColor, aCustomizableObject.font);
                        cbOfIterator(null);
                    }
                };
                async.eachSeries(doohPreviewTemplate.customizableObjects, iteratorDrawCustomizalbeObjects, function(err){
                    if (!err) {
                        callback(null);
                    }
                    else {
                        callback('Failed to draw the customizable objects: '+err);
                    }
                });
            }, 
            function(callback){
                //draw the cover image (such as the fence in Taipei Arena)
                var coverImage = null;
                coverImage = new Image();
                if (doohPreviewTemplate.coverImageUrl){
                    coverImage.src = doohPreviewTemplate.coverImageUrl;
                }
                else {
                    coverImage.src = doohInfo.getPreviewCoverImageUrl(doohId);
                }
                coverImage.onload = function(){
                    context.drawImage(coverImage,0,0);
                    callback(null);
                };
                coverImage.onerror = function(){
                    callback("Failed to load the cover image "+coverImage.src);
                };
                coverImage.onabort = function(){
                    callback("Failed to load the cover image "+coverImage.src+" (aborted)");
                };
            },
            function(callback){
                //resize doohPreviewCanvas
                if (doohPreviewTemplate.resizeFactor) {
                    ugcUtility.resizeCanvas(doohPreviewCanvas, doohPreviewTemplate.resizeFactor, doohPreviewTemplate.resizeFactor, function(){
                        callback(null);
                    });
                }
                else {
                    ugcUtility.resizeCanvas(doohPreviewCanvas, 0.4, 0.4, function(){
                        callback(null);
                    });
                }
                
            }
        ],
        function(err, results){
            if (!err) {
                cbOfConstructor(null, obj);
            }
            else {
                cbOfConstructor('Failed to initiate an DoohPreview object', null);
            }
        });
    }
    
    
    return {
        /**
         * Get an instance of DoohPreview
         * 
         * @param doohId
         * @param doohPreviewTemplate
         * @param userContent
         * @param cbOfgetInstance
         * @returns
         */
        getInstance: function(doohId, doohPreviewTemplate, userContent, cbOfgetInstance){
                constructor(doohId, doohPreviewTemplate, userContent, function(err, _uInstance){
                    cbOfgetInstance(err, _uInstance);
                });
        }
    };
})();
