var FMDB = require('./db.js');
var parser = require('./asyncTimeSlot.js');
var FM = {};

/**
 *  Schema
	EventSchema = new Schema({
        videoId: {type: ObjectID},
        projectId: {type: String},
        ownerId: { _id:ObjectID, userID: String },
		timeslot: { start: Date, end: Date, sequence: Number, duration: Number},
        start: {type: Date},
        end: {type: Date},
        videoUrl: {type: String},
        location: {type: String},    //location: {type: ObjectID},
        status: {type: String, enum: evtStatus}
    });
 */

FM.SCHEDULE = (function(){
    var uInstance = null;
    
    function constructor(){
        //var FMDB = DB.getInstance();
        var events = FMDB.getDocModel("event");
        var programs = FMDB.getDocModel("program");
        
        return {
        /**
         * Public
         */
            listOfReservated : function(range, cb){

                var query = events.find();
                query.where("status", "proved").or( [ 
                            { 'timeslot.start': {$gte: range.start, $lt: range.end} },
                            { 'timeslot.end': {$gt: range.start, $lte: range.end} },
                            { $and: [ {'timeslot.start': {$lte: range.start}}, {'timeslot.end': {$gte: range.end}} ] } 
                          ] )
                     .sort({'timeslot.start': 1}).exec(cb);
                
                /** peudo
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
			
			
			getTimeSlot : function(condition, cb){
                var dooh = condition.dooh;
                var period = condition.period;
                
				var query = events.find();
				query.where('dooh.client', 'nova_sdome_1').or( [ 
                            { 'timeslot.start': {$gte: period.start, $lt: period.end} },
                            { 'timeslot.end': {$gt: period.start, $lte: period.end} },
                            { $and: [ {'timeslot.start': {$lte: period.start}}, {'timeslot.end': {$gte: period.end}} ] } 
                          ] )
                     .sort({'timeslot.start': 1}).exec(cb);
			},
			
			setTimeSlot : function(data, cb){
				// TODO - set remote timeslot data in db.
                var dooh = data.dooh;
                var timeslotArray = data.timeslotArray;
                
				for( var i in timeslotArray){
					FMDB.createAdoc(events, {dooh: dooh, timeslot: timeslotArray[i]}, cb);
				}
			},
            
            importPeriodicData : function(data){
                FMDB.createAdoc(programs, data, function(err, result){
                    if(err) console.log("[importProgram] error:" + JSON.stringify(err));
                    console.log("[importProgram] result:" + JSON.stringify(result));
                });
            },
            
            generateTimeSlot : function(condition, cb){
                var period = condition.period;
                var dooh = condition.dooh;
                var here = this;
                
                this.getProgramData({'dooh.client': dooh.client}, {program:1}, function(err, result){
                    if(err) console.log("[getProgramData] error:" + JSON.stringify(err));
                    if(result && result.program){
                        parser.getTimeSlot(period, result.program, function(err, result){
                            here.setTimeSlot({dooh: dooh, timeslotArray: result}, cb);
                        });
                        
                    }else{
                        var err = {err: "No this Program!"};
                        cb(err, null);
                    }
                });
            },
            
            getPlayList : function(){
            
            },
            
			setPlayList : function(evtid, newdata, cb){
				// TODO - timeslot with video-related data.
				FMDB.updateAdoc(events, evtid, newdata, cb);
			},
            
            getProgramData : function(condition, field, cb){
                FMDB.getValueOf(programs, condition, field, cb);
            },
            
            reserve : function(evt, cb){
                FMDB.createAdoc(events, evt, cb);
            },
            
            reject : function(evtid, cb){
                FMDB.deleteAdoc(events, evtid, cb); 
            },
            
            prove : function(evtid, cb){
                FMDB.updateAdoc(events, evtid, {"status":"proved"}, cb);
            },
            
            _test : function(){
                var period = {start:1356998400000, end: 1357948740000};
                var condition = {dooh: {client: 'nova_sdome_1', location: 'sdome'}, period: period};
                this.getTimeSlot(condition, function(err, result){
                    if(err) console.log("[getTimeSlot] error:" + JSON.stringify(err));
                    if(result)
                        console.log("[getTimeSlot] result:" + JSON.stringify(result));
                });
                /* generateTimeSlot
                var period = {start:1358640000000, end: 1359676740000};
                var condition = {dooh: {client: 'nova_sdome_1', location: 'sdome'}, period: period};
                
                this.generateTimeSlot(condition, function(err, result){
                    if(err) console.log("[generateTimeSlot] error:" + JSON.stringify(err));
                    if(result)
                        console.log("[generateTimeSlot] result:" + JSON.stringify(result));
                    return;
                });*/
                
                /* importPeriodicData
                var programData = [ { mode: 'day',
                                        day: 2,
                                        start: '12:20:00',
                                        end: '15:20:00',
                                        sequence: 5,
                                        duration: '11' },
                                      { mode: 'day',
                                        day: 4,
                                        start: '12:20:00',
                                        end: '15:20:00',
                                        sequence: 5,
                                        duration: '11' },
                                      { mode: 'period',
                                        start_date: '2013/01/30',
                                        end_date: '2013/02/02',
                                        start: '16:30:00',
                                        end: '18:30:00',
                                        sequence: 0,
                                        duration: '11' },
                                      { mode: 'period',
                                        start_date: '2013/01/30',
                                        end_date: '2013/02/02',
                                        start: '16:30:00',
                                        end: '18:30:00',
                                        sequence: 3,
                                        duration: '11' },
                                      { mode: 'period',
                                        start_date: '2013/01/30',
                                        end_date: '2013/02/02',
                                        start: '16:30:00',
                                        end: '18:30:00',
                                        sequence: 4,
                                        duration: '11' },
                                      { mode: 'month',
                                        date: '29',
                                        start: '14:50:00', 
                                        end: '18:30:00',
                                        sequence: 1,
                                        duration: '11' },
                                      { mode: 'month',
                                        date: '29',
                                        start: '14:50:00',
                                        end: '18:30:00',
                                        sequence: 5,
                                        duration: '11' }
                ];
                var data = {
                    dooh: {client: 'nova_sdome_1', location: 'sdome'},
                    program: programData,
                };
                
                this.importPeriodicData(data, function(err, result){
                    if(err) console.log("[importProgram] error:" + JSON.stringify(err));
                    console.log("[importProgram] result:" + JSON.stringify(result));
                    return;
                });*/
            },
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

FM.SCHEDULE.getInstance()._test();

module.exports = FM.SCHEDULE.getInstance();