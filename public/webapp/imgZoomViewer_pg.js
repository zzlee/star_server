var option = {
source: { x: 0, y: 0 },
scale: { w: 0, h: 0 },
destination: { x: 0, y: 0 },
scope: { w: 0, h: 0 }
};
var canvas, context, image;

var s_now = { x: 0, y: 0, status: 0 },
p_before = { x: 0, y: 0, v: 0, status: 0 },
p_now = { x: 0, y: 0, v: 0 };

var canvasInner = { width: 0, height: 0},
canvasInnerMargins = { top: 0, left: 0, right: 0, bottom: 0};

FmMobile.imgZoomViewerPg = {
	//  Page constants.
    PAGE_ID: "imgZoomViewerPg",
	
	//myPhotoCropper: null,
    stageAllowableWidth: 0,
    stageAllowableHeight: 0,
    
    //  Page methods.
    load: function(event, data){
         $("#nav-bar").hide();
        
        /*  back previous page dynamically*/
        $("#backMyUgc").click(function() {
               history.back();
               return false;
               });
        /* end  back previous page dynamically*/
        
        /*
        $('#backMyUgc').click(function(){
                              if(FmMobile.viewerBackFlag=='backPreview'){
                              $.mobile.changePage('template-preview.html');
                              
                              }else{
                              $.mobile.changePage('my_ugc.html');
                              }
                              });
        

        
        */
        
        //JF - image initial
       
    },
    
    show: function(event, data){
        canvas = document.getElementById('photoZoom');
        context = canvas.getContext('2d');
        image = new Image();
        
        var limit = 0;
        
canvas.width = $(document).width();
        //canvas.height = canvas.width / customizableObjectDimensions[fileObjectID].width * customizableObjectDimensions[fileObjectID].height;
        canvas.height = $(document).height();
        
        //input control to inner square in canvas (0.96)
        canvasInner.width = canvas.width * 0.96;
        //canvasInner.height = canvasInner.width / customizableObjectDimensions[fileObjectID].width * customizableObjectDimensions[fileObjectID].height;
        
        //input control to margins (top, left)
        var top = 0.5, left = 0.5;
        
        canvasInnerMargins.left = left * (canvas.width - canvasInner.width);
        canvasInnerMargins.top = top * (canvas.height - canvasInner.height);
        
        image.onload = function(){
            
            option.scope.w = canvas.width;
            option.scope.h = image.height / image.width * canvas.width;
            
            option.destination.x = 0;
            //option.destination.y = canvasInner.height - 0.5 * (option.scope.h - canvasInner.height);
            // option.destination.y=(document.body.clientHeight)*0.3;
            //window.screen.height
            
            option.destination.y=$(document).height()*0.35;
            //context.drawImage(image,
            //option.destination.x, option.destination.y,
            //option.scope.w, option.scope.h);
            
            
            context.drawImage(image,
                              option.destination.x,option.destination.y,
                              option.scope.w, option.scope.h);
            
            //drawTansparentBorder();
            
            croppedArea = {
            x:(canvasInnerMargins.left - option.destination.x) / option.scope.w,  //fraction relative to its width
            y:(canvasInnerMargins.top - option.destination.y) / option.scope.h,  //fraction relative to its height
            width:canvasInner.width / option.scope.w,  //fraction relative to its width
            height:canvasInner.height / option.scope.h  //fraction relative to its height
            };
        };
        
        
        
        
        if(FmMobile.viewerBackFlag=='backPreview'){
            
            image.src = FmMobile.imgForFullPageViewer;
        }else{
            image.src =FmMobile.srcForMyUgcViewer;
        }
        
        //image.src = "https://s3.amazonaws.com/miix_content/user_project/check_in-51d38ca086fa21440a000002-20130820T070940435Z/check_in-51d38ca086fa21440a000002-20130820T070940435Z.png";
        /*
         drawTansparentBorder = function(){
         
         context.strokeStyle = 'rgba(30,30,30,0.7)';
         context.lineWidth = canvasInnerMargins.top;
         context.beginPath();
         context.moveTo(0,canvasInnerMargins.top / 2);
         context.lineTo(canvas.width, canvasInnerMargins.top / 2);
         context.moveTo(0, canvas.height - (canvasInnerMargins.top / 2));
         context.lineTo(canvas.width, canvas.height - (canvasInnerMargins.top / 2));
         context.stroke();
         
         context.lineWidth = canvasInnerMargins.left;
         context.beginPath();
         context.moveTo(canvasInnerMargins.left / 2, canvasInnerMargins.top);
         context.lineTo(canvasInnerMargins.left / 2, canvas.height - canvasInnerMargins.top);
         context.moveTo(canvas.width - (canvasInnerMargins.left / 2), canvasInnerMargins.top);
         context.lineTo(canvas.width - (canvasInnerMargins.left / 2), canvas.height - canvasInnerMargins.top);
         context.stroke();
         
         };
         */
        //JF - image event
        $$('#photoZoom').pinching(function(e){
                               if(e.type == 'pinching') {
                               
                               p_now.x = (e.currentTouch[0].x + e.currentTouch[1].x) / 2 - canvas.offsetLeft;
                               p_now.y = (e.currentTouch[0].y + e.currentTouch[1].y) / 2 - canvas.offsetTop;
                               
                               //var delta = Math.sqrt(Math.sqrt(Math.pow(e.iniTouch[0].x - e.iniTouch[1].x, 2) +
                               //                                Math.pow(e.iniTouch[0].y - e.iniTouch[1].y, 2) -
                               //                                Math.pow(e.currentTouch[0].x - e.currentTouch[1].x, 2) +
                               //                                Math.pow(e.currentTouch[0].y - e.currentTouch[1].y, 2)));
                               p_now.v = Math.pow(e.currentTouch[0].x - e.currentTouch[1].x, 2) + Math.pow(e.currentTouch[0].y - e.currentTouch[1].y, 2);
                               
                               //zoom in/out
                               
                               var n = Math.sqrt(p_now.v / p_before.v);
                               
                               if (p_before.status){
                               
                               
                               //zoom limit: width * n
                               if(option.scope.w > image.width * 2 && n > 1) n = 1;
                               
                               option.scope.w *= n;
                               option.scope.h *= n;
                               
                               //center point mapping
                               option.destination.x = p_before.x - n * (p_before.x - option.destination.x) + (p_now.x - p_before.x);
                               option.destination.y = p_before.y - n * (p_before.y - option.destination.y) + (p_now.y - p_before.y);
                               
                               //zoom limit: width
                                  
                               if(option.scope.w < canvas.width) {
                               option.destination.x = 0;
                                  option.destination.y = $(document).height()*0.35;

                               option.scope.w = canvas.width;
                               option.scope.h = image.height / image.width * canvas.width;
                               }
                               
                               showImage();
                               };
                               
                               p_before.x = p_now.x;
                               p_before.y = p_now.y;
                               p_before.v = p_now.v;
                               p_before.status = 1;
                               
                               }
                               //console.log(option.source.x + ', ' + option.source.y);
                               });
        
        $$('#photoZoom').pinch(function(e){
                            p_before.status = 0;
                               
                            croppedArea = {
                               x:(canvasInnerMargins.left - option.destination.x) / option.scope.w,  //fraction relative to its width
                               y:(canvasInnerMargins.top - option.destination.y) / option.scope.h,  //fraction relative to its height
                               width:canvasInner.width / option.scope.w,  //fraction relative to its width
                               height:canvasInner.height / option.scope.h  //fraction relative to its height
                               };
                            });
        
        $$('#photoZoom').swiping(function(e){
                              
                              //console.log('[swiping]');
                              
                              if(!isNaN(e.iniTouch.x) && (e.type == 'swiping')) {
                              
                              if(s_now.status == 0) {
                              s_now.x = e.iniTouch.x;
                              s_now.y = e.iniTouch.y;
                              s_now.status = 1;
                              }
                              
                              option.destination.x += e.currentTouch.x - s_now.x;
                              option.destination.y += e.currentTouch.y - s_now.y;
                              
                              showImage();
                              
                              s_now.x = e.currentTouch.x;
                              s_now.y = e.currentTouch.y;
                              
                              }
                              
                              });
        
        $$('#photoZoom').swipe(function(e){
                            //console.log('[swipe]');
                            s_now.status = 0;
                               
                            croppedArea = {
                               x:(canvasInnerMargins.left - option.destination.x) / option.scope.w,  //fraction relative to its width
                               y:(canvasInnerMargins.top - option.destination.y) / option.scope.h,  //fraction relative to its height
                               width:canvasInner.width / option.scope.w,  //fraction relative to its width
                               height:canvasInner.height / option.scope.h  //fraction relative to its height
                               };
                            });
        
        drawTansparentBorder = function(){
            
            context.strokeStyle = 'rgba(30,30,30,0)';
            context.lineWidth = canvasInnerMargins.top;
            context.beginPath();
            context.moveTo(0,canvasInnerMargins.top / 2);
            context.lineTo(canvas.width, canvasInnerMargins.top / 2);
            context.moveTo(0, canvas.height - (canvasInnerMargins.top / 2));
            context.lineTo(canvas.width, canvas.height - (canvasInnerMargins.top / 2));
            context.stroke();
            
            context.lineWidth = canvasInnerMargins.left;
            context.beginPath();
            context.moveTo(canvasInnerMargins.left / 2, canvasInnerMargins.top);
            context.lineTo(canvasInnerMargins.left / 2, canvas.height - canvasInnerMargins.top);
            context.moveTo(canvas.width - (canvasInnerMargins.left / 2), canvasInnerMargins.top);
            context.lineTo(canvas.width - (canvasInnerMargins.left / 2), canvas.height - canvasInnerMargins.top);
            context.stroke();
            
        };
        
        showImage = function(){
            
            //limit
            if(option.destination.x > canvasInnerMargins.left) option.destination.x = canvasInnerMargins.left;
            if(option.destination.y > canvasInnerMargins.top) option.destination.y = canvasInnerMargins.top;
            
            if(option.destination.x < canvas.width - option.scope.w - canvasInnerMargins.left) option.destination.x = canvas.width - option.scope.w - canvasInnerMargins.left;
            if(option.destination.y < canvas.height - option.scope.h - canvasInnerMargins.top) option.destination.y = canvas.height - option.scope.h - canvasInnerMargins.top;
            
            //clear and draw image
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, option.destination.x, option.destination.y,
                              option.scope.w, option.scope.h);
            
            drawTansparentBorder();
        };
        
        //FmMobile.analysis.trackPage("/imgZoomViewerPg");
//        recordUserAction("enters imgZoomViewerPg");
    }
}