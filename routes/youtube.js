var fs = require('fs');
var workingPath = process.env.AE_PROJECT;
var ytToken;


exports.uploadVideo = function( videoFile, videoTitle, movieProjectID, ownerID, _uploadVideo_cb  ) {

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
		
		console.log('uploadingVideoData_cb() res STATUS: ' + res.statusCode);
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
			//uploadVideo_cb( 'Fail to upload the video to YouTube!!' , null );
			console.log('Abnormally terminated before getting the complete response chunk!!');
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
					console.log('log file is saved!');
				});
						
				
				if (result.entry.id) {
					var youtubeVideoID = result.entry.id.toString().split(':');
					youtubeVideoID = youtubeVideoID[ youtubeVideoID.length-1 ];
					uploadVideo_cb( null , 'http://www.youtube.com/watch?v='+youtubeVideoID );
					
					//add to video DB
					var videoDB = require(workingPath+'/video.js');
					var url = {"youtube":"http://www.youtube.com/embed/"+youtubeVideoID};
						
					var vjson = {"title": movieProjectID,
								 "ownerId": ownerID,
								 "url": url,
								 "projectId":movieProjectID};
					//console.log("video " + JSON.stringify(vjson));
					videoDB.addVideo(vjson, function(err, vdoc){
						console.log('Seccessfully add %s to videoDB!', movieProjectID);
					});
				}
				else {
					uploadVideo_cb( 'Fail to upload the video to YouTube!!' , null );
				}
				
			});
			parser.parseString(resBody);
			
			
						
		});	
	};

	var readVideoFile_cb = function (err, videoFileData) {
		if (err) throw err;
		console.log( 'Finished reading the video file' );
		
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
				
		console.log('Start uploading the video body to YouTube....');
		var client_req = http.request(options, uploadingVideoData_cb);
		client_req.write(videoFileData);
		client_req.end();
		
	};	
	
	
	var uploadingMetadata_cb = function(res) {
		console.log('uploadingMetadata_cb() res STATUS: ' + res.statusCode);
		//console.log('uploadingMetadata_cb() res HEADERS: ' + JSON.stringify(res.headers));
		uploadUrl = res.headers.location;
		//console.log( 'uploadUrl='+uploadUrl);
		
		fs.readFile( videoFile, readVideoFile_cb);

		
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
  I AM A SUPER STAR video \n \
</media:description> \n \
<media:category \n \
  scheme="http://gdata.youtube.com/schemas/2007/categories.cat">People \n \
</media:category> \n \
</media:group> \n \
</entry>'; 
	
	if ( ytToken ) {

		var header = {  'Authorization': 'Bearer '+ytToken.access_token,
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
		
			
		console.log('Send the video metadata to YouTube....');
		var client_req = http.request(options, uploadingMetadata_cb);
		client_req.write(body);
		client_req.end();
	}
	else {
		console.log('Cannot upload video due to the absence of YouTube token.');
	}
			
};

exports.YoutubeOAuth2_cb = function(req, res){
	if (req.query.code) {
		console.log('code='+req.query.code);
		
		var https = require('https');
		
		var options = {
			host: 'accounts.google.com',
			port: 443,
			path: '/o/oauth2/token',
			headers: { 'content-type': 'application/x-www-form-urlencoded'  },
			method: 'POST'
		};
				
		var client_req = https.request(options, function(client_res) {
			client_res.setEncoding('utf8');
			client_res.on('data', function (res_token) {
				
				ytToken = JSON.parse(res_token);
				if ( ytToken.access_token ) {
					console.log('ytToken.access_token= ' + ytToken.access_token);
					res.send('Successfully obtained YouTube token: '+res_token);
				}
				else {
					res.send('Failed to obtain YouTube token: '+res_token);				
				}
				
				//temp test
				//uploadVideo('D:\\nodejs_projects\\i_am_a_super_star\\public\\super.mp4', function(){} );
			});
		});
		var body = 'code='+req.query.code+'&';
		body += 'client_id=701982981612-434p006n3vi10ghlk6u9op178msavtu2.apps.googleusercontent.com&';
		body += 'client_secret=NhmRDngvVVHtkLLPnhAN349b&';
		body += 'redirect_uri=http://localhost/oauth2callback&';
		body += 'grant_type=authorization_code';
		client_req.write(body);
		client_req.end();
		
	}
	if (req.query.error) {
		console.log(req.query.error);
		res.send('Accessing YouTube service was denied!');
	}
};