var workingPath = process.env.STAR_SERVER_PROJECT;
var path = require('path');
var http = require('http');
var url = require('url');

exports.createMovie = function(starAeServerURL, movieProjectID, ownerStdID, ownerFbID, movieTitle) {

	var userDataFolder = path.join( workingPath, 'public/contents/user_project', movieProjectID, 'user_data');
	var userFileList = fs.readdirSync(userDataFolder).toString();
	
	var dataToPost = {
		user_file_list: fs.readdirSync(userDataFolder).toString(),
		movie_project_id: movieProjectID,
		owner_std_id: ownerStdID, 
		owner_fb_id: ownerFbID,
		movie_title: movieTitle
	};
	
	
	
	var options = {
		host: url.parse(starAeServerURL).hostname,
		path: '/create_movie',
		headers: dataToPost,
		method: 'GET'
	};
	var port = url.parse(starAeServerURL).port;
	if (port) {
		options.port = port;
	}
	else {
		options.port = 80;
	}

	var httpReq = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('[%s] BODY: '+chunk, movieProjectID);
		}).on('end', function() {
			console.log('[%s] Successfully ask AE Server to render movie', movieProjectID);
		});
	});

	httpReq.on('error', function(e) {
		console.log('[%s] error send http GET to AE Server:', movieProjectID);
		console.dir(e);
	});

	httpReq.end();
		


}