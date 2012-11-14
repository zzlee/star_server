var FMDB = require('./db.js');
var FM = {};

FM.SCHEDULE = (function(){
    var uInstance = null;
    
    function constructor(){
        //var FMDB = DB.getInstance();
        var events = FMDB.getDocModel("event");
        
        return {
        /*
         * Public
         */
            listOfReservated : function(range, cb){

                var query = events.find();
                query.where("status", "proved").or( [ 
                            { start: {$gte: range.start, $lt: range.end} },
                            { end: {$gt: range.start, $lte: range.end} },
                            { $and: [ {start: {$lte: range.start}}, {end: {$gte: range.end}} ] } 
                          ] ).sort({start: 1}).exec(cb);
                
                /* peudo
                 *   if(range.start < evt.start && evt.start < range.end)
                 *       list.push(evt);
                 *   if(range.start < evt.end && evt.end < range.end)
                 *       list.push(evt);
                 *   if(evt.start < range.start && range.end < evt.end)
                 *       list.push(evt);
                 */    
            },
            
            listOfWaiting : function(cb){
                var query = events.find();
                query.where("status", "waiting").sort({start: 1}).exec(cb);
            },
            
            reserve : function(evt, cb){
                FMDB.createAdoc(events, evt, cb);
            },
            
            reject : function(evtid, cb){
                FMDB.deleteAdoc(events, evtid, cb); 
            },
            
            prove : function(evtid, cb){
                FMDB.updateAdoc(events, evtid, {"status":"proved"}, cb);
            }
        };
    } //    End of Constructor
    
    return {
        getInstance: function(){
            if(!uInstance){
                uInstance = constructor();
            }
            return uInstance;
        }
    };
})();

module.exports = FM.SCHEDULE.getInstance();