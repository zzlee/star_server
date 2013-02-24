/**
 *  dooh_handler.js
 */
 
var FM = { dooh_handler: {} };
var schedule_handler = require("../schedule.js"),
    video_handler = require("../video.js");

var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info( typeof(str)==='string' ? str : JSON.stringify(str)); } : function(str){} ;

    
FM.dooh_handler.lastMoviePlayed = null;
FM.dooh_handler.lastMovieStopped = null;

/* ------ Handler API ------ */    
    
FM.dooh_handler.importPeriodicData = function(req, res) {
    FM_LOG("[dooh_handler.importPeridoicData]");

	var buffer = "";
	req.on('data', function(chunk) { buffer += chunk; })
    .on('end', function(){
        //console.log(JSON.stringify(JSON.parse(buffer)));
        var dooh_data = JSON.parse(buffer);
        if(dooh_data.dooh){
            res.send(400, {error: "Bad Request!"} );
            
        }else{
            res.send(200);
            schedule_handler.importPeriodicData(dooh_data);
        }
    });
};


FM.dooh_handler.dooh_current_video = function(req, res){
    FM_LOG("[dooh_handler.dooh_current_video]");
    if(req.query.id){
        FM_LOG("id:" + req.query.id);
        video_handler.nextDoohVideo(function(err, result){
            if(err){
                logger.error("err:"+err);
                res.send(500, {error: "Internal Server Error!"});
                
            }else{
                FM_LOG("result:"+result);
                if(result)
                    res.send(200, {projectId: result.projectId});
                else
                    res.send(200, {message: "No Current Video"});
            }
        });
        
    }else{
        res.send(400, {error: "Bad Request!"} );
    }
    
    
    
    /*
    var buffer = "";
	req.on('data', function(chunk) {
        buffer += chunk;
        
    }).on('end', function(){
        console.log(buffer);
        var data = JSON.parse(buffer);
        if(data.dooh){
            res.send(400, {error: "Bad Request!"} );
            
        }else{
            video_handler.nextDoohVideo(function(err, result){
                if(err){
                    res.send(500, {error: "Internal Server Error!"});
                }else{
                    if(result)
                        res.send(200, result);
                    else
                        res.send(200, {message: "No Current Video"});
                }
            });
        }
    });*/
};



FM.dooh_handler.doohMoviePlayingState_post_cb = function(req, res) {
	if ( req.headers.miix_movie_project_id ) {
		if ( (req.headers.state == 'playing')&&(req.headers.miix_movie_project_id != FM.dooh_handler.lastMoviePlayed) ){
			console.log('dooh starts playing movie');
            FM.dooh_handler.lastMoviePlayed = req.headers.miix_movie_project_id;
			storyCamControllerMgr.startRecording( req.headers.miix_movie_project_id, function(resParametes){
				logger.info('story cam started recording.');
				logger.info('res: _command_id='+resParametes._command_id+' err='+resParametes.err);
				res.send(200);
			});
			
		}
		else if ( (req.headers.state == 'stopped')&&(req.headers.miix_movie_project_id != FM.dooh_handler.lastMovieStopped) ){
			console.log('dooh stopped playing movie');
            FM.dooh_handler.lastMovieStopped = req.headers.miix_movie_project_id;
			storyCamControllerMgr.stopRecording( function(resParametes){
				logger.info('story cam stopped recording.');
				logger.info('res: _command_id='+resParametes._command_id+' err='+resParametes.err);
				res.send(200);
			});
		}
        //
        setTimeout(function(){
            res.send(500, {error: "Remote story camera does not respond in 8 sec."});;  
        }, 8000);        
	}
	else {
		res.send(400, {error: "Bad Request!"} );
	}
}

module.exports = FM.dooh_handler;