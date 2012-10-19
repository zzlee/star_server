var workingPath = process.env.AE_PROJECT;

var fs = require('fs');
var renderingQueue = new Array();
var isRendering = false;

exports.renderMovie = function (movieProjectID, ownerID) {
	
	renderingQueue.push(movieProjectID);
	if ( !isRendering ) {
		isRendering = true;
		performRenderingTask( renderingQueue[0], ownerID );
	}
	
	
	
	
	return 'ok';
};


var performRenderingTask = function(movieProjectID, ownerID) {

	var lookUp = function ( _movieProjectID, lookUp_cb ) {
		var _templateID, _compostion;
		var xml2js = require('xml2js');
		
		/*
		var parse_template_definition_xml_cb = function(result) {
			//console.log('result of parsing template_definition.xml =');
			//console.dir(result);
			_compostion = result.composition;
			if ( _compostion ) {
				lookUp_cb( _templateID, _compostion );
			}
			else {
				console.log('Fail to parse template_definition.xml.');
			}
		};
		*/
		
		var parse_template_description_xml_cb = function(result) {
			//console.log('result of parsing template_description.xml =');
			//console.dir(result);
			_compostion = result.template_raw_data.composition;
			if ( _compostion ) {
				lookUp_cb( _templateID, _compostion );
			}
			else {
				console.log('Fail to parse template_definition.xml.');
			}
		};
		
		var parse_customized_content_xml_cb = function(result) {
			//console.log('result of parsing customized_content.xml =');
			//console.dir(result);
			//_templateID = result.template_ID;
			_templateID = result.customized_content.template_ID;
			
			if (_templateID) {
				/*
				//look up _compostion from .\public\contents\template\[templateID]\template_definition.xml
				var parser2 = new xml2js.Parser();
				parser2.addListener('end', parse_template_definition_xml_cb);
				fs.readFile( workingPath+'/public/contents/template/'+_templateID+'/template_definition.xml', function(err, data) {
					if (!err){
						parser2.parseString(data);
					}
					else {
						console.log('Fail to read template_definition.xml: '+err);
					}
				});
				*/
				
				//look up _compostion from .\public\contents\template\[templateID]\raw_data\template_description.xml
				var parser2 = new xml2js.Parser();
				//parser2.addListener('end', parse_template_definition_xml_cb);
				parser2.addListener('end', parse_template_description_xml_cb);
				fs.readFile( workingPath+'/public/contents/template/'+_templateID+'/raw_data/template_description.xml', function(err, data) {
					if (!err){
						parser2.parseString(data);
					}
					else {
						console.log('Fail to read template_description.xml: '+err);
					}
				});   	
			}
			else {
				console.log('Fail to parse customized_content.xml.');
			}
			
		};
		
		//look up _templateID from .\public\contents\user_project\[movieProjectID]\user_data\customized_content.xml

		var parser = new xml2js.Parser();
		parser.addListener('end', parse_customized_content_xml_cb);
		fs.readFile( workingPath+'/public/contents/user_project/'+_movieProjectID+'/user_data/customized_content.xml', function(err, data) {
			if (!err) {
				parser.parseString(data);
			}
			else {
				console.log('Fail to read customized_content.xml: '+err);
			}
		});   		
			
	};
	
	console.log('performRenderingTask() is called');
	lookUp(movieProjectID, function( templateID, compostion ) {

		var userProjectAep = workingPath + "\\public\\contents\\user_project\\" + movieProjectID + "\\"  + movieProjectID+".aep"; 
		var templateAep = workingPath + "\\public\\contents\\template\\" + templateID + "\\" + templateID + ".aep";
		var outputVideo = workingPath + "\\public\\contents\\user_project\\"  + movieProjectID + "\\" + movieProjectID+".avi";  
		var customizedContentXml = workingPath + "\\public\\contents\\user_project\\"  + movieProjectID + "\\user_data\\customized_content.xml"; 
		
		//construct the arg xml
		var builder = require('xmlbuilder');
		var AeReplaceArgXml = builder.create('ae_replace_args',{'version': '1.0', 'encoding': 'UTF-8', 'standalone': true});
		AeReplaceArgXml.ele('project_ID', movieProjectID);
		AeReplaceArgXml.ele('template_AEP', templateAep);
		AeReplaceArgXml.ele('project_AEP', userProjectAep);
		AeReplaceArgXml.ele('customized_content_XML', customizedContentXml);
		var xmlString = AeReplaceArgXml.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' });
		
		fs.writeFile('./ae_replace_args.xml', xmlString, function (err) {
			if (!err) {
				console.log('Successfully writing to ae_replace_args.xml.');

				
				var spawn = require('child_process').spawn,
					cp    = spawn('cmd',['/c','ae_render.bat', movieProjectID, userProjectAep, compostion, outputVideo,'\n'],{ encoding: 'utf8'});
				
				cp.stdout.on('data', function (data) {
					//console.log('stdout: ' + data);
				});

				cp.stderr.on('data', function (data) {
					//console.log('stderr: ' + data);
				});

				cp.on('exit', function (code) {
					console.log('Child process exited with code ' + code);
					console.log('Finished rendering movie project [' + movieProjectID + ']');
					renderingQueue.shift();
					
					//upload to YouTube
					var youtube = require('./routes/youtube.js');
					youtube.uploadVideo( workingPath + '\\public\\contents\\user_project\\'  + movieProjectID + '\\' + movieProjectID+'.mp4', movieProjectID, movieProjectID, ownerID, function( err, videoURL ) {
						console.log('uploadVideo() cb:err= '+err);
						console.log('uploadVideo() cb:videoURL= '+videoURL);
						if ( !err ) {
							//TODO: post the video URL on Facebook
						}
					});
					
					isRendering = false;
					if ( renderingQueue.length > 0 ) {
						isRendering = true;
						performRenderingTask( renderingQueue[0] );
					}
				});	
			}
			else {
				console.log('Fail to write to ae_replace_args.xml: '+err);
			}
		});	

	});

}


