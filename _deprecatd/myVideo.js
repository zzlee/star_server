/*
 *  UGC Adapter
 */

var UGCDB = require('./UGC.js'),
    memberDB = require("./member.js");

module.exports = function(userId){
    var listOfUGC = [];
    
    memberDB.getUGCsByOID(userId, function(err, result){
        if(err) throw err;
        if(result){
            for(var i in result){
                UGCDB.getUGCById(result[i], function(err, ));
            }
            logger.info("getUGCsByOID: " + result));
        }
    });
    
    return listOfUGC;
};