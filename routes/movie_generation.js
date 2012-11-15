var fs = require('fs');
var path = require('path');
var workingPath = process.env.AE_PROJECT;
var movieMaker = require(workingPath+'/ae_render.js');


exports.uploadUserData_cb = function(req, res) {
	var resultMsg = '';
	var movieProjectDir = workingPath+'/public/contents/user_project/'+req.body.project_ID;
	fs.mkdir(movieProjectDir);
	var userDataDir = movieProjectDir + '/user_data';

	var startGeneratingMovie = function() {
		//start generating the movie
		console.log('Start generating the movie!');
		var html = '';
		if ( req.session.user.userId ) {
			html += '<p>Start generating the movie! <p/>'; 	
			movieMaker.renderMovie(req.body.project_ID, req.session.user.userId);
		}
		else {
			html += '<p>Fail to retrieve userID from session; movie generation halt ! <p/>'; 	
			console.log( 'Fail to retrieve userID from session; movie generation halt !' );			
		}
		html += '<p><a href="/">Go back</a><p/>';
		res.send(html);
	}
		
	var moveUploadedFileToUserDataFolder = function( _tmp_path, _target_path, _size, _moveUploadedFileToUserDataFolder_cb )  {
		var util = require('util');
			
		var is = fs.createReadStream(_tmp_path);
		var os = fs.createWriteStream(_target_path);
		
		util.pump(is, os, function(err) {
			if (!err) {
				fs.unlink(_tmp_path, function() {
					if (!err) {
						resultMsg += 'File uploaded to: ' + _target_path + ' - ' + _size + ' bytes <br/>';
						console.log( 'Finished uploading to ' + _target_path );
						
						//check if all the user data exist; (if yes, start generating the movie in startGeneratingMovie()
						//checkUserData(startGeneratingMovie);
						_moveUploadedFileToUserDataFolder_cb();
					}
					else {
						console.log('Fail to delete temporary uploaded file: '+err);
						res.send(null);
					}
				});
			}
			else {
				console.log('Fail to do util.pump(): '+err);
				res.send(null);
			}
		});			
	}
	
	var writeTo_customized_content_xml_cb = function (err) {
		if (!err) {
			console.log('customized_content.xml is generated.');
			
			//check if all the user data exist; (if yes, start generating the movie in startGeneratingMovie()
			//checkUserData(startGeneratingMovie);

			var targetDir = userDataDir; 

			if( Object.prototype.toString.call( req.body.customizable_object_ID ) === '[object Array]' ) {
			
				var i = 0;
				
				var doOneIteration = function ( ) {
					//recursively check if all the contents mentined in customized_content.xml exist
					
					if ( i < req.body.customizable_object_ID.length ) {		
						//get the temporary location of the file
						var tmp_path = uploadedFiles[req.body.customizable_object_ID[i]].path;
						//set where the file should actually exists - in this case it is in the "images" directory
						var target_path = targetDir + '/' + uploadedFiles[req.body.customizable_object_ID[i]].name;  
						//move the uploaded file to ./public/contents/[movie project ID]/user_data
						moveUploadedFileToUserDataFolder( tmp_path, target_path, uploadedFiles[req.body.customizable_object_ID[i]].size, function() {
							doOneIteration();
						});
					}
					else {
						startGeneratingMovie();
					}
					i++;
				};
				
				doOneIteration();
			}
			else {
				//get the temporary location of the file
				var tmp_path = uploadedFiles[req.body.customizable_object_ID].path;
				//set where the file should actually exists - in this case it is in the "images" directory
				var target_path = targetDir + '/' + uploadedFiles[req.body.customizable_object_ID].name;  
				//move the uploaded file to ./public/contents/[movie project ID]/user_data
				moveUploadedFileToUserDataFolder( tmp_path, target_path, uploadedFiles[req.body.customizable_object_ID].size, function() {
					startGeneratingMovie();
				});
			}
		}
		else {
			console.log('Fail to generate customized_content.xml: '+err);
			res.send(null);
		}
	};

	//checkUserData.cbIsCalled = false;  //the static flag to make sure the _checkUserData_cb is only called once (when making sure all the user data exists)

	var uploadedFiles = req.files;
	
	
	//==append the content in customized_content.xml==
	var builder = require('xmlbuilder');
	var userDataXml = builder.create('customizd_content',{'version': '1.0', 'encoding': 'UTF-8', 'standalone': true});
	userDataXml.ele('template_ID', req.body.template_ID);
	var customizableObjectListXml = userDataXml.ele('customizable_object_list');
	
	//var targetDir = userDataDir; 
	fs.mkdir(userDataDir);	


	if( Object.prototype.toString.call( req.body.customizable_object_ID ) === '[object Array]' ) {
		for (var i in req.body.customizable_object_ID) {
			//append the content in customized_content.xml
			var customizableObjectXml = customizableObjectListXml.ele('customizable_object');
			customizableObjectXml.ele('ID', req.body.customizable_object_ID[i] );
			customizableObjectXml.ele('format', req.body.format[i]);
			customizableObjectXml.ele('content', uploadedFiles[req.body.customizable_object_ID[i]].name);
		}
	}
	else {
		//append the content in customized_content.xml
		var customizableObjectXml = customizableObjectListXml.ele('customizable_object');
		customizableObjectXml.ele('ID', req.body.customizable_object_ID );
		customizableObjectXml.ele('format', req.body.format[i]);
		customizableObjectXml.ele('content', uploadedFiles[req.body.customizable_object_ID].name);
	}
	
	//finalize customized_content.xml 
	var xmlString = userDataXml.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' });
	//console.log(userDataXml);
	fs.writeFile(userDataDir+'/customized_content.xml', xmlString, writeTo_customized_content_xml_cb );	
	

};


exports.uploadUserDataInfo_cb = function(req, res) {

	var movieProjectDir = path.join( workingPath, 'public/contents/user_project', req.body.projectID);
	var userDataDir = path.join( movieProjectDir, 'user_data');
	
	var writeTo_customized_content_xml_cb = function (err) {
		if (!err) {
			console.log('customized_content.xml is generated.');
			
			//check if all the user data exist; (if yes, start generating the movie in startGeneratingMovie()
			var allUserContentExist = true;
			if( Object.prototype.toString.call( req.body.customizableObjects ) === '[object Array]' ) {
				for (var i in req.body.customizableObjects) {
					allUserContentExist = allUserContentExist && fs.existsSync( path.join( userDataDir, "_"+req.body.customizableObjects[i].content) );
				}
			}
			else {
				allUserContentExist = fs.existsSync( path.join( userDataDir, "_"+req.body.customizableObjects.content) );
			}

			if ( allUserContentExist ) {
				console.log('Start generating movie %s !', req.body.projectID);
				res.send(null);
				movieMaker.renderMovie(req.body.projectID, req.body.ownerID);
			}
			else {
				res.send( {err:"Some or all user contents are missing."} );
			}
			
		}
	}
	


	//==append the content in customized_content.xml==
	var builder = require('xmlbuilder');
	var userDataXml = builder.create('customized_content',{'version': '1.0', 'encoding': 'UTF-8', 'standalone': true});
	userDataXml.ele('template_ID', req.body.templateID);
	var customizableObjectListXml = userDataXml.ele('customizable_object_list');
	

	if( Object.prototype.toString.call( req.body.customizableObjects ) === '[object Array]' ) {
		for (var i in req.body.customizableObjects) {
			//append the content in customized_content.xml
			var customizableObjectXml = customizableObjectListXml.ele('customizable_object');
			customizableObjectXml.ele('ID', req.body.customizableObjects[i].ID );
			customizableObjectXml.ele('format', req.body.customizableObjects[i].format);
			customizableObjectXml.ele('content', "_"+req.body.customizableObjects[i].content);
		}
	}
	else {
		//append the content in customized_content.xml
		var customizableObjectXml = customizableObjectListXml.ele('customizable_object');
		customizableObjectXml.ele('ID', req.body.customizableObjects.ID );
		customizableObjectXml.ele('format', req.body.customizableObjects.format);
		customizableObjectXml.ele('content', "_"+req.body.customizableObjects.content);
	}
	
	//finalize customized_content.xml 
	var xmlString = userDataXml.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' });
	//console.log(userDataXml);
	if ( fs.existsSync(userDataDir) ) {
		fs.writeFile(userDataDir+'/customized_content.xml', xmlString, writeTo_customized_content_xml_cb );	
	}

};
