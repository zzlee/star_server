
var player = (function() {
    
    var adapter, token;
    
    var _private = {
        register : function( auth ) {
            adapter = auth.adapter;
            token = auth.token;
        },
        list : function( option, list_cb ) {
            if( typeof(option) == 'function') list_cb = option;
            var request = '/ContentManager/api/rest/players?token=' + token;
            
            if(!option.limit) request += '&limit=0';
            else request += '&limit=' + option.limit;
            if(!option.offset) request += '&offset=0';
            else request += '&offset=' + option.offset;
            if(!option.sort) request += '&sort=name';
            else request += '&sort=' + option.sort;
            if(option.fields) request += '&fields=' + option.fields;
            if(option.search) request += '&search=' + option.search;
            if(option.filters) request += '&filters=' + option.filters;
            
            adapter.get(request, function(err, req, res, obj) {
                list_cb(obj);
            });
        },
        storage : function( option, uuid_cb ) {
            adapter.post('/ContentManager/api/rest/storage?token=' + token, option, function(err, req, res, obj) {
                uuid_cb(obj);
            });
        },
        generatePlan: function( uuid, plan_cb ){
            adapter.get('/ContentManager/api/rest/players/' + uuid + '/generatePlan?token=' + token, function(err, req, res, obj) {
                //console.log('%d -> %j', res.statusCode, res.headers);
                plan_cb('done');
            });
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
        findPlayerIdByName : function( playerName, playerId_cb ) {
            _private.list( { fields : 'id', search : playerName }, function( playerInfo ){
                if( playerInfo.list[0].id ) playerId_cb( null, playerInfo.list[0].id );
                else playerId_cb( 'NOT_FOUND_PLAYER', null );
            } );
        },
        pushProgram : function( option, push_cb ){
            _private.storage( option, function( uuid ){
                _private.generatePlan( uuid.value, function( planStatus ){
                    push_cb(planStatus);
                } );
            } );
        },
    };
}());


// Outputs: "current value: 10" and "running"
module.exports = player;