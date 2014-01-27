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



    //myPhotoCropper: null,

    //  Page methods.
        
        //get the dimension of customizable image 
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
       
        //Rewrite #submitBtn click function
        
       


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
        
       
         image.src = "http://l.yimg.com/bt/api/res/1.2/PmV48R2z0v_c1D_oFrsg7Q--/YXBwaWQ9eW5ld3M7Zmk9aW5zZXQ7aD00MjI7cT03OTt3PTYzMA--/http://media.zenfs.com/en_us/News/Lihpao/54450_201401262233391RfNJ.jpg";

       

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
   

