/*
 *  Video Adapter
 */

var videoDB = require('./video.js'),
    memberDB = require("./member.js");

module.exports = function(userId){
    var listOfVideo = [];
    
    memberDB.getVideosByOID(userId, function(err, result){
        if(err) throw err;
        if(result){
            for(var i in result){
                videoDB.getVideoById(result[i], function(err, ));
            }
            logger.info("getVideosByOID: " + result));
        }
    });
    
    return listOfVideo;
};