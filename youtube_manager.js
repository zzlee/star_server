var fs = require('fs');
var path = require('path');
var workingPath = process.env.STAR_SERVER_PROJECT;
var ytToken = null;


exports.uploadVideo = function( ytAccessToken, videoFile, videoTitle, movieProjectID, _uploadVideo_cb  ) {

	var uploadUrl;
	var http = require('http');
	
	//a temporary workaround solution to avoid a strange phenomenon that a video is sometimes uploaded 3 times to YouTube
	//TODO: debug this strange phenomenon 
	var uploadVideo_cb = function ( err, videoURL ) {
		if (!uploadVideo_cb.isCalledOnce) {
			_uploadVideo_cb( err, videoURL );
			uploadVideo_cb.isCalledOnce = true;	
		}	
	};
	uploadVideo_cb.isCalledOnce = false;
	
	var uploadingVideoData_cb = function(res) {
		
		console.log('[%s] uploadingVideoData_cb() res STATUS: %s', movieProjectID, res.statusCode);
		//console.log('uploadingVideoData_cb() res HEADERS: ' + JSON.stringify(res.headers));
		
		//for log file
		var log;
		log = 'STATUS:\n' + res.statusCo + '\n';
		log += 'HEADERS:\n' + JSON.stringify(res.headers) + '\n';
		
		var resBody = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			//console.log('uploadingVideoData_cb() res BODY chunk: ' + chunk);
			
			resBody += chunk;
		});
		
		res.on('close', function (chunk) {
			console.log('[%s] "close" event fired: Possibly abnormally terminated before getting the complete response chunk!!', movieProjectID);
		});
		
		res.on('end', function () {
		
			//for log file
			log += 'BODY:\n' + resBody + '\n';
			
			var xml2js = require('xml2js');
			var parser = new xml2js.Parser();
			parser.addListener('end', function(result) {
				//console.dir(result);
				
				//for log file
				log += 'BODY (JSON):\n' + JSON.stringify(result);
				fs.writeFile(workingPath+'/public/log/yt_upload_log_'+(new Date()).toISOString().replace(/[-:.]/g, "")+'.txt', log, function (err) {
					if (err) throw err;
					console.log('[%s] log file is saved!', movieProjectID);
				});
						
				
				if (result.entry.id) {
					var youtubeVideoID = result.entry.id.toString().split(':');
					youtubeVideoID = youtubeVideoID[ youtubeVideoID.length-1 ];
					uploadVideo_cb( {err:null, youtubeVideoID:youtubeVideoID } );
					
					/*
					//add to video DB
					var videoDB = require(workingPath+'/video.js');
					var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};
						
					var vjson = {"title": movieProjectID,
								 "ownerId": {"_id": ownerID._id, "userID": ownerID.userID},
								 "url": url,
								 "projectId":movieProjectID};
					//console.log("video " + JSON.stringify(vjson));
					videoDB.addVideo(vjson, function(err, vdoc){
						console.log('Seccessfully add %s to videoDB!', movieProjectID);
					});
					*/
				}
				else {
					uploadVideo_cb( {err:'Fail to upload the video to YouTube!!', youtubeVideoID:null} );
				}
				
			});
			parser.parseString(resBody);
			
			
						
		});	
	};

	var readVideoFile_cb = function (err, videoFileData) {
		if (err) throw err;
		console.log( '[%s] Finished reading the video file', movieProjectID );
		
		var parsedUploadUrl = require('url').parse(uploadUrl);
		var uploadUrlPath = parsedUploadUrl.pathname+parsedUploadUrl.search;
		//console.log( 'uploadUrlPath='+uploadUrlPath );
		

		var header = {  'Content-Type': 'video/mp4',
						'Content-Length': videoFileData.length
						};
		
		var options = {
			host: 'uploads.gdata.youtube.com',
			port: 80,
			path: uploadUrlPath,
			headers: header,
			method: 'POST'
		};
				
		console.log('[%s] Start uploading the video body to YouTube....', movieProjectID);
		var client_req = http.request(options, uploadingVideoData_cb);
		client_req.write(videoFileData);
		client_req.end();
		
	};	
	
	
	var uploadingMetadata_cb = function(res) {
		console.log('[%s] uploadingMetadata_cb() res STATUS: %s', movieProjectID, res.statusCode);
		//console.log('uploadingMetadata_cb() res HEADERS: ' + JSON.stringify(res.headers));
		uploadUrl = res.headers.location;
		//console.log( 'uploadUrl='+uploadUrl);
		
		if ( res.statusCode == 200 ) {
			fs.readFile( videoFile, readVideoFile_cb);
		}
		else {
			console.log('[%s] Fail to upload the metadata to YouTube.', movieProjectID);
			uploadVideo_cb( {err:"Fail to upload the metadata to YouTube", youtubeVideoID:null } );
		}

		
	};

	
	var body = '\
<?xml version="1.0"?> \n \
<entry xmlns="http://www.w3.org/2005/Atom" \n \
xmlns:media="http://search.yahoo.com/mrss/" \n \
xmlns:yt="http://gdata.youtube.com/schemas/2007"> \n \
<media:group> \n \
<media:title type="plain">';
	body += videoTitle;
	body += '\
</media:title> \n \
<media:description type="plain"> \n \
  MiixCard video.  \n \
</media:description> \n \
<media:category \n \
  scheme="http://gdata.youtube.com/schemas/2007/categories.cat">People \n \
</media:category> \n \
</media:group> \n \
</entry>'; 

	if (ytAccessToken) {
		var header = {  'Authorization': 'Bearer '+ytAccessToken,
						'GData-Version': 2,
						'X-GData-Key': 'key=AI39si4ESFoS_HSwufFF4CEVYW9sdz4xi2-hAjs2BXJAMuHy1NzwQXB_gulxiS-YSJzWBOAi-anICzfrjFdLxdQgG5SXMRrl8Q',
						'Slug':'super.mp4',
						'Content-Type': 'application/atom+xml; charset=UTF-8',
						'Content-Length': body.length
						};
						
		
		var options = {
			host: 'uploads.gdata.youtube.com',
			port: 80,
			path: '/resumable/feeds/api/users/default/uploads',
			headers: header,
			//auth: 'Bearer:' + ytToken.access_token ,
			method: 'POST'
		};
		
		
		console.log('[%s] Use the access token: %s', movieProjectID, ytAccessToken);							
		console.log('[%s] Send the video metadata to YouTube....', movieProjectID);
		var client_req = http.request(options, uploadingMetadata_cb);
		client_req.write(body);
		client_req.end();
	}
	else {
		console.log('[%s] Cannot upload video due to the absence of YouTube token.', movieProjectID);
		uploadVideo_cb( {err:"Cannot upload video due to the absence of YouTube token", youtubeVideoID:null } );
	}
					
};

exports.getAccessToken = function( getAccessToken_cb ) {
	var tokenFile = path.join( workingPath, 'yt_token.json');

	fs.readFile( tokenFile, function (err, data) {
		if (!err) {
			var myYtToken = JSON.parse(data);
			getAccessToken_cb( myYtToken.access_token );
		}
		else {
			getAccessToken_cb( null );
		}
	});


}
