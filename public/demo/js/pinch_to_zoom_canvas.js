
PinchToZoomCanvas = (function(){
        
    function constructor(canvasId, canvasDimension, sourceImageUrl, cbOfConstructor){
        
        //private members
        var viewerCanvas = null;
        var viewerCanvasCtx = null; 
        var croppingWindowCanvas = null;
        var croppingWindowCanvasCtx = null; 
        var image = null;
        var drawCroppingWindow = null;
        var croppedAreaUpdateCb = null;
        var normalizedCroppedArea = null;
        var croppingArea = null;
        

        var option = {
            destination : {
                x : 0,
                y : 0
            },
            scope : {
                w : 0,
                h : 0
            }
        };
        var s_now = {
            x : 0,
            y : 0,
            status : 0
        };
        var p_before = {
            x : 0,
            y : 0,
            v : 0,
            status : 0
        };
        var p_now = {
            x : 0,
            y : 0,
            v : 0
        };
        
        var drawDefaultCroppingWindow = function() {
            viewerCanvasCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
            viewerCanvasCtx.fillRect(0, 0, canvasDimension.width, croppingArea.y);
            viewerCanvasCtx.fillRect(0, croppingArea.y+croppingArea.height, canvasDimension.width, canvasDimension.height-croppingArea.y-croppingArea.height);
            viewerCanvasCtx.fillRect(0, croppingArea.y, croppingArea.x, croppingArea.height);
            viewerCanvasCtx.fillRect(croppingArea.x+croppingArea.width, croppingArea.y, canvasDimension.width-croppingArea.x-croppingArea.width, croppingArea.height);
        };
        
        var repaintCanvas = function() {

            //limit to prevent shrinking too much
            if (!croppingArea) {
                if (option.destination.x < viewerCanvas.width - option.scope.w)
                    option.destination.x = viewerCanvas.width - option.scope.w;
                if (option.destination.y < viewerCanvas.height - option.scope.h)
                    option.destination.y = viewerCanvas.height - option.scope.h;
                if (option.destination.x > 0)
                    option.destination.x = 0;
                if (option.destination.y > 0)
                    option.destination.y = 0;
            }
            else {
                if (option.destination.x < croppingArea.width - option.scope.w)
                    option.destination.x = croppingArea.width - option.scope.w;
                if (option.destination.y < croppingArea.y + croppingArea.height - option.scope.h)
                    option.destination.y = croppingArea.y + croppingArea.height - option.scope.h;
                if (option.destination.x > croppingArea.x)
                    option.destination.x = croppingArea.x;
                if (option.destination.y > croppingArea.y)
                    option.destination.y = croppingArea.y;
            }

            //clear and draw the content image
            viewerCanvasCtx.clearRect(0, 0, viewerCanvas.width, viewerCanvas.height);
            viewerCanvasCtx.drawImage(image, option.destination.x,
                    option.destination.y, option.scope.w, option.scope.h);
            
            
            if (croppingWindowCanvas && croppingArea) {
                //draw the cropping window
                if (drawCroppingWindow) {
                    drawCroppingWindow(viewerCanvasCtx, canvasDimension, croppingArea);
                }
                else {
                    drawDefaultCroppingWindow();
                }
                
                //draw the cropped content into croppingWindowCanvas
                croppingWindowCanvasCtx.drawImage(viewerCanvas, croppingArea.x, croppingArea.y, croppingArea.width, croppingArea.height, 0, 0, croppingWindowCanvas.width, croppingWindowCanvas.height);
            }
            
            
        };
        
        var updateNormalizedCroppedArea = function() {
            if (croppingArea) {
                normalizedCroppedArea = {
                    x : ( -option.destination.x + croppingArea.x ) / option.scope.w, //fraction relative to its width
                    y : ( -option.destination.y + croppingArea.y ) / option.scope.h, //fraction relative to its height
                    width : croppingArea.width / option.scope.w, //fraction relative to its width
                    height : croppingArea.height / option.scope.h //fraction relative to its height
                };
            }
            else {
                normalizedCroppedArea = {
                    x : -option.destination.x / option.scope.w, //fraction relative to its width
                    y : -option.destination.y / option.scope.h, //fraction relative to its height
                    width : viewerCanvas.width / option.scope.w, //fraction relative to its width
                    height : viewerCanvas.height / option.scope.h //fraction relative to its height  
                };
            }
            
            if (croppedAreaUpdateCb) {
                croppedAreaUpdateCb(normalizedCroppedArea);
            }
        };


        
        var obj = {
            //==public services of PinchToZoomCanvas==
            getResultImageUrl:function() {
                if (!croppingWindowCanvas) {
                    return viewerCanvas.toDataURL();
                }
                else {
                    return croppingWindowCanvas.toDataURL();
                }
                
            },
            
            setCropper: function(_croppingArea, _croppedAreaUpdateCb, _croppingWindowDrawFunc) {
                croppingArea = _croppingArea;
                croppedAreaUpdateCb = _croppedAreaUpdateCb;
                drawCroppingWindow = _croppingWindowDrawFunc;
                
                croppingWindowCanvas = document.createElement('canvas');
                croppingWindowCanvas.setAttribute("id","ugcCanvas");
                croppingWindowCanvas.width = croppingArea.width;
                croppingWindowCanvas.height = croppingArea.height;
                
                croppingWindowCanvasCtx = croppingWindowCanvas.getContext('2d');
                croppingWindowCanvasCtx.webkitImageSmoothingEnabled = true;
                
                var viewerCanvasAspectRatio = viewerCanvas.width/viewerCanvas.height;
                var sourceImageAspectRatio = image.width / image.height;
                
                if ( sourceImageAspectRatio <= viewerCanvasAspectRatio ) {
                    option.scope.w = viewerCanvas.width;
                    option.scope.h = image.height / image.width * viewerCanvas.width;

                    option.destination.x = 0;
                    option.destination.y = -0.5 * (option.scope.h - viewerCanvas.height);
                }
                else {
                    option.scope.h = viewerCanvas.height;
                    option.scope.w = image.width / image.height * option.scope.h;

                    option.destination.y = 0;
                    option.destination.x = -0.5 * (option.scope.w - viewerCanvas.width);
                }

                
                repaintCanvas();
            }
                                           
            //==end of public services of PinchToZoomCanvas==
        };
        
        $$('#'+canvasId).pinching(function(e) {
            
            if (e.type == 'pinching') {

                p_now.x = (e.currentTouch[0].x + e.currentTouch[1].x) / 2 - viewerCanvas.offsetLeft;
                p_now.y = (e.currentTouch[0].y + e.currentTouch[1].y) / 2 - viewerCanvas.offsetTop;

                p_now.v = Math.pow(e.currentTouch[0].x - e.currentTouch[1].x, 2) + Math.pow(e.currentTouch[0].y - e.currentTouch[1].y, 2);

                //zoom in/out

                var n = Math.sqrt(p_now.v / p_before.v);

                if (p_before.status) {

                    //zoom limit: width * n
                    if (option.scope.w > image.width * 2 && n > 1)
                        n = 1;

                    option.scope.w *= n;
                    option.scope.h *= n;

                    //center point mapping
                    option.destination.x = p_before.x - n * (p_before.x - option.destination.x) + (p_now.x - p_before.x);
                    option.destination.y = p_before.y - n * (p_before.y - option.destination.y) + (p_now.y - p_before.y);

                    //zoom limit: width
                    if (option.scope.w < viewerCanvas.width) {
                        option.destination.x = 0;
                        option.destination.y = 0;
                        option.scope.w = viewerCanvas.width;
                        option.scope.h = image.height / image.width
                                * viewerCanvas.width;
                    }

                    repaintCanvas();
                };

                p_before.x = p_now.x;
                p_before.y = p_now.y;
                p_before.v = p_now.v;
                p_before.status = 1;

            }
            //console.log(option.source.x + ', ' + option.source.y);
        });

        $$('#'+canvasId).pinch(function(e) {
            
            p_before.status = 0;
            
            updateNormalizedCroppedArea();

        });

        $$('#'+canvasId).swiping(function(e) {

            //console.log('[swiping]');

            if (!isNaN(e.iniTouch.x) && (e.type == 'swiping')) {

                if (s_now.status == 0) {
                    s_now.x = e.iniTouch.x;
                    s_now.y = e.iniTouch.y;
                    s_now.status = 1;
                }

                option.destination.x += e.currentTouch.x - s_now.x;
                option.destination.y += e.currentTouch.y - s_now.y;

                repaintCanvas();

                s_now.x = e.currentTouch.x;
                s_now.y = e.currentTouch.y;

            }

        });

        $$('#'+canvasId).swipe(function(e) {
            //console.log('[swipe]');
            s_now.status = 0;
            updateNormalizedCroppedArea();

        });
        
        viewerCanvas = document.getElementById(canvasId);
        viewerCanvasCtx = viewerCanvas.getContext('2d');
        viewerCanvas.width = canvasDimension.width;
        viewerCanvas.height = canvasDimension.height;
        
        image = new Image();
        image.src = sourceImageUrl;
        image.onload = function() {
            
            var viewerCanvasAspectRatio = viewerCanvas.width/viewerCanvas.height;
            var sourceImageAspectRatio = image.width / image.height;
            
            if ( sourceImageAspectRatio <= viewerCanvasAspectRatio ) {
                option.scope.w = viewerCanvas.width;
                option.scope.h = image.height / image.width * viewerCanvas.width;

                option.destination.x = 0;
                option.destination.y = -0.5 * (option.scope.h - viewerCanvas.height);
            }
            else {
                option.scope.h = viewerCanvas.height;
                option.scope.w = image.width / image.height * option.scope.h;

                option.destination.y = 0;
                option.destination.x = -0.5 * (option.scope.w - viewerCanvas.width);
            }


            repaintCanvas();
            
            cbOfConstructor(null, obj);
        };
        
        image.onerror = function(){
            cbOfConstructor("Failed to load the background image "+sourceImageUrl, null);
        };
        image.onabort = function(){
            cbOfConstructor("Failed to load the background image "+sourceImageUrl+" (aborted)", null);
        };
        
    }
    
    return {
        getInstance: function(canvasId, canvasDimension, sourceImageUrl, cbOfGetInstance){
            constructor(canvasId, canvasDimension, sourceImageUrl, function(err, _uInstance){
                cbOfGetInstance(err, _uInstance);
            });
        }
    };
})();
