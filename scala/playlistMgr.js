
var playlist = (function() {
    
    var adapter, token;
    
    var itemSchema = {
        "id": '', //*// playlist_id
        "name": '',    //*// playlist_name
        "playlistItems" : [{
            "endValidDate": '',
            "id": '',    //*// playlistItem_id, if this change, it need reset.
            "playFullscreen": false,
            "playlistItemType": "MEDIA_ITEM",
            "sortOrder": 1,
            "startValidDate": '',
            "timeSchedules":[{
                "days":[
                    "SUNDAY",
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY"
                ],
                "startTime": '',
                "endTime": '',
                "sortOrder":1
            }],
            "useValidRange": true
        }]
    };
    
    var _private = {
        list : function( option, list_cb ) {
            if( typeof(option) == 'function') list_cb = option;
            var request = '/ContentManager/api/rest/playlists/all?token=' + token;
            
            if(!option.limit) request += '&limit=0';
            else request += '&limit=' + option.limit;
            if(!option.offset) request += '&offset=0';
            else request += '&offset=' + option.offset;
            if(!option.sort) request += '&sort=name';
            else request += '&sort=' + option.sort;
            if(option.fields) request += '&fields=' + option.fields;
            if(option.search) request += '&search=' + option.search;
            if(option.filters) request += '&filters=' + option.filters;
            
            //adapter.get('/ContentManager/api/rest/playlists/all?limit=' + option.limit + '&offset=' + option.offset + '&sort=' + option.sort + '&token=' + token, function(err, req, res, obj) {
            adapter.get(request, function(err, req, res, obj) {
                list_cb(obj);
            });
        },
        update : function( option, upadte_cb ) {
            adapter.put('/ContentManager/api/rest/playlists/' + option.playlist.id + '?token=' + token, option.playlist.content, function(err, req, res, obj) {
                //assert.ifError(err);
                console.log('%d -> %j', res.statusCode, res.headers);
                console.log('%j', obj);
            });
        },
        settingPlaylistItem : function( option, settingPlaylistItem_cb ) {
            
            var play = new Date(option.playTime);
            var playDate = play.getFullYear() + '-' + (play.getMonth() + 1) + '-' + play.getDate(),
                playTime = play.getHours() + ':' + play.getMinutes();
            
            itemSchema.id = option.playlist.id;
            itemSchema.name = option.playlist.name;
            itemSchema.playlistItems[0].id = option.item.id;
            if( option.item.useValidRange == true ) {
                itemSchema.playlistItems[0].useValidRange = true;
                itemSchema.playlistItems[0].startValidDate = playDate; //
                itemSchema.playlistItems[0].endValidDate = playDate;   //
            }
            if(option.playFullscreen == true) itemSchema.playlistItems[0].playFullscreen;
            
            itemSchema.playlistItems[0].timeSchedules[0].startTime = playTime; //
            if((play.getMinutes() + 2) >= 60) {
                itemSchema.playlistItems[0].timeSchedules[0].endTime = (play.getHours() + 1) + ':' + (play.getMinutes() + 2 - 60);
            }
            else itemSchema.playlistItems[0].timeSchedules[0].endTime = play.getHours() + ':' + (play.getMinutes() + 2);   //
            
            adapter.put('/ContentManager/api/rest/playlists/' + option.playlist.id + '?token=' + token, itemSchema, function(err, req, res, obj) {
                //assert.ifError(err);
                //console.log('%d -> %j', res.statusCode, res.headers);
                //console.log('%j', obj);
                settingPlaylistItem_cb(null, obj);
            });
        },
        register : function( auth ) {
            adapter = auth.adapter;
            token = auth.token;
        },
        jump: function(){
            console.log( "jumping" );
        }
    };

    return {
    
        init : function(){
            var self = this;
            require('./connectMgr.js').request(function( auth ){
                _private.register( auth );
                return self;
            });
        },
        list : function( option, list_cb ) {
            _private.list( option, list_cb );
        },
        findPlaylistIdByName : function( playlistName, list_cb ) {
            _private.list( { fields : 'id', search : playlistName }, function(playlistInfo){
                if(playlistInfo.list[0].id) list_cb(null, playlistInfo.list[0].id);
                else list_cb('NOT_FOUND_PLAYLIST', null);
            } );
        },
        findPlaylistItemIdByName : function( playlistName, mediaName, list_cb ) {
            _private.list( { search : playlistName }, function(playlistItemInfo){
                for(var i=0; i < playlistItemInfo.list[0].playlistItems.length; i++) {
                    if(playlistItemInfo.list[0].playlistItems[i].media.name == mediaName)
                        list_cb(null, playlistItemInfo.list[0].playlistItems[i].id);

                    if(i == playlistItemInfo.list[0].playlistItems.length)
                        list_cb('NOT_FOUND_ITEM', null);
                }
            } );
        },
        updatePlaylistItemSchedule : function( itemSetting, itemSchedule_cb ){
            _private.settingPlaylistItem( itemSetting, itemSchedule_cb );
        },
        update : function( option, upadte_cb ) {
            _private.update( option, upadte_cb );
        }
    };
}());


// Outputs: "current value: 10" and "running"
module.exports = playlist;