
var playlist = (function() {
    
    var adapter, token;
    
    var itemSchema = {
        "id": '', //*// playlist_id
        "name": '',    //*// playlist_name
        "controlledByAdManager":false,
        "enableSmartPlaylist":false,
        "playlistItems" : [{
            "endValidDate": '',
            "id": '',    //*// playlistItem_id, if this change, it need reset.
            "playFullscreen": false,
            "playlistItemType": "MEDIA_ITEM",
            //"sortOrder": 1,
            "startValidDate": '',
            "duration": 100,
            "durationHoursSeconds": "00:01:40",
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
                //"sortOrder":1
            }],
            "useValidRange": true
        }]
    };
    
    var subplaylistSchema = {
        "id": '',   //*// playlist_id
        "name": '',    //*// playlist_name
        "playlistItems":[{
            "subplaylist":{
                "id": '',   //*// subplaylist_id
                "name": '', //*// subplaylist_name
                "playlistType":"MEDIA_PLAYLIST",
                "detailRoute":"playlists",
                "newItemData":{},
                "showPlaylistType":"Media Playlist",
            },
            "subPlaylistPickPolicy":0,
            "mediaType":"SUB_PLAYLIST",
            "playlistItemType":"SUB_PLAYLIST",
            "playlistType":"MEDIA_PLAYLIST",
            "hidePickPolicy":true,
            "timeSchedules":[{
                "startTime":"00:00",
                "endTime":"24:00",
                "sortOrder":1,
                "days":[
                    "SUNDAY",
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY"
                ]
            }],
            "detailRoute":"playlist",
            "showPlaylistType":"Media Playlist",
            "name": '', //*// subplaylist_name
            "prettifyType":"Sub-Playlist",
            "isTimeScheduleExpired":false,
            "showEndDate":true,
            "subPlaylistPickPolicyLabel":"Items to play: all"
        }],
    };
    
    var _private = {
        list : function( option, list_cb ) {
            if( typeof(option) === 'function') list_cb = option;
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
                list_cb(err, obj);
            });
        },
        /*listAllAvailablePlaylistItems : function( option, upadte_cb ) {
            adapter.put('/ContentManager/api/rest/playlists/' + option.playlist.id + '?token=' + token, option.playlist.content, function(err, req, res, obj) {
            });
        },*/
        update : function( option, upadte_cb ) {
            adapter.put('/ContentManager/api/rest/playlists/' + option.playlist.id + '?token=' + token, option.playlist.content, function(err, req, res, obj) {
                //assert.ifError(err);
                console.log('%d -> %j', res.statusCode, res.headers);
                console.log('%j', obj);
                upadte_cb(obj);
            });
        },
        settingPlaylistItem : function( option, settingPlaylistItem_cb ) {

            var playStart = new Date(option.playTime.start),
                playEnd = new Date(option.playTime.end);
            var playStartDate = playStart.getFullYear() + '-' + (playStart.getMonth() + 1) + '-' + playStart.getDate(),
                playEndDate = playEnd.getFullYear() + '-' + (playEnd.getMonth() + 1) + '-' + playEnd.getDate();
            var playStartTime, playEndTime;
            if(playStart.getMinutes() < 10)
                playStartTime = playStart.getHours() + ':0' + playStart.getMinutes();
            else
                playStartTime = playStart.getHours() + ':' + playStart.getMinutes();
            if(playEnd.getMinutes() < 10)
                playEndTime = playEnd.getHours() + ':0' + playEnd.getMinutes();
            else
                playEndTime = playEnd.getHours() + ':' + playEnd.getMinutes();
            
            
            var duraionTime = new Date(option.media.duration);
            
            itemSchema.id = option.playlist.id;
            itemSchema.name = option.playlist.name;
            itemSchema.playlistItems[0].id = option.item.id;
            //itemSchema.playlistItems[0].duration = option.media.duration;
            //itemSchema.playlistItems[0].durationHoursSeconds = duraionTime.getUTCHours() + ':' + duraionTime.getUTCMinutes() + ':' + duraionTime.getUTCSeconds();
            if( option.item.useValidRange == true ) {
                itemSchema.playlistItems[0].useValidRange = true;
                itemSchema.playlistItems[0].startValidDate = playStartDate; //
                itemSchema.playlistItems[0].endValidDate = playEndDate;   //
            }
            if(option.playFullscreen == true) itemSchema.playlistItems[0].playFullscreen;
            itemSchema.playlistItems[0].timeSchedules[0].startTime = playStartTime;
            itemSchema.playlistItems[0].timeSchedules[0].endTime = playEndTime;
            
            adapter.put('/ContentManager/api/rest/playlists/' + option.playlist.id + '?token=' + token, itemSchema, function(err, req, res, obj) {
                settingPlaylistItem_cb(null, obj);
            });
        },
        settingSubPlaylist : function( option, settingSubPlaylist_cb ){
            
            subplaylistSchema.id = option.id;  //*//
            subplaylistSchema.name = option.name;//*//
            subplaylistSchema.playlistItems[0].subplaylist.id = option.subplaylist.id;
            subplaylistSchema.playlistItems[0].subplaylist.name = option.subplaylist.name;
            
            adapter.put('/ContentManager/api/rest/playlists/' + subplaylistSchema.id + '?token=' + token, subplaylistSchema, function(err, req, res, obj) {
                settingSubPlaylist_cb(null, obj);
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
            _private.list( { fields : 'id', search : playlistName }, function(err, playlistInfo){
                //console.log(err);
                //console.log(playlistInfo.list[0].id);
                if(!err) list_cb(null, playlistInfo.list[0].id);
                else list_cb('NOT_FOUND_PLAYLIST', null);
            } );
        },
        findPlaylistItemIdByName : function( playlistName, mediaName, list_cb ) {
            _private.list( { search : playlistName }, function(err, playlistItemInfo){
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
        pushSubplaylist : function( subplaylistSetting, pushSubplaylist_cb ){
            _private.settingSubPlaylist( subplaylistSetting, pushSubplaylist_cb );
        },
        update : function( option, upadte_cb ) {
            _private.update( option, upadte_cb );
        }
    };
}());


// Outputs: "current value: 10" and "running"
module.exports = playlist;