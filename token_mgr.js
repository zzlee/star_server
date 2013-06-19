tokenMgr = {};

var defaultToken ='53768608';

tokenMgr.checkAuthorization = function(token, uri, cb){
    
    //TODO: build the authorization policy and check token upon each policy
    if (token==defaultToken){
        if (cb){
            cb(true);
        }
    }
    else {
        if (cb){
            cb(false);
        }
    }
};


module.exports = tokenMgr;