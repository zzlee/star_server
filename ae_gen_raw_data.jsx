{
	//ag_gen_raw_data
	//NOTE: "one shot" and "H264" outputModule template must be manually set in After Effects before running ag_gen_raw_data.jsx
	
	function genRawData() {
	
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
			myRenderQueueItem.timeSpanDuration = 0.034;
			myRenderQueueItem.timeSpanStart = Number( _keyFrameTime );
			myRenderQueueItem.outputModule(1).applyTemplate("one_shot");
			myRenderQueueItem.outputModule(1).file = new File(AepDir.toString()+"\\raw_data\\_keyframe_"+_customizableObjectID+"_[#####].png");
			app.project.renderQueue.render();
			myRenderQueueItem.remove();
			
			var foundFiles1 = rawDataFolder.getFiles("_keyframe_"+_customizableObjectID+"_?????.png");
			if ( !foundFiles1[1].rename("keyframe_"+_customizableObjectID+".png") )
				return "Fail to rename generated .png file"; 
			//delete rest of other duplicated .png files	
			var foundFiles2 = rawDataFolder.getFiles("_*.png");
			for (var k in foundFiles2) {
				if ( !foundFiles2[k].remove() )
					return "Cannot remove "+foundFiles2[k].toString();
			}
		}

		
		//app.open(File("D:\\nodejs_projects\\i_am_a_super_star\\public\\contents\\template\\coffee_time\\coffee_time.aep"));  //for test only
		//app.open(File("D:\\nodejs_projects\\i_am_a_super_star\\public\\contents\\template\\memory\\memory.aep"));  //for test only
		if (!app.project) {
			alert ("A templat AEP must be open to use this script.");
			return "The templat AEP is not yet opened. ";
		}


		var AepDir = File(app.project.file).parent.toString();
		
		//TODO: make sure the render queue is empty

		//read template_definition.xml 
		var templateDefinitionXmlFile = new File(AepDir.toString()+"\\template_definition.xml")
		var file1OK = templateDefinitionXmlFile.open("r");
		if (file1OK){
			var templateDefinitionXmlString =  templateDefinitionXmlFile.read();
			var templateDefinitionXml = new XML (templateDefinitionXmlString);
			templateDefinitionXmlFile.close();
			
			var rawDataFolder = new Folder(AepDir+"\\raw_data");
			if (!rawDataFolder.create())
				return "Cannot create raw_data folder";
			
			var AepItems = app.project.items;
			var myCompo = getItem(AepItems, templateDefinitionXml.composition);
			if ( myCompo == null ) {
				return "Cannot find the specified compositon";
			}
		

			//generate template_raw_data_description.xml
			$.writeln("Generating template_raw_data_description.xml ...");
			var rawDataXmlFile = new File(AepDir.toString()+"\\raw_data\\template_raw_data_description.xml")
			var file2OK = rawDataXmlFile.open("w");
			rawDataXmlFile.encoding = "UTF-8";
			
			var DescriptionXmlFile = new File(AepDir.toString()+"\\raw_data\\template_description.xml")
			var file3OK = DescriptionXmlFile.open("w");
			DescriptionXmlFile.encoding = "UTF-8";
			
			var customizableObjectListXmlFile = new File(AepDir.toString()+"\\raw_data\\template_customizable_object_list.xml")
			var file4OK = customizableObjectListXmlFile.open("w");
			customizableObjectListXmlFile.encoding = "UTF-8";
			
			if (file2OK && file3OK&&file4OK){
				var rawDataXml = new XML ("<template_raw_data/>");
				rawDataXml.ID = templateDefinitionXml.ID;
				rawDataXml.name = templateDefinitionXml.name;
				rawDataXml.description = templateDefinitionXml.description;
				rawDataXml.composition = templateDefinitionXml.composition;
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
						aCustomizableObjectInRawData.key_frame = "keyframe_"+customizableObjects[j].ID+".png";
						//aCustomizableObjectInRawData.x =
						//aCustomizableObjectInRawData.y = 
						//aCustomizableObjectInRawData.width = 
						//aCustomizableObjectInRawData.height = 
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
					aCustomizableObjectInRawData.key_frame = "keyframe_"+aCustomizableObject.ID+".png";
					//aCustomizableObjectInRawData.x =
					//aCustomizableObjectInRawData.y = 
					//aCustomizableObjectInRawData.width = 
					//aCustomizableObjectInRawData.height = 
					customizableObjectListXml.appendChild(aCustomizableObjectInRawData);
					
					//generate the corresponding key frame
					generateKeyFrame( aCustomizableObject.ID, aCustomizableObject.key_frame_time );
				}
				customizableObjectListXmlFile.write(customizableObjectListXml.toXMLString());
				customizableObjectListXmlFile.close();
								
				rawDataXml.appendChild(customizableObjectListXml);
				rawDataXmlFile.write(rawDataXml.toXMLString());
				rawDataXmlFile.close();
			}		
			else {
				return "Cannot create template_raw_data_description.xml";
			}
			

		}
		else {
			return "Cannot open template_definition.xml";
		}
		
		//app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);  //for test only
		
		return "Raw data is generated successfully.";
	}

	var result = genRawData();
	$.writeln(result);
}