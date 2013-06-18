
var assert = require('assert'),
    restify = require('restify');


var playlist = {};

//playlist.create = function(option, reportStatus_cb){};
//playlist.update = function(option, reportStatus_cb){};
//playlist['delete'] = function(option, reportStatus_cb){};


playlist.list = function(option, reportList_cb){
    if(!option.limit) option.limit = 99999;
    if(!option.sort) option.sort = 'name';
    option.client.get('/api/rest/playlists/all?limit=' + option.limit + '&offset=0&sort=' + option.sort + '&token=' + option.token, function(err, req, res, obj) {
        if(obj.count == 0) reportList_cb('NO_FIND_PLAYLIST', null);
        else reportList_cb(null, obj);
    });
};

module.exports.playlist = playlist;

/*
module.exports.playlist = function(client, token){
    
    var connect = client;
    
    return {
        listPlaylist: function(reportPlaylistInfo){
            connect.get('/api/rest/playlists/all?limit=99999&offset=0&sort=name&token=' + token, function(err, req, res, obj) {
                if(obj.count == 0) reportPlaylistInfo('NO_FIND_PLAYLIST', null);
                else reportPlaylistInfo(null, obj);
            });
        }
    
    };
};
*/