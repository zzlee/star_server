var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;
    
var request = require("request");
var connectionHandler = require('./routes/connection_handler.js');

FM.globalConnectionMgr = (function(){
    var uInstance = null;
    var connectedRemotes = new Object();  //set connectedRemotes as a hash table of all connections
    
    function constructor(){
        //the methods exposed to public
        var _this = {
            addConnection: function(remoteID, type){
                //console.log('%s is connected! [type=%s]', remoteID, type);
                connectedRemotes[remoteID] = type;
            },
            
            removeConnection: function(remoteID){
                //console.log('%s is disconnected!', remoteID);
                delete connectedRemotes[remoteID];
            },
            
            getConnectedRemotes: function(type, cb){
                if ( (config.IS_STAND_ALONE=="yes")||(config.IS_STAND_ALONE=="Yes")||(config.IS_STAND_ALONE=="YES") ) {
                    var result = new Array();
                    //console.log('total connections');
                    
                    for (anId in connectedRemotes){
                        //console.log('%s %s', anId, connectedRemotes[anId]);
                        if (type){
                            if (connectedRemotes[anId]==type){
                                result.push(anId);
                            }                        
                        }
                        else { //push all the items in connectedRemotes
                            result.push(anId);
                        }
                    }
                    
                    cb(null, result);
                }
                else { //TODO: star_server has multiple instances (due to auto-scale of AWS)
                    request({
                        method: 'GET',
                        uri: config.HOST_STAR_COORDINATOR_URL + '/internal/connected_remotes',
                        qs: {"type": type},
                        json: true
                        
                    }, function(error, response, body){

                        if (body) {
                            cb(null, body.connectedRemotes);    
                        }
                        else {
                            cb("Failed to get connected remotes from star_coordinator: "+error, null);  //TODO: check the content of error parameters
                        }
                                
                    });
                }
            },
            
            isConnectedTo: function(remoteID){
                if (  connectedRemotes[remoteID] ){
                    return true;
                }
                else{
                    return false;
                }
            },
            
            sendRequestToRemote: function( targetedRemoteID, reqToRemote, cb ) {
                if ( (config.IS_STAND_ALONE=="yes")||(config.IS_STAND_ALONE=="Yes")||(config.IS_STAND_ALONE=="YES") ) {
                    connectionHandler.sendRequestToRemote( targetedRemoteID, reqToRemote, cb );
                }
                else { //TODO: star_server has multiple instances (due to auto-scale of AWS)
                    
                }
            }
            
                
        };
        
        connectionHandler.init(_this);
        
        return _this;
    }
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            
            return uInstance;
        }
    };
})();

/* TEST */
//FM.globalConnectionMgr.getInstance()._test();

module.exports = FM.globalConnectionMgr.getInstance();