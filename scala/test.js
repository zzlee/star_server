
var scala = require('./scalaMgr');
var scalaMgr = scala( 'http://192.168.5.189:8080', { username: 'administrator', password: '53768608' } );

setTimeout(function(){
    //start: 1375635600000
    /*
    scalaMgr.listTimeslot(new Date(1375635600000), function(err, res){
        console.log(res);
    });
    */
    //1375682400000, end: 1375711200000
    var play_s = new Date(1375682400000);
    var play_e = new Date(1375711200000);
    console.log(play_s);
    console.log(play_e);
    //(typeof(endDate) === 'undefined')?console.log('undefined'):console.log('123');

    /*
    var file = {
        name : 'IMG_0431.jpg',
        path : 'C:\\tmp\\',
        savepath : ''
    };
    */
    //var web = { name: 'test_yahoo', uri: 'tw.yahoo.com' };
    //var playTime = { start: '2013-07-28 10:00:00', end: '2013-08-01 22:00:00', duration: 55 };
    /*
    var option = {
        media: { name: file.name, type: '' },
        playlist: { name: 'tt01' },
        playTime: { start: '2013-07-21 12:30:00', end: '2013-07-22 17:50:00', duration: 35 },
    };
    scalaMgr.setItemToPlaylist( file, playTime, function(err, res){
        console.log(res);
    } );
    */
    /*
    scalaMgr.contractor.playlist.updateOneProgram(option, function(err, res){
        console.log(res);
    });
    */
    /*
    var updateOneProgram = function( option, report_cb ){

        var playStart = new Date(option.playTime.start),
            playEnd = new Date(option.playTime.end);
            
        var playStartDate = playStart.getFullYear() + '-' + (playStart.getMonth() + 1) + '-' + playStart.getDate(),
            playEndDate = playEnd.getFullYear() + '-' + (playEnd.getMonth() + 1) + '-' + playEnd.getDate();
        
        var playStartTime = '', playEndTime = '';
        playStartTime += (playStart.getHours() >= 10)?playStart.getHours():('0'+playStart.getHours());
        playStartTime += ':'; 
        playStartTime += (playStart.getMinutes() >= 10)?playStart.getMinutes():('0' + playStart.getMinutes());
        
        playEndTime += (playEnd.getHours() >= 10)?playEnd.getHours():('0'+playEnd.getHours());
        playEndTime += ':'; 
        playEndTime += (playEnd.getMinutes() >= 10)?playEnd.getMinutes():('0'+playEnd.getMinutes());
        
        scalaMgr.contractor.playlist.list({ search : option.playlist.name }, function(err, listInfo){
            for(var i=0; i<listInfo.list[0].playlistItems.length; i++){
                if(option.media.name == listInfo.list[0].playlistItems[i].media.name){
                    listInfo.list[0].playlistItems[i].startValidDate = playStartDate;
                    listInfo.list[0].playlistItems[i].endValidDate = playEndDate;
                    listInfo.list[0].playlistItems[i].timeSchedules.startTime = playStartTime;
                    listInfo.list[0].playlistItems[i].timeSchedules.endTime = playEndTime;
                    if(option.playTime.duration && listInfo.list[0].playlistItems[i].media.prettifyType != 'Video'){
                        var duraionTime = new Date(-28800000 + (option.playTime.duration * 1000));
                        listInfo.list[0].playlistItems[i].duration = option.playTime.duration;
                        listInfo.list[0].playlistItems[i].durationHoursSeconds = duraionTime.getHours() + ':' + duraionTime.getMinutes() + ':' + duraionTime.getSeconds()
                    }
                }
                console.log('useValidRange:', listInfo.list[0].playlistItems[i].useValidRange);
            }
            //console.log(listInfo.list[0]);
        });
        
    };
    
    updateOneProgram(option, function(){});
    */
}, 1500);

