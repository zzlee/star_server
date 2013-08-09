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
    
    var pushFlag = false;
    
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
    
    var weekdays = { 'SUNDAY' : 0, 'MONDAY' : 1, 'TUESDAY' : 2, 
                 'WEDNESDAY' : 3,'THURSDAY' : 4, 'FRIDAY' : 5, 'SATURDAY' : 6 };
    var checkWeekday = function( check, weekslots, check_cb ){
        if(typeof(weekslots) === 'string') {
            if(check == weekdays[weekslots]) check_cb('OK');
            else check_cb('FAILED');
        }
        else for(var i=0; i < weekslots.length; i++) {
            if(check == weekdays[weekslots[i]]) { check_cb('OK'); break; }
            if(i == weekslots.length - 1) check_cb('FAILED');
        }
    };
    var durationToNumber = function( time ){
        var duration = time[0].split(':');
        return (Number(duration[0]) * 60 + Number(duration[1])) * 1000;
    };
    var timeToInt = function( dateData, time ){
        time = time.split(':');
        var date = new Date(dateData);
        
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time[0], time[1], time[2]).getTime();
    };
    
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
    var listTimeslot = function(oneday, timeslot_cb){
        var result = [];
    
        var option = {
            channel : { id: 1, frames: 1 }, //hardcode
            date : new Date(oneday),
        };
        contractor.schedule.findTimeslots(option, function(list){
            for(var i=0; i < list.timeslots.length; i++){
                if(list.timeslots[i].playlist.name.match(/FM/i)) {
                    checkWeekday(option.date.getDay(), list.timeslots[i].weekdays, function(status){
                        var timeslotDeadline;
                        //if((typeof(list.timeslots[i].endDate) === 'undefined'))
                        //    timeslotDeadline = new Date('' + ' 23:59:59');
                        //else 
                        if((list.timeslots[i].endTime == '24:00:00'))
                            timeslotDeadline = new Date(list.timeslots[i].endDate + ' 23:59:59');
                        else 
                            timeslotDeadline = new Date(list.timeslots[i].endDate + ' ' + list.timeslots[i].endTime);
//                        console.log(list.timeslots[i].endDate);
                        if((option.date.getTime() <= timeslotDeadline.getTime()) && (status == 'OK')){
                            result.push({
                                //playlist: list.timeslots[i].playlist.name,
                                interval: {
                                    start: timeToInt(oneday, list.timeslots[i].startTime),
                                    end: timeToInt(oneday, list.timeslots[i].endTime)
                                },
                                cycleDuration: durationToNumber(list.timeslots[i].playlist.prettifyDuration.replace('(','').replace(')','').split(' - '))
                            });
                        }
                    });
                }
                if(i == list.timeslots.length-1) timeslot_cb(null, result);
            }
        });
        
    };
    
    /**
     * Add item in timeslot to server.
     * 
     * @param {Object} item The item upload to scala server.
     *     <ul>
     *     <li> path: The path is file path.
     *     <li> filename: The filename is file title.
     *     </ul>
     * @param {Object} playTime The playTime is program play to DOOH in specific time.
     * @param {Function} reportStatus_cb Report media id and playlistItem id in playlist.
     */
    var setItemToPlaylist = function( file, playTime, reportStatus_cb ){
        
        var limit = 0,
            addlimit = 0,
            updatelimit = 0;
        
        var itemPlaySetting = {
            playlist: { id: '', name: 'OnDaScreen' },
            item: { id: '', useValidRange: true, playFullscreen: true },
            media: { id: '', duration: '' },
            playTime : { start: playTime.start, end: playTime.end }
        };
        
        var option = {
            media: { name: file.name },
            playlist: { name: 'OnDaScreen' },
            playTime: { start: playTime.start, end: playTime.end, duration: playTime.duration },
        };
        
        async.waterfall([
            function(callback){
                if(limit < 1){
                    //Step.1: upload file to server
                    contractor.media.fileupload(file, function(err, status){
                        callback(null, status);
                    });
                    limit++;
                }
            },
            function(status, callback){
                //Step.2: find out media(file) id
                if(status == 'OK') {
                    contractor.media.findMediaIdByName(file.name, function(err, mediaInfo){
                        if(!err) {
                            itemPlaySetting.media.id = mediaInfo.id;
                            itemPlaySetting.media.duration = mediaInfo.duration;
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
                if(addlimit < 1){
                    //Step.4: add media to playlist
                    if(status == 'OK') {
                        contractor.item.addItemToPlaylist(itemPlaySetting, function(err, addItem_cb){
                            if(!err) callback(null, 'OK');
                            else callback(err, null);
                        });
                    }
                    addlimit++;
                }
            },
            function(status, callback){
                if(updatelimit < 1){
                    //Step.5: update item play info. to playlist
                    if(status == 'OK') {
                        contractor.playlist.updateOneProgram(option, function(err, updateOneProgram_cb){
                            if(!err) callback(null, 'OK');
                            else callback(err, null);
                        });
                    }
                    updatelimit++;
                }
            }
        ], function (err, result) {
            if(result == 'OK') reportStatus_cb(null, 'OK');
            else reportStatus_cb(err, null);
        });
    };
    
    /**
     * Add web page in timeslot to server.
     *
     */
    var setWebpageToPlaylist = function( webpage, playTime, reportStatus_cb ){
    
        var limit = 0,
            addlimit = 0,
            updatelimit = 0;
        
        var itemPlaySetting = {
            playlist: { id: '', name: 'OnDaScreen' },
            item: { id: '', useValidRange: true, playFullscreen: true },
            media: { id: '', duration: '' },
            playTime : { start: playTime.start, end: playTime.end }
        };
        
        var option = {
            media: { name: webpage.name },
            playlist: { name: 'OnDaScreen' },
            playTime: { start: playTime.start, end: playTime.end, duration: playTime.duration },
        };
        
        async.waterfall([
            function(callback){
                if(limit < 1){
                    //Step.1: upload file to server
                    contractor.media.createWebPage(webpage, function(err, status){
                        callback(null, status);
                    });
                    limit++;
                }
            },
            function(status, callback){
                //Step.2: find out media(webpage) id
                if(status == 'OK') {
                    contractor.media.findMediaIdByName(webpage.name, function(err, mediaInfo){
                        if(!err) {
                            itemPlaySetting.media.id = mediaInfo.id;
                            itemPlaySetting.media.duration = mediaInfo.duration;
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
                if(addlimit < 1){
                    //Step.4: add media to playlist
                    if(status == 'OK') {
                        contractor.item.addItemToPlaylist(itemPlaySetting, function(err, addItem_cb){
                            if(!err) callback(null, 'OK');
                            else callback(err, null);
                        });
                    }
                    addlimit++;
                }
            },
            function(status, callback){
                if(updatelimit < 1){
                    //Step.5: update item play info. to playlist
                    if(status == 'OK') {
                        contractor.playlist.updateOneProgram(option, function(err, updateOneProgram_cb){
                            if(!err) callback(null, 'OK');
                            else callback(err, null);
                        });
                    }
                    updatelimit++;
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
     * @param {object} option Input setting of playlist, subplaylist and player.
     *     @param {object} playlist Setting playlist and subplaylist by name.
     *         @param {string} search Find out available playlist.
     *         @param {string} play Find out subplaylist.
     *     @param {object} player Setting player.
     *         @param {string} name Player name.
     * @param {function} reportStatus_cb Report status. i.e. { value: success }
     */
    var pushEvent = function( option, reportPush_cb ){
        //if(!pushFlag) console.log(pushFlag);
        async.parallel([
            function(callback){
                contractor.playlist.list( { sort: 'id', fields: 'id,name', search: option.playlist.search }, function(err, playlist){
                    callback(null, playlist);
                });
            },
            function(callback){
                contractor.playlist.list( { sort: 'id', fields: 'id,name', search: option.playlist.play }, function(err, playlist){
                    callback(null, playlist);
                });
            },
        ], function(err, result){
            
            var pushSubplaylist = { subplaylist: { id: result[1].list[0].id, name: result[1].list[0].name } };
            
            for(var i=0; i<result[0].count; i++){
                pushSubplaylist.id = result[0].list[i].id;
                pushSubplaylist.name = result[0].list[i].name;
                
                contractor.playlist.pushSubplaylist(pushSubplaylist, function(err, res){});
                if(i == result[0].count-1) {
                    if(!option.player) playerName = 'feltmeng';
                    else playerName = option.player.name;
                    contractor.player.findPlayerIdByName(playerName, function(err, playerId){
                        contractor.player.pushProgram({"ids": [playerId]}, function(res){
                            reportPush_cb(res);
                        });
                    });
                }
            }
            
        });
    };
    
    return {
        listTimeslot : listTimeslot,
        setItemToPlaylist : setItemToPlaylist,
        pushEvent : pushEvent,
        setWebpageToPlaylist: setWebpageToPlaylist,
        contractor: contractor,   //test
    };
}

module.exports = scalaMgr;
