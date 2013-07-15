
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
    var webpage = {
        name: 'FM_scala',
        uri: 'www.feltmeng.com'
    };
    scalaMgr.setWebpageToPlaylist(webpage, { start: '2013-07-15 10:00:00', end: '2013-07-15 11:00:00' },  function(err, status){
        console.log(status);
    });
    
}, 1000);