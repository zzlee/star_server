/*
 * Login to server and get module function.
 * 
 * constructor
 * param {string} url The server URL.
 * param {object} account The username and password in account to login.
 * return {function} listTimeslot List timeslots from server.
 * return {function} setItemToEvent Set item in timeslot to server.
 * return {function} pushEvent Push program to scala server.
**/
/**
 * The manager who handles interfacing Scala Enterprise
 *
 * @mixin
 */
function scalaMgr( url, account ){
    
    var assert = require('assert');
    var async = require('async');
    var restify = require('restify').createJsonClient({url: url});
    
    var playlist = require('./playlistMgr.js')
      , channel = require('./channelMgr.js')
      , item = require('./itemMgr.js')
      , schedule = require('./scheduleMgr.js')
      , media = require('./mediaMgr.js')
      , player = require('./playerMgr.js');
    
    playlist.init();
    channel.init();
    item.init();
    schedule.init();
    media.init();
    player.init();

    var contractor = {
        playlist : playlist,
        channel : channel,
        item : item,
        schedule : schedule,
        media : media,
        player : player
    };
    
    require('./connectMgr.js').init( restify, account );
    
    /**
     * List timeslots from server.
     * 
     * @param {string} name The name is search condition for timeslot.
     * @param {string} channel The channel number for play to DOOH.
     * @param {string} frame The frame of channel playing.
     * @param {string} startDate The start date.
     * @param {string} endDate The end date.
     * @param {function} timeslot_cb Report timeslot list in json.
     *     @param {string} playlistInfo The playlistInfo have name, time, duration, mode and more.
     *     @param {boolean} valid The valid show this timeslot is valid.
     */
    var listTimeslot = function(){};
    
    /**
     * Add item in timeslot to server.
     * 
     * @param {object} item The item upload to scala server.
     *     @param {string} path The path is file path.
     *     @param {string} filename The filename is file title.
     * @param {string} playTime The playTime is program play to DOOH in specific time.
     * @param {function} reportStatus_cb Report media id and playlistItem id in playlist.
     */
    var setItemToPlaylist = function( file, playTime, reportStatus_cb ){
        
        var limit = 0;
        var play = new Date(playTime);
        
        var itemPlaySetting = {
            playlist: { id: '', name: 'FM_DOOH' },
            item: { id: '', useValidRange: true, playFullscreen: true },
            media: { id: '' },
            //playDate: play.getFullYear() + '-' + play.getMonth() + '-' + play.getDate(),
            //playTime: play.getHours() + ':' + play.getMinutes()
            playTime : playTime
        };
        async.waterfall([
            function(callback){
                //Step.1: upload file to server
                contractor.media.fileupload(file, function(err, status){
                    callback(null, status);
                });
            },
            function(status, callback){
                //Step.2: find out media(file) id
                if(status == 'OK') {
                    contractor.media.findMediaIdByName(file.name, function(err, mediaId){
                        if(!err) {
                            itemPlaySetting.media.id = mediaId;
                            callback(null, 'OK');
                        }
                        else callback(err, null);
                    });
                }
            },
            function(status, callback){
                //Step.3: find out playlist id
                if(status == 'OK') {
                    contractor.playlist.findPlaylistIdByName(itemPlaySetting.playlist.name, function(err, playlistId){
                        if(!err) {
                            itemPlaySetting.playlist.id = playlistId;
                            callback(null, 'OK');
                        }
                        else callback(err, null);
                    });
                }
            },
            function(status, callback){
                //Step.4: add media to playlist
                if(status == 'OK') {
                    contractor.item.addItemToPlaylist(itemPlaySetting, function(err, addItem_cb){
                        if(!err) callback(null, 'OK');
                        else callback(err, null);
                    });
                }
            },
            function(status, callback){
                //Step.5: find out item id in playlist
                if(status == 'OK') {
                    contractor.playlist.findPlaylistItemIdByName(itemPlaySetting.playlist.name, file.name, function(err, itemId){
                        itemPlaySetting.item.id = itemId;
                        if(!err) callback(null, 'OK');
                        else callback(err, null);
                    });
                }
            },
            function(status, callback){
                if(limit < 1){
                    //Step.6: update item play info. to playlist
                    if(status == 'OK') {
                        contractor.playlist.updatePlaylistItemSchedule(itemPlaySetting, function(err, itemSetting_cb){
                            //itemPlaySetting.playlist.id = playlistId;
                            if(!err) callback(null, 'OK');
                            else callback(err, null);
                        });
                    }
                    limit++;
                }
            }
        ], function (err, result) {
            if(result == 'OK') reportStatus_cb(null, 'OK');
            else reportStatus_cb(err, null);
        });
    };
    /**
     * Push event list to all playlist in server.
     * 
     * @param {function} reportStatus_cb Report status. i.e. { value: success }
     */
    var pushEvent = function(playerName, reportPush_cb){
        if(typeof(playerName) == 'function'){
            reportPush_cb = playerName;
            playerName = 'feltmeng';
        }
        contractor.player.findPlayerIdByName(playerName, function(err, playerId){
            contractor.player.pushProgram({"ids": [playerId]}, function(res){
                reportPush_cb(res);
            });
        });
    };
    
    //return contractor;
    return {
        listTimeslot : listTimeslot,
        setItemToPlaylist : setItemToPlaylist,
        pushEvent : pushEvent,
    };
}
//scalaMgr( 'http://server-pc:8080', { username: 'administrator', password: '53768608' } );

module.exports = scalaMgr;

//_test()
/*
var testMgr = scalaMgr( 'http://server-pc:8080', { username: 'administrator', password: '53768608' } );
setTimeout(function(){
    
    var file = {
        name : 'fc2_save_2013-06-27-153828-0000.mp4',
        path : 'C:\\tmp\\',
        savepath : ''
    };
    testMgr.setItemToPlaylist(file, '2013-06-28 08:00',  function(err, status){
        console.log(status);
    });
    
    testMgr.schedule.findTimeslots( {
        channel : { id : 1, frames : 1 },
        date : '2013-06-24'
    }, function( list ){
        console.log(list);
    });
    
    
    testMgr.pushEvent('feltmeng', function(res){
        console.log(res);
    });
    
}, 5000);
*/