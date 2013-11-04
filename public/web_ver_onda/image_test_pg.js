FmMobile.imageTestPg = {

    init: function(){
        
 
        // Draw it!
        /*    
        var ugcCanvas = document.createElement('canvas');
        ugcCanvas.setAttribute("id","ugcCanvas");
        
        var ctx = ugcCanvas.getContext('2d');
        ctx.webkitImageSmoothingEnabled = true;
        var bgImage = new Image();
        var objImage = new Image();
        bgImage.src = 'template/mood/test_bg.jpg';
        bgImage.onload = function(){
            ugcCanvas.width = bgImage.width;
            ugcCanvas.height = bgImage.height;
            objImage.src = 'template/mood/Koala.jpg';
            objImage.onload = function(){
                ctx.drawImage(bgImage,0,0);
                //ctx.translate(742,19);
                
                                
				var wrapChineseText = function(context, text, x, y, maxWidth, lineHeight) {
				    var words = text; //In Chinese, a character is a word.
					var line = '';
				
					for(var n = 0; n < words.length; n++) {
						var testLine = line + words[n];
						var metrics = context.measureText(testLine);
						var testWidth = metrics.width;
						if (testWidth > maxWidth && n > 0) {
							context.fillText(line, x, y);
							line = words[n];
							y += lineHeight;
						}
						else {
							line = testLine;
						}
					}
					context.fillText(line, x, y);
				}
              

                // The text we want to draw.
                var text = 'In this example I don\'t care about <class="blue">blue</class> or <class="pink">pink</class>.\n\
                            I just care about the new and <class="blue">exciting</class> <class="pink">automatic</class>\n\
                            <class="blue">multiline</class> feature!! <br />Just to be sure:<br />Lorem ipsum dolor sit amet, \n\
                            consectetur adipiscing elit. Nulla ut erat magna, quis commodo nulla.\n\
                            Vestibulum <class="pink">eget</class> mi quis sapien lacinia porta eget eget neque. Aliquam lacus \n\
                            leo, sodales sit amet laoreet non, mollis ut nibh.';

                var textChinse = '很多人習慣在手機充電時講電話，這樣的動作千萬得小心，大陸南方航空一名空姐，11日晚間在家中用充電的iPhone5講電話，沒想到一股電流通過身體，造成空姐當場死亡';

                
                ctx.save();
                ctx.translate(775,22);
                ctx.rotate(10.36*Math.PI/180);
                ctx.drawImage(objImage,0,0,240, 180);
                ctx.restore();
                
                ctx.save();
                ctx.translate(885,22);
                ctx.drawImage(objImage,0,0,240, 180);
                ctx.restore();

                ctx.save();
                ctx.translate(40,40);
                ctx.font = '30px 華康歐陽詢體W5';
                wrapChineseText(ctx, textChinse, 0, 0, 300, 30);
                ctx.restore();
                
                $("#canvasImg").attr("src", ugcCanvas.toDataURL('image/png'));
                
                //upload to server
                var reultURI = resultCanvas.toDataURL('image/png').replace('image/octet-stream');
                
                $.ajax({
                       type: "POST",
                       url: starServerURL+"/miix/ugc_base64_contents",
                       data: {
                           imgBase64: reultURI,
                           miixToken: localStorage.miixToken
                       }
                       }).done(function(o) {
                               console.log('saved');
                       });
                
                
            };

            
        }; */

        

        /*
        if (templateMgr) {
        	console.dir(templateMgr.getTemplateList());
        	console.dir(templateMgr.getSubTemplateList("mood"));
			console.dir(templateMgr.getSubTemplate("mood","picture_plus_text"));
		}
    	
        $.get(starServerURL+'/miix/members/512da133989cfc2403000005/ugcs', {token: "53768608", limit:"5"}, function(data) {
            //alert(data);
            console.dir(data);
        });
    	
        $.get(starServerURL+'/miix/ugc_hightlights', {token: "53768608", limit:"5"}, function(data) {
            //alert(data);
            console.dir(data);
        });*/


        
        
        //== imageUgc test ==
        
        
        
        
        $('#btnTest').click(function(){
            navigator.camera.getPicture(function(imageURI){
                //do the work
                var mainTemplate = "miix_it";
                var ownerId = '512da133989cfc2403000005'; //Gance's
                var ownerFbUserId = '100004619173955'; //Gance's
                var ugcInfo = {
                        ownerId:{_id:ownerId, fbUserId:ownerFbUserId },
                        title: "My Miix move!!"
                };
                FmMobile.userContent.picture.urlOfOriginal = imageURI;
                FmMobile.userContent.text = "很多人習慣在手機充電時講電話，這樣的動作千萬得小心";
                FmMobile.userContent.picture.urlOfCropped = imageURI;
                FmMobile.userContent.thumbnail.url = 'img/darth-vader.jpg';
                
                var imageUgc = null;
                var doohInfo = null;
                ImageUgc.getInstance('mood', 'picture_plus_text', FmMobile.userContent, function(err, _imageUgc){
                    console.log('err='+err);
                    if (!err){
                        imageUgc = _imageUgc;
                        $("#canvasImg").attr("src", imageUgc.getDoohPreviewImageUrl() );
                        
                        imageUgc.uploadToServer(ugcInfo, function(err){
                            console.log("err="+err);
                        });
                    }
                    
                });
                
                
                
            }, function(){
                alert('Failed to sellect file');
            },{
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            });
            
            
            
            /*
        	var mainTemplate = "mood";
        	var ownerId = '512da133989cfc2403000005'; //Gance's
        	var ownerFbUserId = '100004619173955'; //Gance's
        	var ugcProjectId = mainTemplate +'-'+ ownerId +'-'+ (new Date()).toISOString().replace(/[-:.]/g, "");
        	var ugcInfo = {
        			ownerId:{_id:ownerId, fbUserId:ownerFbUserId },
        			contentGenre: mainTemplate,
        			title: "today's mood"
        	};
        	
        	imageUgc.uploadToServer(ugcProjectId, ugcInfo, function(err){
        		console.log("err="+err);
        	});*/
        }); 
    	
    	/*
        //== videoUgc test ==
        var videoUgc = null;
        VideoUgc.getInstance('miix_it', 'miix_one_image', function(err, _videoUgc){
        	if (!err){
        		videoUgc = _videoUgc;
        	}
        });
        
        $('#btnTest').click(function(){
        	
			navigator.camera.getPicture(function(imageURI){
				//do the work
				var mainTemplate = "miix_it";
	        	var ownerId = '512da133989cfc2403000005'; //Gance's
	        	var ownerFbUserId = '100004619173955'; //Gance's
	        	var ugcInfo = {
	        			ownerId:{_id:ownerId, fbUserId:ownerFbUserId },
	        			title: "My Miix move!!"
	        	};
	        	FmMobile.userContent.picture.urlOfOriginal = imageURI;
	        	
	        	videoUgc.askServerToGenerate(FmMobile.userContent, ugcInfo, function(err){
	        		console.log("err="+err);
	        	});
        		
        	}, function(){
        		alert('Failed to sellect file');
        	},{
                quality: 50,
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.CAMERA
            });
        	
        }); */



        
 
    },
    
	show: function(){
	}
};
