var option = {
    source : {
        x : 0,
        y : 0
    },
    scale : {
        w : 0,
        h : 0
    },
    destination : {
        x : 0,
        y : 0
    },
    scope : {
        w : 0,
        h : 0
    }
};
var canvas, context, image;

var s_now = {
    x : 0,
    y : 0,
    status : 0
}, p_before = {
    x : 0,
    y : 0,
    v : 0,
    status : 0
}, p_now = {
    x : 0,
    y : 0,
    v : 0
};

var WidthOfCustomizableImage = null;
var HeightOfcustomizableImage = null;


FmMobile.template_photoCropperPg = {

    //myPhotoCropper: null,
    stageAllowableWidth : 0,
    stageAllowableHeight : 0,

    //  Page methods.
    load : function(event, data) {
        FM_LOG("[template_photoCropperPg]load");
        $("#nav-bar").show();
        
        //get the dimension of customizable image 
        WidthOfCustomizableImage = null;
        HeightOfcustomizableImage = null;
        /*
        if ( FmMobile.selectedTemplate == "miix_it" ) {
            //TODO: parse templateMgr.getSubTemplate(FmMobile.selectedTemplate, FmMobile.selectedSubTemplate).customizableObjectsXml 
            // hard coded them for now
            WidthOfCustomizableImage = 1280;
            HeightOfcustomizableImage = 722;
        }
        else {
            var customizableObjects = templateMgr.getSubTemplate(FmMobile.selectedTemplate, FmMobile.selectedSubTemplate).customizableObjects;
            for (var i=0; i<customizableObjects.length; i++) {
                if (customizableObjects[i].type == 'image') {
                    //WidthOfCustomizableImage = customizableObjects[i].width;
                    //HeightOfcustomizableImage = customizableObjects[i].height;
                    //TODO: get the dimensions of customizable image from templateMgr
                    WidthOfCustomizableImage = 1280;
                    HeightOfcustomizableImage = 722;
                    break;
                }
            }
        }
         */
        /*
        if ( (!WidthOfCustomizableImage) || (!HeightOfcustomizableImage) ) {
            return;
        }
        */

        


//        if (FmMobile.selectedTemplate == 'miix_it') {
//
//            $("#submitBtn").click(function() {
//                FmMobile.userContent.picture.urlOfOriginal = fileSelectedURI;
//                FmMobile.userContent.picture.urlOfCropped = canvas.toDataURL();
//                $.mobile.changePage("template-preview.html");
//            });
//
//        } else {
//            $("#submitBtn").click(function() {
//
//                FmMobile.userContent.picture.urlOfCropped = canvas.toDataURL();
//                $.mobile.changePage("template-preview.html");
//            });
//
//        }
        //Deprecated
//        var onSubmitBtnClick = function() {
//            FmMobile.userContent.picture.urlOfCropped = canvas.toDataURL();
//            FmMobile.analysis.trackEvent("Button", "Click", "Submit", 24);
//        };
//
//        $('#submitPhotoBtn').click(onSubmitBtnClick);
        $('#cancelBtn').click(function() {

            if (FmMobile.selectedSubTemplate == "picture_only") {
                $.mobile.changePage("template-input_pic.html");
            } else if (FmMobile.selectedSubTemplate == "picture_plus_text") {
                $.mobile.changePage("template-input_text_pic.html");
            } else if (FmMobile.selectedSubTemplate == "check_in") {
                $.mobile.changePage("template-input_text_pic.html");
          }else if (FmMobile.selectedSubTemplate == "miix_one_image") {
          $.mobile.changePage("template_input_miixit.html");
          }
        });

        //Rewrite #submitBtn click function
        
        $('#submitBtnToPreview').click(function() {
            
            $.mobile.showPageLoadingMsg();
            FmMobile.userContent.picture.urlOfCropped = canvas.toDataURL();
            //------ processing img (avoid preview pg long time loading) ------
            //for 圖 / 圖+文 /video img (文 & 打卡 不能, 因為沒到cropper pg)
            if(FmMobile.selectedTemplate == "miix_it"){
                VideoUgc.getInstance('miix_it', 'miix_one_image', FmMobile.userContent, function(err, _videoUgc) {
                    if (!err) {
                        FmMobile.videoImgUgcInstance = _videoUgc;
                        FmMobile.viewerBackFlag='backPreview';
                        FmMobile.imgForFullPageViewer=FmMobile.videoImgUgcInstance.getDoohPreviewImageUrl();
                        $.mobile.changePage("template-preview.html");
                        $.mobile.hidePageLoadingMsg();
                    }else{
                        console.log(err);
                        }
                    });
            }else{
            ImageUgc.getInstance(FmMobile.selectedTemplate, FmMobile.selectedSubTemplate, FmMobile.userContent, function(err, _imageUgc) {
                if (!err) {
                    FmMobile.imageUgcInstance = _imageUgc;
                    FmMobile.viewerBackFlag='backPreview';
                    FmMobile.imgForFullPageViewer=FmMobile.imageUgcInstance.getDoohPreviewImageUrl();
                    $.mobile.changePage("template-preview.html");
                    $.mobile.hidePageLoadingMsg();
                 }else{
                 console.log(err);
                     }
                });
            }
            //------- end of processing-------------------
       
            
            
            
        });
    },


    show : function(event, data) {
        FM_LOG("[photoCropperPg]show");
        /*
        if ( (!WidthOfCustomizableImage) || (!HeightOfcustomizableImage) ) {
            return;
        }
*/
        //JF - image initial
        canvas = document.getElementById('photoZoom');
        context = canvas.getContext('2d');
        image = new Image();

        var change_css = ($('.movie-pic-dummy').width()) * 0.95;
        
        $('.content-movie-img').css({
            'width' : change_css,
            //'margin-top' : '5.5%'
        });

        //canvas.width = screen.availWidth;
        canvas.width = $('.movie-pic-dummy').width();
        canvas.height = canvas.width / 1280 * 735;
        
        var rotation_tag=false;
         image.src = fileProcessedForCropperURI;
        $('#rotation').click(function(){
        	if(rotation_tag==false ){
        		if( FmMobile.forCropperRotateVal==6){
        		FmMobile.rotateValue=180;
        		}else{
        		
        		FmMobile.rotateValue=90;
        		}
        		
         subsamplingResize(fileProcessedForCropperURI, { maxWidth: 960, maxHeight: 960, orientation: 6 }, function(resultURI){
                                                       image.src = resultURI;
                                                       
                                                       image.onload = function() {

                                                       	 
                                  
                                     
            option.scope.w = canvas.width;
            option.scope.h = image.height / image.width * canvas.width;

            option.destination.x = 0;
            option.destination.y = -0.5 * (option.scope.h - canvas.height);

            context.drawImage(image, option.destination.x,
                    option.destination.y, option.scope.w, option.scope.h);

            croppedArea = {
                x : -option.destination.x / option.scope.w, //fraction relative to its width
                y : -option.destination.y / option.scope.h, //fraction relative to its height
                width : canvas.width / option.scope.w, //fraction relative to its width
                height : canvas.height / option.scope.h //fraction relative to its height
            };
            
            FmMobile.userContent.picture.crop._x = croppedArea.x;
            FmMobile.userContent.picture.crop._y = croppedArea.y;
            FmMobile.userContent.picture.crop._w = croppedArea.width;
            FmMobile.userContent.picture.crop._h = croppedArea.height;
            //alert(croppedArea.x);

        };

                                                       rotation_tag=true;
                                                       });
        	}else{
        		FmMobile.rotateValue=0;
        	subsamplingResize(fileProcessedForCropperURI, { maxWidth: 960, maxHeight: 960, orientation: 1}, function(resultURI){
                                                       image.src = resultURI;
                                                       image.onload = function() {

            option.scope.w = canvas.width;
            option.scope.h = image.height / image.width * canvas.width;

            option.destination.x = 0;
            option.destination.y = -0.5 * (option.scope.h - canvas.height);

            context.drawImage(image, option.destination.x,
                    option.destination.y, option.scope.w, option.scope.h);

            croppedArea = {
                x : -option.destination.x / option.scope.w, //fraction relative to its width
                y : -option.destination.y / option.scope.h, //fraction relative to its height
                width : canvas.width / option.scope.w, //fraction relative to its width
                height : canvas.height / option.scope.h //fraction relative to its height
            };
            
            FmMobile.userContent.picture.crop._x = croppedArea.x;
            FmMobile.userContent.picture.crop._y = croppedArea.y;
            FmMobile.userContent.picture.crop._w = croppedArea.width;
            FmMobile.userContent.picture.crop._h = croppedArea.height;
            //alert(croppedArea.x);
rotation_tag=false;
        };

                                                       });
        	}
        });
        
       

        image.onload = function() {

            option.scope.w = canvas.width;
            option.scope.h = image.height / image.width * canvas.width;

            option.destination.x = 0;
            option.destination.y = -0.5 * (option.scope.h - canvas.height);

            context.drawImage(image, option.destination.x,
                    option.destination.y, option.scope.w, option.scope.h);

            croppedArea = {
                x : -option.destination.x / option.scope.w, //fraction relative to its width
                y : -option.destination.y / option.scope.h, //fraction relative to its height
                width : canvas.width / option.scope.w, //fraction relative to its width
                height : canvas.height / option.scope.h //fraction relative to its height
            };
            
            FmMobile.userContent.picture.crop._x = croppedArea.x;
            FmMobile.userContent.picture.crop._y = croppedArea.y;
            FmMobile.userContent.picture.crop._w = croppedArea.width;
            FmMobile.userContent.picture.crop._h = croppedArea.height;
            //alert(croppedArea.x);

        };

        //image.src = "images/test.jpg";  //for test

       
        // FmMobile.userContent.picture.url=fileProcessedForCropperURI;

        //JF - image event
        $$('#photoZoom').pinching(
                function(e) {
                    if (e.type == 'pinching') {

                        p_now.x = (e.currentTouch[0].x + e.currentTouch[1].x)
                                / 2 - canvas.offsetLeft;
                        p_now.y = (e.currentTouch[0].y + e.currentTouch[1].y)
                                / 2 - canvas.offsetTop;

                        //var delta = Math.sqrt(Math.sqrt(Math.pow(e.iniTouch[0].x - e.iniTouch[1].x, 2) +
                        //                                Math.pow(e.iniTouch[0].y - e.iniTouch[1].y, 2) -
                        //                                Math.pow(e.currentTouch[0].x - e.currentTouch[1].x, 2) +
                        //                                Math.pow(e.currentTouch[0].y - e.currentTouch[1].y, 2)));
                        p_now.v = Math.pow(e.currentTouch[0].x
                                - e.currentTouch[1].x, 2)
                                + Math.pow(e.currentTouch[0].y
                                        - e.currentTouch[1].y, 2);

                        //zoom in/out

                        var n = Math.sqrt(p_now.v / p_before.v);

                        if (p_before.status) {

                            //zoom limit: width * n
                            if (option.scope.w > image.width * 2 && n > 1)
                                n = 1;

                            option.scope.w *= n;
                            option.scope.h *= n;

                            //center point mapping
                            option.destination.x = p_before.x - n
                                    * (p_before.x - option.destination.x)
                                    + (p_now.x - p_before.x);
                            option.destination.y = p_before.y - n
                                    * (p_before.y - option.destination.y)
                                    + (p_now.y - p_before.y);

                            //zoom limit: width
                            if (option.scope.w < canvas.width) {
                                option.destination.x = 0;
                                option.destination.y = 0;
                                option.scope.w = canvas.width;
                                option.scope.h = image.height / image.width
                                        * canvas.width;
                            }

                            showImage();
                        }
                        ;

                        p_before.x = p_now.x;
                        p_before.y = p_now.y;
                        p_before.v = p_now.v;
                        p_before.status = 1;

                    }
                    //console.log(option.source.x + ', ' + option.source.y);
                });

        $$('#photoZoom').pinch(function(e) {
        	
            p_before.status = 0;

            croppedArea = {
                x : -option.destination.x / option.scope.w, //fraction relative to its width
                y : -option.destination.y / option.scope.h, //fraction relative to its height
                width : canvas.width / option.scope.w, //fraction relative to its width
                height : canvas.height / option.scope.h //fraction relative to its height
            };
                               
                               FmMobile.userContent.picture.crop._x = croppedArea.x;
                               FmMobile.userContent.picture.crop._y = croppedArea.y;
                               FmMobile.userContent.picture.crop._w = croppedArea.width;
                               FmMobile.userContent.picture.crop._h = croppedArea.height;
        });

        $$('#photoZoom').swiping(function(e) {

            //console.log('[swiping]');

            if (!isNaN(e.iniTouch.x) && (e.type == 'swiping')) {

                if (s_now.status == 0) {
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

        $$('#photoZoom').swipe(function(e) {
            //console.log('[swipe]');
            s_now.status = 0;

            croppedArea = {
                x : -option.destination.x / option.scope.w, //fraction relative to its width
                y : -option.destination.y / option.scope.h, //fraction relative to its height
                width : canvas.width / option.scope.w, //fraction relative to its width
                height : canvas.height / option.scope.h //fraction relative to its height
            };

            FmMobile.userContent.picture.crop._x = croppedArea.x;
            FmMobile.userContent.picture.crop._y = croppedArea.y;
            FmMobile.userContent.picture.crop._w = croppedArea.width;
            FmMobile.userContent.picture.crop._h = croppedArea.height;

        });

        showImage = function() {

            //limit
            if (option.destination.x < canvas.width - option.scope.w)
                option.destination.x = canvas.width - option.scope.w;
            if (option.destination.y < canvas.height - option.scope.h)
                option.destination.y = canvas.height - option.scope.h;
            if (option.destination.x > 0)
                option.destination.x = 0;
            if (option.destination.y > 0)
                option.destination.y = 0;

            //clear and draw image
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, option.destination.x,
                    option.destination.y, option.scope.w, option.scope.h);
        };

       // FmMobile.analysis.trackPage("/template_photoCropperPg");
//        recordUserAction("enters template_photoCropperPg");
        FmMobile.dummyDiv();
    }
   
}
