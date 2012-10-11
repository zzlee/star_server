var fs = require('fs');
var workingPath = process.env.AE_PROJECT;
var movieMaker = require(workingPath+'/ae_render.js');

exports.getTemplateList_cb = function(req, res){
	fs.readdir(workingPath+'/public/contents/template', function(err, files) {
		if (!err) { 
			res.send(files);
		}
		else {
			console.log( 'Fail to read /public/contents/template: '+err );
			res.send(null);
		}
	});
};
/*
exports.getTemplateRawData_cb = function(req, res){

	if ( req.query.templateID ) {
		var requstedTemplate = req.query.templateID;
		  
		var xml2js = require('xml2js');

		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
			res.send(result);
			//console.log('Finished responsing /get_template_raw_data request.');
		});
		fs.readFile( workingPath+'/public/contents/template/'+requstedTemplate+'/raw_data/template_raw_data_description.xml', function(err, data) {
			if (!err) {
				parser.parseString(data);
			}
			else {
				console.log( 'Fail to read template_raw_data_description.xml: '+err );
				res.send(null);
			}
		});   
	}
	else {
		console.log( 'Fail to templateID in the request ' );
		res.send(null);
	}

};
*/
exports.getTemplateDescription_cb = function(req, res){

	if ( req.query.templateID ) {
		var requstedTemplate = req.query.templateID;
		  
		var xml2js = require('xml2js');

		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
			if ( req.session.user.name ) {
				result.userName = req.session.user.name;
			}
			res.send(result);
		});
		fs.readFile( workingPath+'/public/contents/template/'+requstedTemplate+'/raw_data/template_description.xml', function(err, data) {
			if (!err) {
				parser.parseString(data);
			}
			else {
				console.log( 'Fail to read template_description.xml: '+err );
				res.send(null);
			}
		});   
	}
	else {
		console.log( 'Fail to templateID in the request ' );
		res.send(null);
	}

};

exports.getTemplateCustomizableObjectList_cb = function(req, res){

	if ( req.query.templateID ) {
		var requstedTemplate = req.query.templateID;
		  
		var xml2js = require('xml2js');

		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
			res.send(result);
		});
		fs.readFile( workingPath+'/public/contents/template/'+requstedTemplate+'/raw_data/template_customizable_object_list.xml', function(err, data) {
			if (!err) {
				parser.parseString(data);
			}
			else {
				console.log( 'Fail to read template_customizable_object_list.xml: '+err );
				res.send(null);
			}
		});   
	}
	else {
		console.log( 'Fail to templateID in the request ' );
		res.send(null);
	}

};

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
		
			/*
			//get the temporary location of the file
			var tmp_path = uploadedFiles[req.body.customizable_object_ID[i]].path;
			//set where the file should actually exists - in this case it is in the "images" directory
			var target_path = targetDir + '/' + uploadedFiles[req.body.customizable_object_ID[i]].name;  
			//move the uploaded file to ./public/contents/[movie project ID]/user_data
			moveUploadedFileToUserDataFolder( tmp_path, target_path, uploadedFiles[req.body.customizable_object_ID[i]].size);
			*/
		
			//append the content in customized_content.xml
			var customizableObjectXml = customizableObjectListXml.ele('customizable_object');
			customizableObjectXml.ele('ID', req.body.customizable_object_ID[i] );
			customizableObjectXml.ele('format', req.body.format[i]);
			customizableObjectXml.ele('content', uploadedFiles[req.body.customizable_object_ID[i]].name);

		}
	}
	else {
		/*
		//get the temporary location of the file
		var tmp_path = uploadedFiles[req.body.customizable_object_ID].path;
		//set where the file should actually exists - in this case it is in the "images" directory
		var target_path = targetDir + '/' + uploadedFiles[req.body.customizable_object_ID].name;  
		//move the uploaded file to ./public/contents/[movie project ID]/user_data
		moveUploadedFileToUserDataFolder( tmp_path, target_path, uploadedFiles[req.body.customizable_object_ID].size);
		*/
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

