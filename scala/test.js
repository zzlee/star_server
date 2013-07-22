
var scala = require('./scalaMgr');
var scalaMgr = scala( 'http://server-pc:8080', { username: 'administrator', password: '53768608' } );

setTimeout(function(){
    /*
    var timeInterval = {
        start : '2013-07-02 00:00:00',
        end : '2013-07-07 23:59:59.999'
    };
    scalaMgr.listTimeslot(timeInterval.start, function(err, res){
        console.log(res);
    });
    */
    /*
    var option = { 
        playlist: { search: 'tt', play: 'FM_DOOH' },
        player: { name: 'feltmeng' } 
    };
    scalaMgr.pushEvent( option, function(res){
        console.log(res);
    });
    */
    /*
    var file = {
        name : 'fc2_save_2013-06-27-153828-0000.mp4',
        path : 'C:\\tmp\\',
        savepath : ''
    };
    */
    
    var file1 = {
        name : 'IMG_001.mov',
        path : 'C:\\tmp\\',
        savepath : ''
    };
    var file2 = {
        name : 'IMG_002.mov',
        path : 'C:\\tmp\\',
        savepath : ''
    };
    var file3 = {
        name : 'IMG_003.mp4',
        path : 'C:\\tmp\\',
        savepath : ''
    };
    scalaMgr.setItemToPlaylist(file1, { start: '2013-07-17 18:30:00', end: '2013-07-17 20:00:00' },  function(err, status){
        console.log('file_1: ' + status);
        scalaMgr.setItemToPlaylist(file2, { start: '2013-07-17 18:30:00', end: '2013-07-17 20:00:00' },  function(err, status){
            console.log('file_2: ' + status);
            scalaMgr.setItemToPlaylist(file3, { start: '2013-07-17 18:30:00', end: '2013-07-17 20:00:00' },  function(err, status){
                console.log('file_3: ' + status);
            });
        });
    });
    
}, 1500);
