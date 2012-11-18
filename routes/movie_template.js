var fs = require('fs');
var workingPath = process.env.STAR_SERVER_PROJECT;
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

