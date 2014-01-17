function PhotoCropper(divID, stageAllowableWidth, stageAllowableHeight, photoUrl, cropperWidthToHeightRatio) {
	
	this.croppedArea = {x:0,  //fraction relative to its width
						y:0,  //fraction relative to its height
						width:0,  //fraction relative to its width
						height:0  //fraction relative to its height
						};

	var stage;
	var photoToCropGroup, photoToCropImg, cropperGroup, cropperImg;
	var photoWidthToHeightRatio;
	var _this = this;
	
	var undateCropperArea = function()
	{
		_this.croppedArea.x = (cropperGroup.attrs.x+cropperGroup.get(".topLeft")[0].attrs.x) / photoToCropImg.attrs.width;
		_this.croppedArea.y = (cropperGroup.attrs.y+cropperGroup.get(".topLeft")[0].attrs.y) / photoToCropImg.attrs.height;
		_this.croppedArea.width = cropperImg.attrs.width / photoToCropImg.attrs.width;
		_this.croppedArea.height = cropperImg.attrs.height / photoToCropImg.attrs.height;
	}

	var updateAnchor = function(group, activeAnchor) {
		group.add(activeAnchor);
		//localStorage.temp = JSON.parse(group);
		var topLeft = group.get(".topLeft")[0];
		var topRight = group.get(".topRight")[0];
		var bottomRight = group.get(".bottomRight")[0];
		var bottomLeft = group.get(".bottomLeft")[0];
		var image = group.get(".image")[0];
        var cropperRect = group.get(".cropperRect")[0];
        var markerCircle = group.get(".markerCircle")[0];
		//console.log();
		//console.log("activeAnchor.getName() " + activeAnchor.getName());
		//console.dir("topLeft " + topLeft);
		//console.dir("topRight " + topRight);
		//console.dir("bottomRight " + bottomRight);
		//console.dir("bottomLeft " + bottomLeft);
		//console.log("------------------------------");
		//GZ
		var center = { x:0, y:0 };  
		var imageWidthToHeightRatio = image.attrs.width / image.attrs.height; 
		var newHalfWidth, newHalfHeight;

		// update anchor positions with the one being dragged
		switch (activeAnchor.getName()) {
			case "topLeft":
				center.x = (bottomLeft.attrs.x+bottomRight.attrs.x)/2;
				//center.x = (bottomLeft.getAttr('x') + bottomRight.getAttr('x')) / 2;
				center.y = (topRight.attrs.y+bottomRight.attrs.y)/2;
				
				newHalfWidth = center.x - topLeft.attrs.x;
				newHalfHeight = center.y - topLeft.attrs.y;
									
				if ( newHalfWidth/newHalfHeight < imageWidthToHeightRatio) {
					topLeft.attrs.y = center.y - newHalfWidth/imageWidthToHeightRatio;
				}
				else {
					topLeft.attrs.x = center.x - newHalfHeight*imageWidthToHeightRatio;
				}
				
				newHalfWidth = center.x - topLeft.attrs.x;
				newHalfHeight = center.y - topLeft.attrs.y;
				
				topRight.attrs.x = center.x + newHalfWidth;
				topRight.attrs.y = center.y - newHalfHeight;
				bottomRight.attrs.x = center.x + newHalfWidth;
				bottomRight.attrs.y = center.y + newHalfHeight;
				bottomLeft.attrs.x = center.x - newHalfWidth;
				bottomLeft.attrs.y = center.y + newHalfHeight;
			
				break;
				
			case "topRight":
				center.x = (bottomLeft.attrs.x+bottomRight.attrs.x)/2;
				center.y = (topLeft.attrs.y+bottomLeft.attrs.y)/2;
				
				newHalfWidth = topRight.attrs.x - center.x;
				newHalfHeight = center.y - topRight.attrs.y;
				
				if ( newHalfWidth/newHalfHeight < imageWidthToHeightRatio) {
					topRight.attrs.y = center.y - newHalfWidth/imageWidthToHeightRatio;
				}
				else {
					topRight.attrs.x = center.x + newHalfHeight*imageWidthToHeightRatio;
				}
				
				newHalfWidth = topRight.attrs.x - center.x;
				newHalfHeight = center.y - topRight.attrs.y;
				
				topLeft.attrs.x = center.x - newHalfWidth;
				topLeft.attrs.y = center.y - newHalfHeight;
				bottomRight.attrs.x = center.x + newHalfWidth;
				bottomRight.attrs.y = center.y + newHalfHeight;
				bottomLeft.attrs.x = center.x - newHalfWidth;
				bottomLeft.attrs.y = center.y + newHalfHeight;
			
				break;
				
			case "bottomRight":
				center.x = (topLeft.attrs.x+topRight.attrs.x)/2;
				center.y = (topLeft.attrs.y+bottomLeft.attrs.y)/2;
			
				newHalfWidth = bottomRight.attrs.x - center.x;
				newHalfHeight = bottomRight.attrs.y - center.y;
				
				if ( newHalfWidth/newHalfHeight < imageWidthToHeightRatio) {
					bottomRight.attrs.y = center.y + newHalfWidth/imageWidthToHeightRatio;
				}
				else {
					bottomRight.attrs.x = center.x + newHalfHeight*imageWidthToHeightRatio;
				}
				
				newHalfWidth = bottomRight.attrs.x - center.x;
				newHalfHeight = bottomRight.attrs.y - center.y;
				
				topLeft.attrs.x = center.x - newHalfWidth;
				topLeft.attrs.y = center.y - newHalfHeight;
				topRight.attrs.x = center.x + newHalfWidth;
				topRight.attrs.y = center.y - newHalfHeight;
				bottomLeft.attrs.x = center.x - newHalfWidth;
				bottomLeft.attrs.y = center.y + newHalfHeight;
			
				break;
				
			case "bottomLeft":
				center.x = (topLeft.attrs.x+topRight.attrs.x)/2;
				center.y = (topRight.attrs.y+bottomRight.attrs.y)/2;
			
				newHalfWidth = center.x - bottomLeft.attrs.x;
				newHalfHeight = bottomLeft.attrs.y - center.y;
				
				if ( newHalfWidth/newHalfHeight < imageWidthToHeightRatio) {
					bottomLeft.attrs.y = center.y + newHalfWidth/imageWidthToHeightRatio;
				}
				else {
					bottomLeft.attrs.x = center.x - newHalfHeight*imageWidthToHeightRatio;
				}
				
				newHalfWidth = center.x - bottomLeft.attrs.x;
				newHalfHeight = bottomLeft.attrs.y - center.y;
				
				topLeft.attrs.x = center.x - newHalfWidth;
				topLeft.attrs.y = center.y - newHalfHeight;
				topRight.attrs.x = center.x + newHalfWidth;
				topRight.attrs.y = center.y - newHalfHeight;
				bottomRight.attrs.x = center.x + newHalfWidth;
				bottomRight.attrs.y = center.y + newHalfHeight;
			
				break;
		}
		
		
		// limit anchor positions within the boundaries
		var needToUpdatAllCorners = false;
		if ( group.attrs.x+topRight.attrs.x > stage.attrs.width ) {
			topRight.attrs.x = stage.attrs.width - group.attrs.x;
			
			newHalfWidth = topRight.attrs.x - center.x;
			newHalfHeight = newHalfWidth/imageWidthToHeightRatio;
			
			needToUpdatAllCorners = true;
			
		} 
		if ( group.attrs.x+topLeft.attrs.x < 0 ) {
			topLeft.attrs.x = -group.attrs.x;
			
			newHalfWidth = center.x - topLeft.attrs.x;
			newHalfHeight = newHalfWidth/imageWidthToHeightRatio;
			
			needToUpdatAllCorners = true;
			
		}
		if ( group.attrs.y+bottomRight.attrs.y > stage.attrs.height ) {
			bottomRight.attrs.y = stage.attrs.height - group.attrs.y;
			
			newHalfHeight = bottomRight.attrs.y - center.y;
			newHalfWidth = newHalfHeight*imageWidthToHeightRatio;
			
			needToUpdatAllCorners = true;
			
		}
		if ( group.attrs.y+topRight.attrs.y <0 ) {
			topRight.attrs.y = -group.attrs.y;
			
			newHalfHeight = center.y - topRight.attrs.y;
			newHalfWidth = newHalfHeight*imageWidthToHeightRatio;
			
			needToUpdatAllCorners = true;
			
		}
			
		if ( needToUpdatAllCorners ) {	
			topLeft.attrs.x = center.x - newHalfWidth;
			topLeft.attrs.y = center.y - newHalfHeight;
			topRight.attrs.x = center.x + newHalfWidth;
			topRight.attrs.y = center.y - newHalfHeight;
			bottomRight.attrs.x = center.x + newHalfWidth;
			bottomRight.attrs.y = center.y + newHalfHeight;
			bottomLeft.attrs.x = center.x - newHalfWidth;
			bottomLeft.attrs.y = center.y + newHalfHeight;
		}



		image.setPosition(topLeft.attrs.x, topLeft.attrs.y);

		var width = newHalfWidth*2;
		var height = newHalfHeight*2;
		if(width && height) {
			image.setSize(width, height);
		}
/**/
        cropperRect.attrs.x = topLeft.attrs.x;
        cropperRect.attrs.y = topLeft.attrs.y;
        cropperRect.attrs.width = newHalfWidth*2;
        cropperRect.attrs.height = newHalfHeight*2;
        markerCircle.attrs.x = bottomRight.attrs.x;
        markerCircle.attrs.y = bottomRight.attrs.y;
        
		
		undateCropperArea();
	}

	var addAnchor = function(group, x, y, name) {
		var stage = group.getStage();
		var layer = group.getLayer();

		var anchor = new Kinetic.Circle({
			x: x,
			y: y,
			stroke: "#fff",
			fill: "#fff",
			strokeWidth: 2,
			radius: 40,
			name: name,
			draggable: true
		});
		//console.dir(anchor);
		anchor.setOpacity(0.0);
		
		anchor.on("dragmove", function() {	
			//console.dir(group);
			updateAnchor(group, this);
			layer.draw();
		});
		anchor.on("mousedown touchstart", function() {
			group.setDraggable(false);
			this.moveToTop();
		});
		anchor.on("dragend", function() {
			group.setDraggable(true);
			layer.draw();
		});
		// add hover styling
		anchor.on("mouseover", function() {
			var layer = this.getLayer();
			document.body.style.cursor = "pointer";
			this.setStrokeWidth(4);
			layer.draw();
		});
		anchor.on("mouseout", function() {
			var layer = this.getLayer();
			document.body.style.cursor = "default";
			this.setStrokeWidth(2);
			layer.draw();
		});

		group.add(anchor);
	}

	var loadImages = function(sources, callback) {
		var images = {};
		var loadedImages = 0;
		var numImages = 0;
		for(var src in sources) {
			numImages++;
		}
		
		
		for(var src in sources) {
			images[src] = new Image();
			images[src].onload = function() {
				if(++loadedImages >= numImages) {
					photoWidthToHeightRatio = images.photoToCrop.width/images.photoToCrop.height;
					callback(images);
				}
			};
			images[src].src = sources[src];
		}
	}

	var initStage = function(images) {
        
        var stageWidth, stageHeight, stageX, stageY;
        if ( stageAllowableWidth/stageAllowableHeight < photoWidthToHeightRatio ) {  
            stageWidth = stageAllowableWidth;
            stageHeight = stageAllowableWidth/photoWidthToHeightRatio;
            stageX = 0;
            stageY = (stageAllowableHeight-stageHeight)/2;
        }
        else {
            stageHeight = stageAllowableHeight;
            stageWidth = stageHeight*photoWidthToHeightRatio;
            stageX = (stageAllowableWidth-stageWidth)/2;
            stageY = 0;
        }
        
		stage = new Kinetic.Stage({
			container: divID,
			width: stageWidth,
			height: stageHeight
            //offset: {x: stageX, y: stageY }
		});
		photoToCropGroup = new Kinetic.Group({
			x: 0,
			y: 0,
			draggable: false
		});
		cropperGroup = new Kinetic.Group({
			x: 0,
			y: 0,
			draggable: true
		});
		var layer = new Kinetic.Layer();

		/*
		* go ahead and add the groups
		* to the layer and the layer to the
		* stage so that the groups have knowledge
		* of its layer and stage
		*/
		layer.add(photoToCropGroup);
		layer.add(cropperGroup);
		stage.add(layer);

		// photo to crop
		photoToCropImg = new Kinetic.Image({
			x: 0,
			y: 0,
			image: images.photoToCrop,
			width: stage.attrs.width,
			height: stage.attrs.height,
			name: "image"
		});

		photoToCropGroup.add(photoToCropImg);

		// cropper
		var cropperImgWidth, cropperImgHeight;
		if ( cropperWidthToHeightRatio <= photoWidthToHeightRatio) {
			cropperImgHeight = photoToCropImg.attrs.height/2;
			cropperImgWidth = cropperImgHeight*cropperWidthToHeightRatio;
		}
		else {
			cropperImgWidth = photoToCropImg.attrs.width/2;
			cropperImgHeight = cropperImgWidth/cropperWidthToHeightRatio;
		}
        cropperGroup.attrs.x = photoToCropImg.attrs.width/2 - cropperImgWidth/2;
        cropperGroup.attrs.y = photoToCropImg.attrs.height/2 - cropperImgHeight/2;
        
	//	var widthFrame = (stageAllowableWidth / 20) * 16;
	//	var heightFrame = (stageAllowableHeight / 20) * 9;
		cropperImg = new Kinetic.Image({
			x: 0,
			y: 0,
			image: images.cropper,
			width: cropperImgWidth,
			height: cropperImgHeight,
			name: "image"
		});
        
        var cropperRect = new Kinetic.Rect({
                                          x: 0,
                                          y: 0,
                                          width: cropperImg.attrs.width,
                                          height: cropperImg.attrs.height,
                                          stroke: 'white',
                                          strokeWidth: 2,
                                          name: "cropperRect"
                                          });

		var markerCircle = new Kinetic.Circle({
                                        x: cropperImg.attrs.width,
                                        y: cropperImg.attrs.height,
                                        stroke: "white",
                                        fill: "white",
                                        strokeWidth: 1,
                                        radius: 5,
                                        name: "markerCircle"
                                        });
        
		cropperGroup.add(cropperImg);

		addAnchor(cropperGroup, 0, 0, "topLeft");
		addAnchor(cropperGroup, cropperImg.attrs.width, 0, "topRight");
		addAnchor(cropperGroup, cropperImg.attrs.width, cropperImg.attrs.height, "bottomRight");
		addAnchor(cropperGroup, 0, cropperImg.attrs.height, "bottomLeft");
        cropperGroup.add(cropperRect);
		cropperGroup.add(markerCircle);
        
		undateCropperArea();

		cropperGroup.on("dragstart", function() {
			this.moveToTop();
		});

		cropperGroup.on("dragmove", function() {
			// limit the cropper within the boundaries
			if ( cropperGroup.attrs.x+cropperGroup.get(".topLeft")[0].attrs.x < 0 ) {
				cropperGroup.attrs.x = -cropperGroup.get(".topLeft")[0].attrs.x;
			}
			if ( cropperGroup.attrs.x+cropperGroup.get(".topRight")[0].attrs.x > stage.attrs.width ) {
				cropperGroup.attrs.x = stage.attrs.width - cropperGroup.get(".topRight")[0].attrs.x;
			}
			if ( cropperGroup.attrs.y+cropperGroup.get(".topLeft")[0].attrs.y < 0 ) {
				cropperGroup.attrs.y = -cropperGroup.get(".topLeft")[0].attrs.y;
			}
			if ( cropperGroup.attrs.y+cropperGroup.get(".bottomRight")[0].attrs.y > stage.attrs.height ) {
				cropperGroup.attrs.y = stage.attrs.height - cropperGroup.get(".bottomRight")[0].attrs.y;
			}
			
			undateCropperArea();
		});

		
		stage.draw();
	}
	
	var sources = {
		photoToCrop: photoUrl,
		cropper: "./img/cropper.png"
	};
	loadImages(sources, initStage);
}

PhotoCropper.prototype.getCroppedArea = function() {
	return this.croppedArea;
}

function showCropper(templete){

}
