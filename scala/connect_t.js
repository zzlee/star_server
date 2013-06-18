var connect = (function() {
    
    var assert = require('assert'),
        restify = require('restify');
    
    var _private = {
        i:5,
        connect : function( option , connect_cb ) {
            //console.log( "current value:" + this.i);
            var adapter = restify.createJsonClient({ url: option.url, version: '*' });
            
            adapter.post('/ContentManager/api/rest/auth/login', { 
                "username" : option.username, 
                "password" : option.password 
            }, function(err, req, res, obj) {
                //assert.ifError(err);
                //console.log('%d -> %j', res.statusCode, res.headers);
                //console.log('%j', res.headers);
                //console.log(obj.token);
                
                connect_cb(adapter, obj.token);
            });
        }
    };

    return {

        connectServer : function( option ) {
            //console.log(option);
            if(option.url) {
                _private.connect( option, function(adapter, token){
                    return require('./playlist_t.js').playlist.list(adapter, token);
                });
            }
            /*
            _private.set(args.val);
            _private.get();
            if ( args.run ) {
                _private.run();
            }
            */
        }
    };
}());
 
 
// Outputs: "current value: 10" and "running"
//module.connect( {run: true, val:10} );
module.exports.connectServer = connect.connectServer;
