

var assert = require('assert'),
    restify = require('restify');
    
var sys = require('util'),
    rest = require('restler');
    
module.exports.connectServer = function(options){
    
    var client = restify.createJsonClient({
        url: options.url,
        version: '*'
    });

    client.post('/ContentManager/api/rest/auth/login', { 
        "username" : options.username, 
        "password" : options.password 
    }, function(err, req, res, obj) {
        //assert.ifError(err);
        console.log('%d -> %j', res.statusCode, res.headers);
        console.log('%j', res.headers);
        console.log(obj.token);
        return {
            playlist: require('./playlist.js').playlist(client, obj.token).listPlaylist()
        }
    });
    
};