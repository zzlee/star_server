var FM = {};
var DEBUG = true,
    FM_LOG = (DEBUG) ? function(str){ logger.info(str); } : function(str){} ;
    
var connectionHandler = require('./routes/connection_handler.js');

FM.globalConnectionMgr = (function(){
    var uInstance = null;
    var connectedRemotes = new Object();  //set connectedRemotes as a hash table of all connections
    
    function constructor(){
        //the methods exposed to public
        var _this = {
            addConnection: function(id, type){
                //console.log('%s is connected! [type=%s]', id, type);
                connectedRemotes[id] = type;
            },
            
            removeConnection: function(id){
                //console.log('%s is disconnected!', id);
                delete connectedRemotes[id];
            },
            
            getConnectedRemotes: function(type){
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
                
                return result;
            },
            
            sendRequestToRemote: function( targetID, reqToRemote, cb ) {
                connectionHandler.sendRequestToRemote( targetID, reqToRemote, cb );
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