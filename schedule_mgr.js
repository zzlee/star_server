/**
 * @fileoverview Implementation of scheduleMgr
 */

var db = require('./db.js');
var programTimeSlot = db.getDocModel("programTimeSlot");

/**
 * The manager who handles the scheduling of playing UGC on DOOHs
 *
 * @mixin
 */
var scheduleMgr = {};

var DEFAULT_PERIOD = 10*60*1000; //10 min
var TIME_INTERVAL_RANKIGN = [{statHour: 17, endHour: 23},
                             {statHour: 8, endHour: 16},
                             {statHour: 0, endHour: 7}];

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
 *     <li>start: Date()-readable string specifying the start of the interval
 *     <li>end: Date()-readable string specifying the end of the interval
 *     </ul>
 *     For example, {start: '2013/6/21 8:30', end: '2013/6/21 13:00'} 
 *
 * @param {Object} intervalOfPlanningDoohProgrames An object specifying the starting and ending of  
 *     of the time interval which the generated schedule covers   
 *     <ul>
 *     <li>start: Date()-readable string specifying the start of the interval
 *     <li>end: Date()-readable string specifying the end of the interval
 *     </ul>
 *     For example, {start: '2013/6/22 8:30', end: '2013/6/22 13:00'} 
 * 
 * @param {Function} created_cb The callback function called when the result program list is created.<br>
 *     The function signature is created_cb(resultProgramList, err) :
 *     <ul>
 *     <li>resultProgramList: An array of objects containing program info:
 *         <ul>
 *         <li>id: A string (i.e. a hex string representation of its ObjectID in MongoDB) specifying the ID of a program time slot item  
 *         <li>timeSlot: An object specifying the starting and ending time of program's time slot
 *             <ul>
 *             <li>start: Date()-readable string specifying the start of the interval
 *             <li>end: Date()-readable string specifying the end of the interval
 *             </ul>
 *         <li>ugc: A number specifying the ID of the UGC contained in this program. (This is
 *             actually the id of items store in ugc collection.) 
 *         </ul>
 *         For example, <br>
 *         [{_id:43524, interval:{start:'2013/6/22 8:30:00', end:'2013/6/22 8:30:30'}, ugc:48593},<br>
 *          {_id:43525, interval:{start:'2013/6/22 8:30:00', end:'2013/6/22 8:30:30'}, ugc:48353},<br>
 *          {_id:43544, interval:{start:'2013/6/22 8:30:00', end:'2013/6/22 8:30:30'}, ugc:43593}]
 *         
 *     <li>err: error message if any error happens
 *     </ul>
 */
scheduleMgr.createProgramList = function(dooh, intervalOfSelectingUGC, intervalOfPlanningDoohProgrames, created_cb ){
    
    //for test
    var censorMgr_getUGCList_fake = function(interval, get_cb){
        var result = [];
        for (var i=0;i<300;i++){
            result[i] = {id: i};
        }
        get_cb(result, null);
        
    };
    
    //for test
    var scalaMgr_listAvailableTimeInterval = function(interval, list_cb){
        var result = [{interval:{start:(new Date("2013/5/5 17:35:20")).getTime(), end:(new Date("2013/5/5 17:35:20")).getTime()},cycleDuration: 5*60*1000},
                      {interval:{start:(new Date("2013/5/5 17:35:20")).getTime(), end:(new Date("2013/5/5 17:35:20")).getTime()},cycleDuration: 5*60*1000},
                      {interval:{start:(new Date("2013/5/5 17:35:20")).getTime(), end:(new Date("2013/5/5 17:35:20")).getTime()},cycleDuration: 5*60*1000}
                      ];
        list_cb(result, null);
    };
    
    
    
    var putUgcIntoTimeSlots = function(err){
        for (var j=0;j<TIME_INTERVAL_RANKIGN.length;j++){
            //TODO: query the time slots (in programTimeSlot collection) belonging to this interval and put UGC to them one by one
            
        }
    };
    
    var generateTimeSlot = function(sortedUgcList, _cb1){
        scalaMgr_listAvailableTimeInterval(intervalOfPlanningDoohProgrames,function(result, err){
            if (!err){
                //TODO: generate program time slot documents (in programTimeSlot collection) according to available intervals and corresponding cycle durations
                
                _cb1();
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
            generateTimeSlot(_sortedUgcList, putUgcIntoTimeSlots);
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
 * @param {Object} intervalOfDoohProgrames An object specifying the starting and ending of  
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
scheduleMgr.updateProgramList = function(dooh, intervalOfDoohProgrames, updated_cb ){
    
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