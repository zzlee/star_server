var http = require('http');

var n = (new Date()).getTime() + 15000;

exports.sendPlayRequest = function( doohURL, movieProjectID, timeToPlay) {

	var options = {
		host: doohURL,
		port: 80,
		headers: {  'movie_project_id': movieProjectID,
					'time_to_play': timeToPlay },
		path: '/push_play_request'
	};


	http.get(options, function(res) {
		res.on('data', function(data) {
				console.log( 'data: '+data);
			}).on('end', function() {
				console.log("done");
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
			});
	});

}

