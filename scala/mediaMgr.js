
var media = (function() {

    var adapter, token;
    var rest = require('restler');
    var fs = require('fs');

    var _private = {
        init : function( file, init_cb ) {
            adapter.post('/ContentManager/api/rest/fileupload/init?token=' + token, {
                filename: file.name,
                filepath: file.savepath,
                //uploadType: file.type
            }, function( err, req, res, obj ){
                init_cb( obj.uuid );
            });
        },
        upload : function( file, upload_cb ) {
            _private.init( file, function( uuid ){
                var connect = adapter.url.href + 'ContentManager/api/rest/fileupload/part/' + uuid + '/0';
                fs.readFile( file.path + '\\' + file.name, function (err, data){
                    rest.post(connect, {
                        multipart: true,
                        token: token,
                        'Content-Length': new Buffer(data).length,
                        data: {
                            'token': token,
                            'video[file]': rest.file( file.path + '\\' + file.name, null, data.length, null, '' )
                        }
                    }).on('complete', function(data) {
                        //if(data.value == 'Done') upload_cb(null, 'OK');
                        //else upload_cb('FILE_UPLOAD_FAILED', null);
                        upload_cb(null, 'OK');
                    });
                } );
            } );
            
        },
        list : function( option, list_cb ) {
            if( typeof(option) == 'function') list_cb = option;
            
            var request = '/ContentManager/api/rest/media?token=' + token;
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
        create: function( option, create_cb ){
            var webpage = {
                name: option.name,
                uri: option.uri,
                mediaType: 'HTML'
            };
            adapter.post('/ContentManager/api/rest/media?token=' + token, webpage, function(err, req, res, obj) {
                create_cb(null, 'OK');
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
        fileupload : function( file, status_cb ) {
            _private.upload( file, function( err, status ){
                if(!err) status_cb( null, status );
                else status_cb(err, null);
            } );
        },
        list : function( option, list_cb ) {
            _private.list( option, list_cb );
        },
        findMediaIdByName : function( mediaName, list_cb ) {
            _private.list( { fields : 'id,duration', search : mediaName }, function( mediaInfo ){
                if( typeof( mediaInfo.list[0].id ) !== 'undefined' ) list_cb( null, { id: mediaInfo.list[0].id, duration: mediaInfo.list[0].duration } );
                else list_cb( 'NOT_FOUND_MEDIA', null );
            } );
        },
        createWebPage : function( option, status_cb ) {
            _private.create( option, function( err, status ){
                if(!err) status_cb( null, status );
                else status_cb(err, null);
            } );
        },
    };
}());
 
 
// Outputs: "current value: 10" and "running"
module.exports = media;
