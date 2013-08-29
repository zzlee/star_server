
var scala = require('./scalaMgr');
var scalaMgr = scala( 'http://192.168.5.189:8080', { username: 'administrator', password: '53768608' } );

setTimeout(function(){
    /*
    var option = {
        playlistItem: { id: 379 },
        playlist: { name: 'lastModified' }
    };
    
    scalaMgr.pullPlaylistItem(option, function(err, res){
        (err)?console.dir(err):console.dir(res);
    });
    */
    
    var setting = {
        media: { name: 'black' },
        playlist:{ name: 'lastModified' },
        playTime: { start: '2013-08-27 10:00:00', end: '2013-08-27 22:00:00', duration: 50 }
    };
    
    scalaMgr.pushMediaToPlaylist(setting, function(err, res){
        (err)?console.dir(err):console.dir(res);
    });
    
    /*
    scalaMgr.clearPlaylistItems(function(err, res){
        if(err)
            console.dir(err);
        else
            console.dir(res);
    });
    */
    /*
    var web = {
        name: 'web_test',
        uri: 'www.feltmeng.idv.tw'
    };
    
    var playTime = {
        start: '2013-07-22 18:00:00',
        end: '2013-07-22 19:00:00',
        duration: 50
    };
    
    scalaMgr.setWebpageToPlaylist(web, playTime, function(err, res){
        (err)?console.dir(err):console.dir(res);
    });
    */
    /*
    var option = { 
        playlist: { search: 'lastModified', play: 'OnDaScreen' },
        player: { name: 'feltmeng' } 
    };
    scalaMgr.pushEvent( option, function(res){
        console.log(res);
    });
    */
    /*
    var file = {
        name : 'test_1.avi',
        path : 'C:\\tmp\\',
        savepath : ''
    };
    */
    //var web = { name: 'test_yahoo', uri: 'tw.yahoo.com' };
    //var playTime = { start: '2013-08-28 10:00:00', end: '2013-08-28 22:00:00', duration: 50 };
    /*
    var option = {
        media: { name: file.name, type: '' },
        playlist: { name: 'tt01' },
        playTime: { start: '2013-07-21 12:30:00', end: '2013-07-22 17:50:00', duration: 35 },
    };
    */
    /*
    scalaMgr.setItemToPlaylist( file, playTime, function(err, res){
        console.log(res);
    } );
    */
    /*
    scalaMgr.contractor.playlist.updateOneProgram(option, function(err, res){
        console.log(res);
    });
    */
    
}, 1500);
