{
	//ag_gen_raw_data
	//NOTE: "one shot" outputModule template must be manually set in After Effects before running ag_gen_raw_data.jsx
	
	var samplingRate = 5; //fps
	var samplingPeriod = 1/samplingRate; //sec
	
	function genRawData() {

		var AepItems;
		var myCompo;
	
	
		function getItem(_items, _name) {
			var itemIndex = -1;
			
			for (var i = 1; i <= _items.length; i++) {
				if ( _items[i].name == _name ) {
					itemIndex = i;
				}
			}	

			 if ( itemIndex != -1 ) {
				 return _items[itemIndex];
			}
			else {
				return null;
			}
		}
		
		function generateKeyFrame( _customizableObjectID, _keyFrameTime ) {
			$.writeln("Generating key frame for "+_customizableObjectID+" ....");
			app.project.renderQueue.items.add(myCompo);
			var myRenderQueueItem = app.project.renderQueue.item(1);
			myRenderQueueItem.applyTemplate("Best Settings");
			myRenderQueueItem.timeSpanDuration = 0.05;
			myRenderQueueItem.timeSpanStart = Number( _keyFrameTime );
			myRenderQueueItem.outputModule(1).applyTemplate("one_shot");
			myRenderQueueItem.outputModule(1).file = new File(AepDir.toString()+"\\raw_data\\_keyframe_"+_customizableObjectID+"_[#####].jpg");
			app.project.renderQueue.render();
			myRenderQueueItem.remove();
			
			var foundFiles1 = rawDataFolder.getFiles("_keyframe_"+_customizableObjectID+"_?????.jpg");
			if ( !foundFiles1[1].rename("keyframe_"+_customizableObjectID+".jpg") )
				return "Fail to rename generated .jpg file"; 
			//delete rest of other duplicated .jpg files	
			var foundFiles2 = rawDataFolder.getFiles("_*.jpg");
			for (var k in foundFiles2) {
				if ( !foundFiles2[k].remove() )
					return "Cannot remove "+foundFiles2[k].toString();
			}
		}

		function generatePreviewKeyFrame( _customizableObjectID, _keyFramePreviewStart, _keyFramePreviewEnd  ) {
			$.writeln("Generating key frame for "+_customizableObjectID+" ....");
			app.project.renderQueue.items.add(myCompo);
			var myRenderQueueItem = app.project.renderQueue.item(1);
			myRenderQueueItem.applyTemplate("5fps_setting");
			myRenderQueueItem.timeSpanDuration = Number(_keyFramePreviewEnd) - Number(_keyFramePreviewStart);
			myRenderQueueItem.timeSpanStart = Number( _keyFramePreviewStart );
			myRenderQueueItem.outputModule(1).applyTemplate("jpg_preview");
			myRenderQueueItem.outputModule(1).file = new File(AepDir.toString()+"\\raw_data\\preview_keyframe_"+_customizableObjectID+"_[#####].jpg");
			app.project.renderQueue.render();
			myRenderQueueItem.remove();
			
		}

		function generatePreviewKeyFrameDesXmlFile( _customizableObjectID, _keyFramePreviewStart, _videoWithTracker, _TrackerID, _trackPointUL, _trackPointUR, _trackPointLL, _trackPointLR  ) {
			
			var PreviewKeyFrameDesXmlFile = new File(AepDir.toString()+"\\raw_data\\"+_customizableObjectID+".xml")
			var file5OK = PreviewKeyFrameDesXmlFile.open("w");
			PreviewKeyFrameDesXmlFile.encoding = "UTF-8";
		
			if (file5OK) {
				var PreviewKeyFrameDesXml = new XML ("<template_preview/>");
				
				var foundPreviewFiles = rawDataFolder.getFiles("preview_keyframe_"+_customizableObjectID+"_?????.jpg");
				if ( foundPreviewFiles.length> 1 ) {
					
					var time = Number(_keyFramePreviewStart);
					for (var k in foundPreviewFiles) {
						var aPreviewKeyFrameDes = new XML("<preview_key_frame/>");
						var previewKeyFrameFilename = foundPreviewFiles[k].toString();
						aPreviewKeyFrameDes.source = previewKeyFrameFilename.substr(previewKeyFrameFilename.lastIndexOf('/')+1);

						aPreviewKeyFrameDes.time = time.toString();
						aPreviewKeyFrameDes.x = myCompo.layer(_customizableObjectID).position.valueAtTime( time, false )[0];
						aPreviewKeyFrameDes.y = myCompo.layer(_customizableObjectID).position.valueAtTime( time, false )[1];
						aPreviewKeyFrameDes.upper_left_corner_x = myCompo.layer(_videoWithTracker)("Motion Trackers")(_TrackerID)(_trackPointUL)("Feature Center").valueAtTime(time, false)[0];
						aPreviewKeyFrameDes.upper_left_corner_y = myCompo.layer(_videoWithTracker)("Motion Trackers")(_TrackerID)(_trackPointUL)("Feature Center").valueAtTime(time, false)[1];
						aPreviewKeyFrameDes.upper_right_corner_x = myCompo.layer(_videoWithTracker)("Motion Trackers")(_TrackerID)(_trackPointUR)("Feature Center").valueAtTime(time, false)[0];
						aPreviewKeyFrameDes.upper_right_corner_y = myCompo.layer(_videoWithTracker)("Motion Trackers")(_TrackerID)(_trackPointUR)("Feature Center").valueAtTime(time, false)[1];
						aPreviewKeyFrameDes.lower_left_corner_x = myCompo.layer(_videoWithTracker)("Motion Trackers")(_TrackerID)(_trackPointLL)("Feature Center").valueAtTime(time, false)[0];
						aPreviewKeyFrameDes.lower_left_corner_y = myCompo.layer(_videoWithTracker)("Motion Trackers")(_TrackerID)(_trackPointLL)("Feature Center").valueAtTime(time, false)[1];
						aPreviewKeyFrameDes.lower_right_corner_x = myCompo.layer(_videoWithTracker)("Motion Trackers")(_TrackerID)(_trackPointLR)("Feature Center").valueAtTime(time, false)[0];
						aPreviewKeyFrameDes.lower_right_corner_y = myCompo.layer(_videoWithTracker)("Motion Trackers")(_TrackerID)(_trackPointLR)("Feature Center").valueAtTime(time, false)[1];
						
						time += samplingPeriod;
						
						PreviewKeyFrameDesXml.appendChild(aPreviewKeyFrameDes);
					}
					
				}
				else {
				
					//TODO
				}
				PreviewKeyFrameDesXmlFile.write(PreviewKeyFrameDesXml.toXMLString());
				PreviewKeyFrameDesXmlFile.close();
			}
		}

		
		//app.open(File("D:\\nodejs_projects\\star_server\\public\\contents\\template\\coffee_time\\coffee_time.aep"));  //for test only
		//app.open(File("D:\\nodejs_projects\\star_server\\public\\contents\\template\\memory\\memory.aep"));  //for test only
		//app.open(File("D:\\nodejs_projects\\star_server\\public\\contents\\template\\\photo\\\photo.aep"));  //for test only
        app.open(File("D:\\nodejs_projects\\star_server\\public\\contents\\template\\rotate\\rotate.aep"));  //for test only
		if (!app.project) {
			alert ("A templat AEP must be open to use this script.");
			return "The templat AEP is not yet opened. ";
		}


		var AepDir = File(app.project.file).parent.toString();
		var rawDataFolder = new Folder(AepDir+"\\raw_data");
		if (!rawDataFolder.create())
			return "Cannot create raw_data folder";
		
		//TODO: make sure the render queue is empty

		//read template_definition.xml 
		var templateDefinitionXmlFile = new File(AepDir.toString()+"\\template_definition.xml")
		var file1OK = templateDefinitionXmlFile.open("r");
		if (file1OK){
			var templateDefinitionXmlString =  templateDefinitionXmlFile.read();
			var templateDefinitionXml = new XML (templateDefinitionXmlString);
			templateDefinitionXmlFile.close();
            
			AepItems = app.project.items;
			myCompo = getItem(AepItems, templateDefinitionXml.composition);
			if ( myCompo == null ) {
				return "Cannot find the specified compositon";
			}
	
						
		
			$.writeln("Generating template_description.xml ...");
			var DescriptionXmlFile = new File(AepDir.toString()+"\\raw_data\\template_description.xml")
			var file3OK = DescriptionXmlFile.open("w");
			DescriptionXmlFile.encoding = "UTF-8";
			
			$.writeln("Generating template_customizable_object_list.xml ...");
			var customizableObjectListXmlFile = new File(AepDir.toString()+"\\raw_data\\template_customizable_object_list.xml")
			var file4OK = customizableObjectListXmlFile.open("w");
			customizableObjectListXmlFile.encoding = "UTF-8";
			
			if (file3OK&&file4OK){
				var rawDataXml = new XML ("<template_raw_data/>");
				rawDataXml.ID = templateDefinitionXml.ID;
				rawDataXml.name = templateDefinitionXml.name;
				rawDataXml.description = templateDefinitionXml.description;
				rawDataXml.composition = templateDefinitionXml.composition;
				rawDataXml.composition_width = myCompo.width;
				rawDataXml.composition_height = myCompo.height;
				rawDataXml.raw_video = rawDataXml.ID+".avi"; //NOT yet generated
				
				DescriptionXmlFile.write(rawDataXml.toXMLString());
				DescriptionXmlFile.close();

				var customizableObjectListXml = new XML("<customizable_object_list/>");
				if ( templateDefinitionXml.customizable_object_list.customizable_object.length() > 1 ) {
					var customizableObjects = templateDefinitionXml.customizable_object_list.customizable_object;			
					for (var j in customizableObjects) {
						var aCustomizableObjectInRawData = new XML("<customizable_object/>");
						aCustomizableObjectInRawData.ID = customizableObjects[j].ID;
						aCustomizableObjectInRawData.format = customizableObjects[j].format;
						aCustomizableObjectInRawData.description = customizableObjects[j].description;
						aCustomizableObjectInRawData.key_frame = "keyframe_"+customizableObjects[j].ID+".jpg";
						//aCustomizableObjectInRawData.x =
						//aCustomizableObjectInRawData.y = 
						//aCustomizableObjectInRawData.width = 
						//aCustomizableObjectInRawData.height = 

						var theFootage = getItem(AepItems, customizableObjects[j].ID);
						if ( theFootage == null ) {
							return "Cannot find the specified footage";
						}
						aCustomizableObjectInRawData.original_width = theFootage.width;
						aCustomizableObjectInRawData.original_height = theFootage.height;
						
						
						//generate the corresponding preview key frames
						generatePreviewKeyFrame( customizableObjects[j].ID, customizableObjects[j].key_frame_preview_start, customizableObjects[j].key_frame_preview_end );
						generatePreviewKeyFrameDesXmlFile( customizableObjects[j].ID, 
															customizableObjects[j].key_frame_preview_start, 
															customizableObjects[j].video_with_tracker,
															customizableObjects[j].tracker_ID,
															customizableObjects[j].track_point_upper_left,
															customizableObjects[j].track_point_upper_right,
															customizableObjects[j].track_point_lower_left,
															customizableObjects[j].track_point_lower_right
															);
						/*
						var foundPreviewFiles = rawDataFolder.getFiles("preview_keyframe_"+customizableObjects[j].ID+"_?????.jpg");
						for (var k in foundPreviewFiles) {
							var previewKeyFrameFilename = foundPreviewFiles[k].toString();
							aCustomizableObjectInRawData.preview_key_frame = previewKeyFrameFilename.substr(previewKeyFrameFilename.lastIndexOf('/')+1);
						}
						*/
						
							
						customizableObjectListXml.appendChild(aCustomizableObjectInRawData);
						
						//generate the corresponding key frame
						generateKeyFrame( customizableObjects[j].ID, customizableObjects[j].key_frame_time );
						
					}
				}
				else {
					var aCustomizableObject = templateDefinitionXml.customizable_object_list.customizable_object;			
					var aCustomizableObjectInRawData = new XML("<customizable_object/>");
					aCustomizableObjectInRawData.ID = aCustomizableObject.ID;
					aCustomizableObjectInRawData.format = aCustomizableObject.format;
					aCustomizableObjectInRawData.description = aCustomizableObject.description;
					aCustomizableObjectInRawData.key_frame = "keyframe_"+aCustomizableObject.ID+".jpg";
					//aCustomizableObjectInRawData.x =
					//aCustomizableObjectInRawData.y = 
					//aCustomizableObjectInRawData.width = 
					//aCustomizableObjectInRawData.height = 

					var theFootage = getItem(AepItems, aCustomizableObject.ID);
					if ( theFootage == null ) {
						return "Cannot find the specified footage";
					}
					aCustomizableObjectInRawData.original_width = theFootage.width;
					aCustomizableObjectInRawData.original_height = theFootage.height;
						
					
					//generate the corresponding preview key frames
					generatePreviewKeyFrame( aCustomizableObject.ID, aCustomizableObject.key_frame_preview_start, aCustomizableObject.key_frame_preview_end );
					generatePreviewKeyFrameDesXmlFile( aCustomizableObject.ID, 
														aCustomizableObject.key_frame_preview_start, 
														aCustomizableObject.video_with_tracker,
														aCustomizableObject.tracker_ID,
														aCustomizableObject.track_point_upper_left,
														aCustomizableObject.track_point_upper_right,
														aCustomizableObject.track_point_lower_left,
														aCustomizableObject.track_point_lower_right
														);
				
					customizableObjectListXml.appendChild(aCustomizableObjectInRawData);

					//generate the corresponding key frame
					generateKeyFrame( aCustomizableObject.ID, aCustomizableObject.key_frame_time );

				}
				
				customizableObjectListXmlFile.write(customizableObjectListXml.toXMLString());
				customizableObjectListXmlFile.close();
								
			}		
			else {
				return "Cannot create template_raw_data_description.xml";
			}
			

		}
		else {
			return "Cannot open template_definition.xml";
		}
		
		app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);  //for test only
		
		return "Raw data is generated successfully.";
	}

	var result = genRawData();
	$.writeln(result);
}