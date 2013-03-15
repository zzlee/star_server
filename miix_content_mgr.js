var FM = { miixContentMgr: {} };

var workingPath = process.env.STAR_SERVER_PROJECT;
var aeServerMgr = require(workingPath+'/ae_server_mgr.js');
var doohMgr = require(workingPath+'/dooh_mgr.js');
var memberDB = require(workingPath+'/member.js');
var videoDB = require(workingPath+'/video.js');
var fmapi = require(workingPath+'/routes/api.js');   //TODO:: find a better name

var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');

FM.miixContentMgr.generateMiixMoive = function(movieProjectID, ownerStdID, ownerFbID, movieTitle) {
	
	//console.log('generateMiixMoive is called.');
	
	aeServerMgr.createMiixMovie( movieProjectID, ownerStdID, ownerFbID, movieTitle, function(responseParameters){
	
		if ( responseParameters.youtube_video_id ) {
			var aeServerID = responseParameters.ae_server_id;
			var youtubeVideoID = responseParameters.youtube_video_id;
			var movieProjectID = responseParameters.movie_project_id;
			var ownerStdID = responseParameters.owner_std_id;
			var ownerFbID = responseParameters.owner_fb_id;
			var movieTitle = responseParameters.movie_title;
			
			
			if ( responseParameters.err == 'null' || (!responseParameters.err) ) {
				//post to FB; update video DB; push notification to mobile client 
				var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};			
				var vjson = {"title": movieTitle,
							 "ownerId": {"_id": ownerStdID, "userID": ownerFbID},
							 "url": url,
							 "genre":"miix",
							 "aeId": "AE_server_gance_Feltmeng_pc",
							 "projectId":movieProjectID};
				fmapi._fbPostVideoThenAdd(vjson); //TODO: split these tasks to different rolls
				
			};
			
			//for test
			//miixContentMgr.submitMiixMovieToDooh('', movieProjectID);
		};
		
	});
	
};

FM.miixContentMgr.submitMiixMovieToDooh = function( doohID, movieProjectID ) {

	//deliver Miix movie content to DOOH
	aeServerMgr.uploadMovieToMainServer(movieProjectID, function(resParametes){
		logger.info('uploading Miix movie from AE Server to Main Server finished.');
		logger.info('res: _command_id='+resParametes._command_id+' err='+resParametes.err);
		
		//TODO:: check the file size. If not correct, re-upload.
		
		if ( (resParametes.err == 'null') || (!resParametes.err) ) {
			doohMgr.downloadMovieFromMainServer(movieProjectID, function(resParametes){
				logger.info('downloading Miix movie from Main Server to DOOH. ');
				logger.info('res: _command_id='+resParametes._command_id+' err='+resParametes.err);
				
				//TODO:: check the file size. If not correct, re-download.
			});						
		}
	});

					
	//add Miix movie to the nearest time slot in schedule
					
	//submit the playlist to DOOH
				
};

FM.miixContentMgr.getUserUploadedImageUrls = function( miixMovieProjectID, gotUrls_cb) {
	var userUploadedImageUrls = new Array();
	var anUserUploadedImageUrl;
	var userContentXmlFile = path.join( workingPath, 'public/contents/user_project', miixMovieProjectID, 'user_data/customized_content.xml')
	var parser = new xml2js.Parser({explicitArray: false});
	fs.readFile( userContentXmlFile, function(err, data) {
		if (!err){
			parser.parseString(data, function (err2, result) {
				if (!err2){
					var customizable_objects = result.customized_content.customizable_object_list.customizable_object;
					
					if( Object.prototype.toString.call( customizable_objects ) === '[object Array]' ){
						for (var i=0;i<customizable_objects.length;i++) {
							anUserUploadedImageUrl = '/contents/user_project/'+miixMovieProjectID+'/user_data/'+customizable_objects[i].content;
							userUploadedImageUrls.push( anUserUploadedImageUrl );
						}
					}
					else{
						anUserUploadedImageUrl = '/contents/user_project/'+miixMovieProjectID+'/user_data/'+customizable_objects.content;
						userUploadedImageUrls.push( anUserUploadedImageUrl );
					}
					if (gotUrls_cb) {
						gotUrls_cb(userUploadedImageUrls, null);
					}
				}
				else{
					if (gotUrls_cb) {
						gotUrls_cb(null, err2);
					}
				}
			});
		}
		else {
			if (gotUrls_cb) {
				gotUrls_cb(null, err);
			}		
		}
	});
}

FM.miixContentMgr.setMiixPlayList = function(cb) {

};

FM.miixContentMgr.submitMiixPlayListToDooh = function(cb) {

};



module.exports = FM.miixContentMgr;

/*
//test
FM.miixContentMgr.getUserUploadedImageUrls('greeting-50c99d81064d2b841200000a-20130129T072747490Z', function(userUploadedImageUrls, err){
	console.log('userUploadedImageUrls=');
	console.dir(userUploadedImageUrls);
});
*/