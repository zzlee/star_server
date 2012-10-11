{

	function replace() {
		var projectPath = "D:\\nodejs_projects\\i_am_a_super_star";  //TODO: get current project directory

		var templateAep_path, projectAep_path, customizdContentXML_path, projectID;
		var fileOK;

		//read ae_replace_args.xml 
		var argXmlFile = new File(projectPath+"\\ae_replace_args.xml")
		fileOK = argXmlFile.open("r");
		if (fileOK){
			var argXmlString = argXmlFile.read();
			var argXml = new XML (argXmlString);
			argXmlFile.close();
			
			templateAep_path = argXml.template_AEP;
			projectAep_path = argXml.project_AEP;
			customizedContentXML_path = argXml.customized_content_XML;
			projectID = argXml.project_ID;
			
			/*
			alert('templateAep_path='+templateAep_path
				+'\nprojectAep_path='+projectAep_path
				+'\ncustomizdContentXML_path='+customizedContentXML_path);
			*/
		}

		var templateAepFile = new File(templateAep_path);
		templateAepFile.copy(projectAep_path);

		var projectAepFile = new File(projectAep_path);
		app.open(projectAepFile);

		var project_items = app.project.items;

		//read customizdContentXML 
		var customizdContentXmlFile = new File(customizedContentXML_path)
		fileOK = customizdContentXmlFile.open("r");
		if (fileOK){
			var customizdContentXmlString = customizdContentXmlFile.read();
			var customizdContentXml = new XML (customizdContentXmlString);
			customizdContentXmlFile.close();
			
			var customizableObjects = customizdContentXml.customizable_object_list.customizable_object;
			
			if( customizableObjects.length() > 1 ) {
				for (var j in customizableObjects) {
					var itemIndex = -1;
					
					for (var i = 1; i <= project_items.length; i++) {
						if ( project_items[i].name == customizableObjects[j].ID ) {
							//photo_item = project_items[i];
							itemIndex = i;
							//alert("itemIndex = i;");
						}
					}
					
					if ( itemIndex != -1 ) {
						var newFootageSourceFile = new File(projectPath+"\\public\\contents\\user_project\\"
																			+projectID+"\\user_data\\"+customizableObjects[j].content);  
						
						app.project.item(itemIndex).replace( newFootageSourceFile );
					}
				}
			}
			else {
				var aCustomizableObject = customizableObjects;
				var itemIndex = -1;
				
				for (var i = 1; i <= project_items.length; i++) {
					if ( project_items[i].name == aCustomizableObject.ID ) {
						//photo_item = project_items[i];
						itemIndex = i;
						//alert("itemIndex = i;");
					}
				}
				
				if ( itemIndex != -1 ) {
					var newFootageSourceFile = new File(projectPath+"\\public\\contents\\user_project\\"
																		+projectID+"\\user_data\\"+aCustomizableObject.content);  
					
					app.project.item(itemIndex).replace( newFootageSourceFile );
				}
			}
			
		}
					
		app.project.close(CloseOptions.SAVE_CHANGES);
		return "Customized contents in movie project aep were replaced successfully!";
	}
	
	var result = replace();
	$.writeln(result);
	
}