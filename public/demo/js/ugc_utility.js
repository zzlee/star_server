var ugcUtility = {};




ugcUtility.drawFbNameText = function(context, text, x, y, maxWidth, lineHeight, angle, fontColor, font) {
    x = Number(x);
    y = Number(y);
    maxWidth = Number(maxWidth);
    lineHeight = Number(lineHeight);
    angle = Number(angle);
    
    var cursorX = 0;
    var cursorY = 0;
    var words = text; //In Chinese, a character is a word.
    var line = '';
    
    context.save();
    context.translate(x,y);
    context.rotate(angle*Math.PI/180);
    if (font){
        context.font = font;
    }
    else {
        context.font = '36px è¯åº·æ­é™½è©¢é«”W5';
    }
    if(words!=undefined){
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n];
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, cursorX, cursorY);
            line = words[n];
            cursorY += lineHeight;
        }
        else {
            line = testLine;
        }
        context.fillStyle = fontColor;
        
    }}
    context.fillText(line, cursorX, cursorY);
    
    context.restore();
};

/* Actually, this do the things that break word for the sentence mixed the Chinese and English. by Joy*/
ugcUtility.drawChineseText = function(context, text, x, y, maxWidth, lineHeight, angle, fontColor, font) {
    x = Number(x);
/*
 * just for hide 4-th line in the long Img, but this way can't hide 4-th line in doohPreview, 
 * best way of both is update the json value.
 * */
    y = Number(y)+5; 
    maxWidth = Number(maxWidth);
    lineHeight = Number(lineHeight);
    angle = Number(angle);
    var cursorX = 0;
    var cursorY = 0;
    context.save();
    context.translate(x,y);
    context.rotate(angle*Math.PI/180);
    
    if (font){
        context.font = '25pt 華康歐陽詢體W5';
    }
    else {
        context.font = '25pt 華康歐陽詢體W5';
    }

    context.fillStyle = fontColor;
    var breakLineSign = text.split("_");
    
    for(var breakLineCount = 0; breakLineCount < breakLineSign.length; breakLineCount++) {
        var line = "";
        var words = breakLineSign[breakLineCount].split(" ");
        
        for(var wordCount = 0; wordCount < words.length; wordCount++){
            var regExp_CH = /[^\x00-\xff]/;
            var regExp_Num = /[0-9]/;
            if(regExp_CH.test(words[wordCount][0]) || regExp_Num.test(words[wordCount][0])){
                for(var chWordCount = 0; chWordCount < words[wordCount].length; chWordCount++){
                    var testLine = line + words[wordCount][chWordCount];
                    var metrics = context.measureText(testLine);
                    var testWidth = metrics.width;
                    
                    if(testWidth > maxWidth){
                    	if(cursorY < 137) {
                        	context.fillText(line, cursorX, cursorY);
                        }
                        line = words[wordCount][chWordCount];
                        cursorY += lineHeight;
                    }else{
                        line = testLine;
                    }
                }
                line = line + ' ';
            }else{
                var testLine = line + words[wordCount] + " ";
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;
                
                if(testWidth > maxWidth){
                	if(cursorY < 137) {
                    	context.fillText(line, cursorX, cursorY);
                    }
                    line = words[wordCount] + " ";
                    cursorY += lineHeight;
                }else{
                    line = testLine;
                }
            }
        }
        if(cursorY < 137) {
        	context.fillText(line, cursorX, cursorY);
        }
        
        cursorY += lineHeight;
    }
    context.restore();
}

ugcUtility.drawImage = function(context, imageUrl, x, y, width, height, angle, cbOfDrawImage, alpha){
    var objImage = new Image();
	
    objImage.src = imageUrl;
    objImage.onload = function(){
        context.save();
        if (alpha) {
            context.globalAlpha = alpha;
        }
        context.translate(x,y);
        context.rotate(angle*Math.PI/180);
        context.drawImage(objImage, 0, 0, width, height);
        context.restore();
        cbOfDrawImage(null);
    };
    objImage.onerror = function(){
        cbOfDrawImage("Failed to load the image "+imageUrl);
    };
    objImage.onabort = function(){
        cbOfDrawImage("Failed to load the image "+imageUrl+" (aborted)");
    };
};

ugcUtility.resizeCanvas = function(canvas, widthResizeFactor, heightResizeFactor, cbOfResizeCanvas) {
    var base64ImageOfOriginalCanvas = canvas.toDataURL("image/png");
    var context = canvas.getContext('2d');
    context.webkitImageSmoothingEnabled = true;
    var originalWidth = canvas.width;
    var originalHeight = canvas.height;
    var img = new Image();
    img.src = base64ImageOfOriginalCanvas;
    img.onload = function (){
        canvas.width *= widthResizeFactor;
        canvas.height *= heightResizeFactor;
        context.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, canvas.width, canvas.height);
        if (cbOfResizeCanvas) {
            cbOfResizeCanvas();
        }
    };
};