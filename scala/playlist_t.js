var playlist = (function() {

    var _private = {
        i:5,
        create : function() {
            //console.log( "current value:" + this.i);
        },
        list : function( condition, list_cb, adapter, token ) {
            //this.i = val;
            if(!condition.limit) condition.limit = 99999;
            if(!condition.sort) condition.sort = 'name';
            adapter.get('/api/rest/playlists/all?limit=' + condition.limit + '&offset=0&sort=' + condition.sort + '&token=' + token, function(err, req, res, obj) {
                if(obj.count == 0) list_cb('NO_FIND_PLAYLIST', null);
                else list_cb(null, obj);
            });
        },
        update : function() {
            //console.log( "running" );
        },
        remove: function(){
            //console.log( "jumping" );
        }
    };

    return {

        list : function( adapter, option ) {
            if(option.token){
                _private.list( option.condition, list_cb, adapter, option.token );
            }
            //_private.set(args.val);
            //_private.get();
            //if ( args.run ) {
            //    _private.run();
            //}
        }
    };
}());
 
 
// Outputs: "current value: 10" and "running"
module.exports.playlist = playlist;
