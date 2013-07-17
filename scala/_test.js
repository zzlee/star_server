
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
}, 1000);