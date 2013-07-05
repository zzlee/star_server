/**
 * @fileoverview Implementation of scheduleMgr
 */

var db = require('./db.js');
var async = require('async');

var programTimeSlotModel = db.getDocModel("programTimeSlot");

/**
 * The manager who handles the scheduling of playing UGC on DOOHs
 *
 * @mixin
 */
var scheduleMgr = {};

var DEFAULT_PROGRAM_PERIOD = 10*60*1000; //10 min
var TIME_INTERVAL_RANKIGN = [{startHour: 17, endHour: 23},  //start with the time interval with highest ranking
                             {startHour: 8, endHour: 16},
                             {startHour: 0, endHour: 7}];

var programPlanningPattern =(function(){    
    var i = -1;
    var PROGRAM_SEQUENCE = [ "miix", "cultural_and_creative", "mood", "check_in" ];
    
    return {
        getProgramGenreToPlan: function(){
            i++;
            if (i >= PROGRAM_SEQUENCE.length){
                i = 0;
            }
            return PROGRAM_SEQUENCE[i];
        },
        
        reset: function(){
            i = -1;
        }
    };
})();


var paddingContent =(function(){ 
    var PADDING_CONTENT_TABLE = {
            MIIX: [{dir: "content/padding_content", file:"miix01.jpg", format:"image"},
                   {dir: "content/padding_content", file:"miix02.jpg", format:"image"}],
            CULTURAL_AND_CREATIVE: [{dir: "content/padding_content", file:"cc01.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc02.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc03.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc04.jpg", format:"image"}
                                    ],
            MOOD: [{dir: "content/padding_content", file:"mood01.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood02.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood03.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood04.jpg", format:"image"}
                   ],
            CHECK_IN: [{dir: "content/padding_content", file:"check_in01.jpg", format:"image"},
                       {dir: "content/padding_content", file:"check_in02.jpg", format:"image"},
                       {dir: "content/padding_content", file:"check_in03.jpg", format:"image"},
                       {dir: "content/padding_content", file:"check_in04.jpg", format:"image"}
                       ]                                
    };
        
    return {
        get: function(id, cb){
            var idArray = id.split('-');
            var genre = idArray[0]; 
            var index = idArray[1];
            if (cb){
                cb(null, PADDING_CONTENT_TABLE[genre][index]);
            } 
        }
    };
})();
        
/**
 * Automatically selects applied UGC items (based on a predefined rule) and put them
 * in "to-be-played" list for a specific DOOH.<br>
 * <br>
 * This method will first ask ScalaMgr about the available time intervals in which Miix system
 * can play its UGC content.  It will then generate time slots base on a specific rule, and then 
 * fill them by pickeing up UGC items from a sorted list generated from censerMgr.
 * 
 * @param {Number} dooh The ID (the hex string representation of its ObjectID in MongoDB) of the DOOH upon which the selected UGCs are played
 * 
 * @param {Object} intervalOfSelectingUGC An object specifying the starting and ending of  
 *     of the time interval for scheduleMgr to select the applied UGC items <br>
 *     <ul>
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 *     For example, {start: '2013/6/21 8:30', end: '2013/6/21 13:00'} 
 *
 * @param {Object} intervalOfPlanningDoohProgrames An object specifying the starting and ending of  
 *     of the time interval which the generated schedule covers   
 *     <ul>
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970) *     </ul>
 *     For example, {start: '2013/6/22 8:30', end: '2013/6/22 13:00'} 
 * 
 * @param {Function} created_cb The callback function called when the result program list is created.<br>
 *     The function signature is created_cb(resultProgramList, err):
 *     <ul>
 *     <li>resultProgramList: An array of objects containing program info:
 *         <ul>
 *         <li>id: A string (i.e. a hex string representation of its ObjectID in MongoDB) specifying the ID of a program time slot item  
 *         <li>timeSlot: An object specifying the starting and ending time of program's time slot
 *             <ul>
 *             <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             </ul>
 *         <li>ugc: A number specifying the ID of the UGC contained in this program. (This is
 *             actually the id of items store in UGC collection.) 
 *         </ul>
 *         For example, <br>
 *         [{id:43524, timeSlot:{start:1371861000000, end :1371862000000}, ugc:48593},<br>
 *          {id:43525, timeSlot:{start:1371881000000, end:1371882000000}, ugc:48353},<br>
 *          {id:43544, timeSlot:{start:1371897000000, end:1371898000000}, ugc:43593}]
 *         
 *     <li>err: error message if any error happens
 *     </ul>
 */
scheduleMgr.createProgramList = function(dooh, intervalOfSelectingUGC, intervalOfPlanningDoohProgrames, created_cb ){
    var programTimeSlotModel = db.getDocModel("programTimeSlot");
    
    var sortedUgcList = null;
    
    //for test
    var censorMgr_getUGCList_fake = function(interval, get_cb){
        /*
        var result = [];
        for (var i=0;i<300;i++){
            result[i] = {id: i};
        }
        */
        var result = [ {id: "1", genre: "miix"},
                       {id: "2", genre: "cultural_and_creative"},
                       {id: "3", genre: "check_in"},
                       {id: "4", genre: "miix"},
                       {id: "5", genre: "check_in"},
                       {id: "6", genre: "check_in"},
                       {id: "7", genre: "miix"},
                       {id: "8", genre: "check_in"},
                       {id: "9", genre: "miix"},
                       {id: "10", genre: "cultural_and_creative"},
                       {id: "11", genre: "miix"},
                       {id: "12", genre: "check_in"},
                       {id: "13", genre: "mood"},
                       {id: "14", genre: "cultural_and_creative"},
                       {id: "15", genre: "miix"},
                       {id: "16", genre: "mood"},
                       {id: "17", genre: "check_in"},
                       {id: "18", genre: "check_in"},
                       {id: "19", genre: "miix"},
                       {id: "20", genre: "cultural_and_creative"},
                       {id: "21", genre: "miix"},
                       {id: "22", genre: "check_in"},
                       {id: "23", genre: "cultural_and_creative"},
                       {id: "24", genre: "mood"},
                       {id: "25", genre: "mood"},
                       {id: "26", genre: "miix"},
                       {id: "27", genre: "cultural_and_creative"},
                       {id: "28", genre: "miix"},
                       {id: "29", genre: "check_in"},
                       {id: "30", genre: "miix"},
                       {id: "31", genre: "miix"},
                       {id: "32", genre: "check_in"},
                       {id: "33", genre: "mood"},
                       {id: "34", genre: "cultural_and_creative"},
                       {id: "35", genre: "miix"},
                       {id: "36", genre: "mood"},
                       {id: "37", genre: "check_in"},
                       {id: "38", genre: "check_in"},
                       {id: "39", genre: "mood"},
                       {id: "40", genre: "mood"},
                       {id: "41", genre: "miix"},
                       {id: "42", genre: "check_in"},
                       {id: "43", genre: "mood"},
                       {id: "44", genre: "check_in"},
                       {id: "45", genre: "mood"},
                       {id: "46", genre: "miix"},
                       {id: "47", genre: "check_in"},
                       {id: "48", genre: "miix"},
                       {id: "49", genre: "check_in"},
                       {id: "50", genre: "miix"},
                       
                       ];
        
        get_cb(result, null);
        
    };
    
    //for test
    var scalaMgr_listAvailableTimeInterval = function(interval, list_cb){
        var result = [{interval:{start:(new Date("2013/5/5 7:30:20")).getTime(), end:(new Date("2013/5/5 8:30:20")).getTime()},cycleDuration: 5*60*1000},
                      {interval:{start:(new Date("2013/5/5 13:00:00")).getTime(), end:(new Date("2013/5/5 13:30:00")).getTime()},cycleDuration: 5*60*1000},
                      {interval:{start:(new Date("2013/5/5 19:00:00")).getTime(), end:(new Date("2013/5/5 19:40:00")).getTime()},cycleDuration: 5*60*1000}
                      ];
        list_cb(result, null);
    };
    
    
    
    var putUgcIntoTimeSlots = function(err){
        
        var ugcCandidateList = sortedUgcList.slice(0); //clone the full array of ugcCandidateList
        
        var iteratorPutUgcIntoTimeSlots_eachRankedTimeIntervalInADay = function(aTimeIntervalInADay, interationDone_cb1){
            //query the time slots (in programTimeSlot collection) belonging to this interval and put UGC to them one by one
            //console.log("aTimeIntervalInADay=");
            //console.dir(aTimeIntervalInADay);
            programTimeSlotModel.find({ "timeslot.startHour": {$lte:aTimeIntervalInADay.endHour, $gte:aTimeIntervalInADay.startHour} }, function (err_1, timeSlots) {
                
                if (!err_1){
                    
                    var iteratorPutUgcIntoTimeSlots_eachTimeSlot = function(aTimeSlot, interationDone_cb2){
                        
                        //pick up one UGC from the sorted list 
                        var indexOfUgcCandidate = 0;
                        
                        db.updateAdoc(programTimeSlotModel, aTimeSlot._id, {"ugc._id":"proved"}, function(err_2, result){
                            
                            
                            interationDone_cb2(err_2);
                        });
                        
                    };
                    
                    async.eachSeries(timeSlots, iteratorPutUgcIntoTimeSlots_eachTimeSlot, function(err_3){
                        interationDone_cb1(err_3);
                    });
                }
                else{
                    interationDone_cb1(err_1);
                }
                
                //console.log("timeSlots=");
                //console.dir(timeSlots);
                interationDone_cb(err);
            });
            
            
                
        };
        
        async.eachSeries(TIME_INTERVAL_RANKIGN, iteratorPutUgcIntoTimeSlots_eachRankedTimeIntervalInADay, function(err3){
            if (!err3) {
                
                var resultProgramList;
                //TODO: query the db to get resultProgramList 
                
                    if (created_cb){
                        created_cb(resultProgramList, null);
                    }
            }
            else{
                if (created_cb){
                    created_cb(null,'Failed to add empty program time slots: '+err3);
                }
            }
            
        });
    };
    
    var generateTimeSlot = function( _cb1){
        scalaMgr_listAvailableTimeInterval(intervalOfPlanningDoohProgrames,function(result, err){
            if (!err){
                //generate program time slot documents (in programTimeSlot collection) according to available intervals and corresponding cycle durations
                var availableTimeIntervals = result;
                var iteratorGenerateTimeSlot = function(anAvailableTimeInterval, interationDone_cb){
                    
                    //add time slots in this available time interval
                    var timeToAddTimeSlot = anAvailableTimeInterval.interval.start;
                    var programPeriod;
                    if (anAvailableTimeInterval.cycleDuration > DEFAULT_PROGRAM_PERIOD){
                        programPeriod = anAvailableTimeInterval.cycleDuration;
                    }
                    else {
                        programPeriod = DEFAULT_PROGRAM_PERIOD;
                    }

                    async.whilst(
                        function () { return timeToAddTimeSlot+anAvailableTimeInterval.cycleDuration <= anAvailableTimeInterval.interval.end; },
                        function (callback) {
                            //add one time slot to db
                            var vjson = {
                                    dooh: dooh,
                                    timeslot: {
                                        start: timeToAddTimeSlot, 
                                        end:timeToAddTimeSlot+programPeriod,
                                        startHour: (new Date(timeToAddTimeSlot)).getHours()}
                                    };
                            db.createAdoc(programTimeSlotModel, vjson, function(err1, _result){     
                                if (err1) console.log("err1="+err1);
                                timeToAddTimeSlot += programPeriod;
                                callback(err1);
                            });
                            
                            //console.log("New time slot: %s %s", new Date(vjson.timeslot.start), new Date(vjson.timeslot.end));
                            //console.dir(vjson);

                        },
                        function (err2) {
                            interationDone_cb(err2);
                        }
                    );
                    
                    
                        
                };
                
                async.eachSeries(availableTimeIntervals, iteratorGenerateTimeSlot, function(err0){
                    if (!err0) {
                        
                        //do the next step.... 
                        _cb1();
                    }
                    else{
                        if (created_cb){
                            created_cb(null,'Failed to add empty program time slots: '+err0);
                        }
                    }
                    
                });
                
               
            }
            else{
                if (created_cb){
                    created_cb(null,'Failed to read available time interval list.');
                }
            }
            
        });
        
    };
    
    censorMgr_getUGCList_fake(intervalOfSelectingUGC, function(_sortedUgcList, err){
        
        if (!err){
            sortedUgcList = _sortedUgcList;
            generateTimeSlot( function(){
                putUgcIntoTimeSlots();
            });
        }
        else{
            if (created_cb){
                created_cb(null,'Failed to read sorted UGC list.');
            }
        }
    });
    
    
};


/**
 * Update the programs (of a specific DOOH) of a specific interval.<br>
 * <br>
 * This method will ask ScalaMgr about the latest available time intervals (in which Miix system
 * can play its UGC content) and then re-schedule the programs accordingly. 
 * 
 * @param {Number} dooh The ID (the hex string representation of its ObjectID in MongoDB) of the DOOH whose programs are to be updated
 * 
 * @param {Object} intervalToUpdate An object specifying the starting and ending of  
 *     of the time interval in which the scheduled programs will be updated   
 *     <ul>
 *     <li>start: Date()-readable string specifying the start of the interval
 *     <li>end: Date()-readable string specifying the end of the interval
 *     </ul>
 *     For example, {start: '2013/6/22 8:30', end: '2013/6/22 13:00'} 
 * @param {Function} updated_cb The callback function called when the program list is updated.<br>
 *     The function signature is updated_cb(listOfProgramsOutOfSchedule, err) :
 *     <ul>
 *     <li>listOfProgramsOutOfSchedule: An array of objects containing program info:
 *         <ul>
 *         <li>programTimeSlot: A string specifying the ID (the hex string representation of its ObjectID in MongoDB) of the program item which is removed from the schedule 
 *             after updating 
 *         <li>ugc: A string specifying the ID (the hex string representation of its ObjectID in MongoDB) of the UGC contained in this removed program. (This is
 *             actually the id of items store in ugc collection.) 
 *         </ul>
 *         For example, <br>
 *         [{programTimeSlot:43524, ugc:48593},<br>
 *          {programTimeSlot:43525, ugc:48353},<br>
 *          {programTimeSlot:43544, ugc:43593}]
 *         
 *     <li>err: error message if any error happens
 *     </ul>
 */
scheduleMgr.updateProgramList = function(dooh, intervalToUpdate, updated_cb ){
    
};

/**
 * Set a specific UGC to be played in a specific program time slot (of a specific DOOH <br>
 * <br>
 * @param {Number} dooh The ID (the hex string representation of its ObjectID in MongoDB) of the DOOH where the program is to be updated
 * 
 * @param {Number} programTimeSlot The ID of the program time slot item
 * 
 * @param {Number} ugcToSet The ID of the UGC item to put in the specified program time slot
 * 
 * @param {Function} set_cb The callback function called when the specified program is set.<br>
 *     The function signature is updated_cb(err) where err is the error message indicating failure: 
 *     if successful, err returns null; if failed, err returns the error message.
 *     
 */
scheduleMgr.setProgram = function(dooh, programTimeSlot, ugcToSet, set_cb ){
    
};




module.exports = scheduleMgr;