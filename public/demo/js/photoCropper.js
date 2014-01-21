function PhotoCropper(divID, stageAllowableWidth, stageAllowableHeight, photoUrl, cropperWidthToHeightRatio) {
	
	this.croppedArea = {x:0,  //fraction relative to its width
						y:0,  //fraction relative to its height
						width:0,  //fraction relative to its width
						height:0  //fraction relative to its height
						};

	var stage;
	var photoToCropGroup, photoToCropImg, cropperGroup, cropperImg;
	var photoWidthToHeightRatio;
	var underCropperGroup;
	var _this = this;
	var tmpTopHeight, tmpLeftBottomY, tmpLeftWidth;
	var tmpLeftPostionY;//underLeft's position.
	var tmpBottomHeight;
	var flag = true;
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
		//var underTop = underCropperGroup.get(".underRectTop")[0];
		var underLeft = photoToCropGroup.get(".underRectLeft")[0];
		var underRight = photoToCropGroup.get(".underRectRight")[0];
		var underBottom = photoToCropGroup.get(".underRectBottom")[0];
				//console.log();
		//console.dir(underTop);
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
				//--------------------------------

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
		
		/**
		 * Show the opacity black rect to let user know the cropper position.
		 */
		 /*
		photoToCropGroup.get(".underRectBottom")[0].attrs.height = tmpTopHeight + topRight.attrs.y + 0.1;
		
		underLeft.attrs.width = tmpLeftWidth + topLeft.attrs.x;
		underLeft.attrs.height = (bottomLeft.attrs.y - topLeft.attrs.y) + 0.08;
		underLeft.attrs.y = tmpLeftPostionY + topLeft.attrs.y;
		
		underRight.attrs.x = underLeft.attrs.width + newHalfWidth * 2;
		underRight.attrs.y = underLeft.attrs.y;
		underRight.attrs.width = photoToCropImg.attrs.width - (tmpLeftWidth + topLeft.attrs.x + newHalfWidth * 2);
		underRight.attrs.height = underLeft.attrs.height + 0.08;
		
		underBottom.attrs.height = tmpBottomHeight + bottomRight.attrs.y;
		underBottom.attrs.y = tmpBottomHeight + bottomRight.attrs.y;

*/
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
	//Add the anchor to let user drag move the cropper frame.
	var addAnchor = function(group, x, y, name) {
		var stage = group.getStage();
		var layer = group.getLayer();
		//var underLayer = photoToCropGroup.getLayer();

		var anchor = new Kinetic.Circle({
			x: x,
			y: y,
			stroke: "#F25C27",
			fill: "#F25C27",
			strokeWidth: 2,
			radius: 9,
			name: name,
			draggable: true
		});
		//console.dir(anchor);
		//anchor.setOpacity(0.0);
		
		anchor.on("dragmove", function() {	
			updateAnchor(group, this);
			layer.draw();
			//underLayer.draw();
		});
		anchor.on("mousedown touchstart", function() {
			group.setDraggable(false);
			this.moveToTop();
			
		});
		anchor.on("dragend", function() {
			
			group.setDraggable(true);
			layer.draw();
			//underLayer.draw();
		});
		// add hover styling
		anchor.on("mouseover", function() {
			var layer = this.getLayer();
			document.body.style.cursor = "pointer";
			this.setStrokeWidth(4);
			layer.draw();
			//underLayer.draw();
		});
		anchor.on("mouseout", function() {
			var layer = this.getLayer();
			document.body.style.cursor = "default";
			this.setStrokeWidth(2);
			layer.draw();
			//underLayer.draw();
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
		blackImg = new Kinetic.Image({
			x : 0,
			y : 0,
			//fill : 'black',
			//opacity: 0.8,
			width: stage.attrs.width,
			height: stage.attrs.height,
			name : "underCover"
		});

		photoToCropGroup.add(photoToCropImg);
		photoToCropGroup.add(blackImg);

		
		//photoToCropGroup.add(underCropper);
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
		
        var underRectTop = new Kinetic.Rect({
										  x: 0,
                                          y: 0,
                                          width: photoToCropImg.attrs.width,
                                          height: cropperGroup.attrs.y,
                                          //stroke: 'white',
                                          //strokeWidth: 2,
										  fill: 'black',
										  opacity: 0.5,
                                          name: "underRectTop"
										});
		var underRectLeft = new Kinetic.Rect({
										  x: 0,
                                          y: cropperGroup.attrs.y,
                                          width: cropperGroup.attrs.x,
                                          height: cropperImgHeight,
                                          //stroke: 'white',
                                          //strokeWidth: 2,
										  fill: 'black',
										  opacity: 0.5,
                                          name: "underRectLeft"
										});
		var underRectRight = new Kinetic.Rect({
										  x: cropperGroup.attrs.x + cropperImgWidth ,
                                          y: cropperGroup.attrs.y,
                                          width: photoToCropImg.attrs.width - (cropperGroup.attrs.x + cropperImgWidth),
                                          height: cropperImgHeight,
                                          //stroke: 'white',
                                          //strokeWidth: 2,
										  fill: 'black',
										  opacity: 0.5,
                                          name: "underRectRight"
										});
		var underBottom = new Kinetic.Rect({
										  x: 0 ,
                                          y: cropperImgHeight + cropperGroup.attrs.y ,
                                          width: photoToCropImg.attrs.width,
                                          height: photoToCropImg.attrs.height - (cropperGroup.attrs.y + cropperImgHeight),
                                          //stroke: 'white',
                                          //strokeWidth: 2,
										  fill: 'black',
										  opacity: 0.5,
                                          name: "underRectBottom"
										});
		//photoToCropGroup.add(underRectTop);
		//photoToCropGroup.add(underRectLeft);
		//photoToCropGroup.add(underRectRight);
		//photoToCropGroup.add(underBottom);
		//underCropperGroup = photoToCropGroup;
		/*
		if(flag){
			tmpTopHeight = photoToCropGroup.get(".underRectTop")[0].attrs.height;
			tmpBottomHeight = photoToCropGroup.get(".underRectBottom")[0].attrs.height;
			tmpLeftWidth = photoToCropGroup.get(".underRectLeft")[0].attrs.width;
			tmpLeftPostionY = photoToCropGroup.get(".underRectLeft")[0].attrs.y;
			flag = false;
			
		}
*/
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
										  //fill: 'Red',
										  //opacity: 0.5,
                                          width: cropperImg.attrs.width,
                                          height: cropperImg.attrs.height,
                                          stroke: '#F25C27',
                                          strokeWidth: 3,
                                          name: "cropperRect"
                                          });

		var markerCircle = new Kinetic.Circle({
                                        x: cropperImg.attrs.width,
                                        y: cropperImg.attrs.height,
                                        stroke: "#F25C27",
                                        fill: "#F25C27",
                                        strokeWidth: 1,
                                        radius: 4,
                                        name: "markerCircle"
                                        });
										


		cropperGroup.add(cropperImg);
		//cropperGroup.add(underCropper);
		addAnchor(cropperGroup, 0, 0, "topLeft");
		addAnchor(cropperGroup, cropperImg.attrs.width, 0, "topRight");
		addAnchor(cropperGroup, cropperImg.attrs.width, cropperImg.attrs.height, "bottomRight");
		addAnchor(cropperGroup, 0, cropperImg.attrs.height, "bottomLeft");
        cropperGroup.add(cropperRect);
		cropperGroup.add(markerCircle);
        
		undateCropperArea();

		cropperGroup.on("dragstart", function() {
			this.moveToTop();
			//photoToCropGroup.moveToTop();
			/*
			underCropperGroup.get(".underRectTop")[0];
			underCropperGroup.get(".underRectLeft")[0];
			underCropperGroup.get(".underRectRight")[0];
			underCropperGroup.get(".underRectBottom")[0];
			*/
		
			//underRight.attrs.x = underLeft.attrs.width + newHalfWidth * 2;
			//underRight.attrs.y = underLeft.attrs.y;
			//underRight.attrs.width = photoToCropImg.attrs.width - (tmpLeftWidth + topLeft.attrs.x + newHalfWidth * 2);
			//underRight.attrs.height = underLeft.attrs.height + 0.08;
		
			//underBottom.attrs.height = tmpBottomHeight + bottomRight.attrs.y;
			//underBottom.attrs.y = tmpBottomHeight + bottomRight.attrs.y;
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
			//console.log("cropperGroup.attrs.y " + cropperGroup.attrs.y);
			
			//underCropperGroup.get(".underRectTop")[0].attrs.height = tmpTopHeight + cropperGroup.get(".topRight")[0].attrs.y + 0.1;
			/*
			photoToCropGroup.get(".underRectTop")[0].attrs.height = cropperGroup.attrs.y;
			photoToCropGroup.get(".underRectLeft")[0].attrs.width = cropperGroup.attrs.x;
			photoToCropGroup.get(".underRectLeft")[0].attrs.y = cropperGroup.attrs.y;
			//underCropperGroup.get(".underRectRight")[0].attrs.y = cropperGroup.attrs.y;
			//underCropperGroup.get(".underRectRight")[0].attrs.width = photoToCropGroup.attrs.width - (cropperGroup.attrs.x + 0) ;
			console.log("cropperGroup.attrs.x" + cropperGroup.attrs.x);
			*/
			//console.log("====================");
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

