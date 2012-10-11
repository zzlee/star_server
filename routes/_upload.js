var fs = require('fs');
var path = require('path');
var workingPath = process.env.AE_PROJECT;

/*
 * handle file upload
 */

exports.upload_cb = function(req, res){

	var moveFile = function( _tmp_path, _target_path, _moveFile_cb )  {
		var util = require('util');
			
		var is = fs.createReadStream(_tmp_path);
		var os = fs.createWriteStream(_target_path);
		
		util.pump(is, os, function(err) {
			if (!err) {
				fs.unlink(_tmp_path, function() {
					if (!err) {
						res.send( '<h2>File uploaded to: ' + _target_path + '</h2>');
						console.log( 'Finished uploading to ' + _target_path );
						
						if ( _moveFile_cb ) {
							_moveFile_cb();
						}
					}
					else {
						console.log('Fail to delete temporary uploaded file: '+err);
						res.send('Fail to delete temporary uploaded file: '+err);
					}
				});
			}
			else {
				console.log('Fail to do util.pump(): '+err);
				res.send('Fail to do util.pump(): '+err);
			}
		});			
	}

	//get the temporary location of the file
	var tmp_path = req.files['file'].path;
	//set where the file should actually exists 
	var target_path = path.join( workingPath, 'public/uploads', req.files['file'].name);  

	moveFile( tmp_path, target_path );
};