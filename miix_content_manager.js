var miixContentManager = {};

var workingPath = process.env.STAR_SERVER_PROJECT;
//var movieMaker = require(workingPath+'/ae_render.js');
var aeServerManager = require(workingPath+'/ae_server_manager.js');
var memberDB = require(workingPath+'/member.js');
var videoDB = require(workingPath+'/video.js');
var fmapi = require(workingPath+'/routes/api.js')   //TODO:: find a better name

miixContentManager.generateMiixMoive = function(movieProjectID, ownerStdID, ownerFbID, movieTitle) {
	
	//console.log('generateMiixMoive is called.');
	//TODO: get starAeServerID.  
	var starAeServerID = "gance_Feltmeng_pc";
	
	aeServerManager.createMiixMovie(starAeServerID, movieProjectID, ownerStdID, ownerFbID, movieTitle);
	
};

miixContentManager.updateMiixMovieInVideoDB = function(vjsonData, oid) {
	var pid = vjsonData.projectId;

	videoDB.updateOne({"projectId":pid}, vjsonData, {"upsert": true}, function(err, vdoc){
		if(err)
			logger.info(err);
		
		memberDB.getDeviceTokenById(oid, function(err, result){
			if(err) throw err;
			if(result.deviceToken){
				FM_LOG("deviceToken Array: " + JSON.stringify(result.deviceToken) );
				for( var devicePlatform in result.deviceToken){
					if(result.deviceToken[devicePlatform] != 'undefined'){
						if(devicePlatform == 'Android')
							FM.api._GCM_PushNotification(result.deviceToken[devicePlatform]);
						else
							FM.api._pushNotification(result.deviceToken[devicePlatform]);
					}
				}
			}
		});
	});

}

miixContentManager.postMiixMovieToSocialNetwork = function(vjson) {

	var vjsonData = vjson;				
    var can_msg = "參加MiixCard活動初體驗！";
	var link = vjsonData.url.youtube;
	var oid = vjsonData.ownerId._id;
	
	memberDB.getFBAccessTokenById(oid, function(err, result){
    
        if(err) throw err;
        if(result){
            var userID = result.fb.userID;
			var userName = result.fb.userName;
            var accessToken = result.fb.auth.accessToken;
                path = "/" + userID + "/feed",
                query = "?" + "access_token=" + accessToken
                + "&message=" + userName + can_msg
                + "&link=" + link;
            path += query.replace(/\s/g, "+");
            
            FM_LOG("[POST req to FB with:]\n" + JSON.stringify(path) );
            //  Post on FB.
            fmapi._fbPost(path, function(response){     
                
                //  Get Object_id of Post Item on FB, then update db.
                if(response.error){
                    FM_LOG("[POST on FB:ERROR] " + response.error.message );
                    
                }else{
                    var fb_id = response.id;    // Using full_id to get detail info.  full_id = userID + item_id
                    FM_LOG("\n[Response after POST on FB:]\n" + JSON.stringify(response) ); 
                    //var fb_id = full_id.substring(full_id.lastIndexOf("_")+1);
                   
					vjsonData.fb_id = fb_id;
					
                };
				
				miixContentManager.updateMiixMovieInVideoDB(vjsonData, oid);
			});
		};
	});
};


module.exports = miixContentManager;