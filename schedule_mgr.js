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
    var DEFAULT_PROGRAM_SEQUENCE = [ "miix", "cultural_and_creative", "mood", "check_in" ]; 
    var programSequence = DEFAULT_PROGRAM_SEQUENCE;
    
    return {
        getProgramGenreToPlan: function(){
            i++;
            if (i >= programSequence.length){
                i = 0;
            }
            return programSequence[i];
        },
        
        reset: function(){
            i = -1;
        },
        
        set: function(_programSequence){
            programSequence = _programSequence;
        }
    };
})();


var paddingContent =(function(){ 
    var PADDING_CONTENT_TABLE = {
            miix: [{dir: "content/padding_content", file:"miix01.jpg", format:"image"},
                   {dir: "content/padding_content", file:"miix02.jpg", format:"image"}],
            cultural_and_creative: [{dir: "content/padding_content", file:"cc01.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc02.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc03.jpg", format:"image"},
                                    {dir: "content/padding_content", file:"cc04.jpg", format:"image"}
                                    ],
            mood: [{dir: "content/padding_content", file:"mood01.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood02.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood03.jpg", format:"image"},
                   {dir: "content/padding_content", file:"mood04.jpg", format:"image"}
                   ],
            check_in: [{dir: "content/padding_content", file:"check_in01.jpg", format:"image"},
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
 *     For example, {start: 1371861000000, end: 1371862000000} 
 *
 * @param {Object} intervalOfPlanningDoohProgrames An object specifying the starting and ending of  
 *     of the time interval which the generated schedule covers   
 *     <ul>
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 *     For example, {start: 1371861000000, end: 1371862000000} 
 * 
 * @param {Array} programSequence An array of strings showing the sequence of program genres to use when 
 *     when the system is planning the program(s) of a "micro time interval" <br>
 *     Note: the string must be "miix", "cultural_and_creative", "mood", or "check_in"
 *     For example, ["miix", "check_in", "check_in", "mood", "cultural_and_creative" ] <br>
 * 
 * @param {Function} created_cb The callback function called when the result program list is created.<br>
 *     The function signature is created_cb(err, numberOfProgramTimeSlots):
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>numberOfProgramTimeSlots: number of UGC program time slots generated
 *     </ul>
 */
scheduleMgr.createProgramList = function(dooh, intervalOfSelectingUGC, intervalOfPlanningDoohProgrames, programSequence, created_cb ){
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
        
        get_cb(null, result);
        
    };
    
    //for test
    var scalaMgr_listAvailableTimeInterval = function(interval, list_cb){
        var result = [{interval:{start:(new Date("2013/5/5 7:30:20")).getTime(), end:(new Date("2013/5/5 8:30:20")).getTime()},cycleDuration: 5*60*1000},
                      {interval:{start:(new Date("2013/5/5 13:00:00")).getTime(), end:(new Date("2013/5/5 13:30:00")).getTime()},cycleDuration: 5*60*1000},
                      {interval:{start:(new Date("2013/5/5 19:00:00")).getTime(), end:(new Date("2013/5/5 19:40:00")).getTime()},cycleDuration: 5*60*1000}
                      ];
        list_cb(null, result );
    };
    
    
    
    var putUgcIntoTimeSlots = function(finishPut_cb){
        
        var candidateUgcList = sortedUgcList.slice(0); //clone the full array of sortedUgcList
        var indexOfcandidateToSelect = 0;
        var counter = 0;
        
        //== PutUgcIntoTimeSlots_eachRankedTimeIntervalInADay
        var iteratorPutUgcIntoTimeSlots_eachRankedTimeIntervalInADay = function(aTimeIntervalInADay, interationDone_cb1){
            //query the time slots (in programTimeSlot collection) belonging to this interval and put UGC to them one by one
            //console.log("aTimeIntervalInADay=");
            //console.dir(aTimeIntervalInADay);
            programTimeSlotModel.find({ "timeslot.startHour": {$lte:aTimeIntervalInADay.endHour, $gte:aTimeIntervalInADay.startHour}, "type": "UGC", "dooh": dooh }).sort({timeStamp:1}).exec(function (_err_1, timeSlots) {
                
                if (!_err_1){
                    
                    //console.log("timeSlots=");
                    //console.dir(timeSlots);   
                    //-- PutUgcIntoTimeSlots_eachTimeSlot
                    var iteratorPutUgcIntoTimeSlots_eachTimeSlot = function(aTimeSlot, interationDone_cb2){
                        
                        var selectedUgc = null;
                        
                        //pick up one UGC from the sorted list 
                        for (indexOfcandidateToSelect=0; indexOfcandidateToSelect<=candidateUgcList.length; indexOfcandidateToSelect++){
                            
                            if (indexOfcandidateToSelect == candidateUgcList.length){
                                candidateUgcList = candidateUgcList.concat(sortedUgcList);
                            }
                            
                            if ( candidateUgcList[indexOfcandidateToSelect].genre == aTimeSlot.genre){
                                selectedUgc = candidateUgcList.splice(indexOfcandidateToSelect, 1)[0];
                                break;
                            }
                        }
                        
                        db.updateAdoc(programTimeSlotModel, aTimeSlot._id, {"content": selectedUgc }, function(_err_2, result){
                            counter++;
                            //console.dir(result);
                            interationDone_cb2(_err_2);
                        });
                        
                        
                    };
                    
                    async.eachSeries(timeSlots, iteratorPutUgcIntoTimeSlots_eachTimeSlot, function(_err_3){
                        interationDone_cb1(_err_3);
                    });
                    // -- end of PutUgcIntoTimeSlots_eachTimeSlot
                    
                }
                else{
                    interationDone_cb1(_err_1);
                }
                
                //console.log("timeSlots=");
                //console.dir(timeSlots);
            });
            
            
                
        };
        
        async.eachSeries(TIME_INTERVAL_RANKIGN, iteratorPutUgcIntoTimeSlots_eachRankedTimeIntervalInADay, function(_err_4){
            if (!_err_4) {
                
                var numberOfProgramTimeSlots = counter;
                
                finishPut_cb(null, numberOfProgramTimeSlots);
            }
            else{
                if (finishPut_cb){
                    finishPut_cb('Failed to add empty program time slots into ranked intervals in a day: '+_err_4, null);
                }
            }
            
        });
        //== end of PutUgcIntoTimeSlots_eachRankedTimeIntervalInADay
        
        
    };  //end of putUgcIntoTimeSlots()
    
    var generateTimeSlot = function( _cb1){
        
         
        var generateTimeSlotsOfMicroInterval = function(interval, generatedTimeSlotsOfMicroInterval_cb){ //Micro interval means a time slot containing purely our programs
            
            var genre = programPlanningPattern.getProgramGenreToPlan(); //the genra that will be uesed in this micro interval
            var numberOfUGC;
            if (genre=="miix"){
                numberOfUGC = 1;
            }
            else{
                numberOfUGC = 3;
            }
            var paddingContents;
            
            var ProgramTimeSlot = programTimeSlotModel;
            var vjsonDefault = {
                    dooh: dooh,
                    timeslot: {
                        start: interval.start, 
                        end: interval.end,
                        startHour: (new Date(interval.start)).getHours()},
                    //content: {ugcId:"12345676", ugcProjcetId:"3142462123"}
                    genre: genre
                    };
            
            var timeStampIndex = 0;
            
            var pad = function(n, width, z) { //function for padding the number ns with character z 
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            };
            
            async.series([
                          function(callback1){
                              // get all the padding contents
                              var indexArrayPaddingContents = []; for (var i = 0; i < numberOfUGC+1; i++) { indexArrayPaddingContents.push(i); }
                              
                              var iteratorGetPaddingContents = function(indexOfPaddingContents, interationDone_getPaddingContents_cb){
                                  paddingContent.get(genre+'-'+indexOfPaddingContents , function(err_get, paddingContent){
                                      interationDone_getPaddingContents_cb(err_get, paddingContent);
                                  });
                              };
                              async.mapSeries(indexArrayPaddingContents, iteratorGetPaddingContents, function(err, results){
                                  paddingContents = results;
                                  //console.log('paddingContents=');
                                  //console.dir(paddingContents);
                                  callback1(null);
                              });
                              
                          },
                          function(callback2){
                              // put padding program 0
                              var aProgramTimeSlot = new ProgramTimeSlot(vjsonDefault);
                              aProgramTimeSlot.content = paddingContents[0];
                              aProgramTimeSlot.timeStamp = interval.start + '-' + pad(timeStampIndex, 3);
                              timeStampIndex++;
                              aProgramTimeSlot.markModified('content');
                              aProgramTimeSlot.save(function(err1, _result){     
                                  //if (err1) console.log("err1="+err1);
                                  callback2(err1);
                              });
                          },
                          function(callback3){
                              // put following programs: UGC 0, padding 1, UGC 1, padding 2, .....
                              var indexArrayUgcPrograms = []; for (var i = 0; i < numberOfUGC; i++) { indexArrayUgcPrograms.push(i); }
                              
                              var iteratorPutUgcAndPaddingProgrames = function(indexOfUgcContents, interationDone_putUgcAndPaddingPrograms_cb){
                                  
                                  async.series([
                                                function(cb1){
                                                    //put UGC program
                                                    var aProgramTimeSlot = new ProgramTimeSlot(vjsonDefault);
                                                    aProgramTimeSlot.type = 'UGC';
                                                    aProgramTimeSlot.timeStamp = interval.start + '-' + pad(timeStampIndex, 3);
                                                    timeStampIndex++;
                                                    aProgramTimeSlot.save(function(err2, _result){     
                                                        cb1(err2);
                                                    });
                                                },
                                                function(cb2){
                                                    //put padding program
                                                    var aProgramTimeSlot = new ProgramTimeSlot(vjsonDefault);
                                                    aProgramTimeSlot.type = 'padding';
                                                    aProgramTimeSlot.content = paddingContents[indexOfUgcContents+1];
                                                    aProgramTimeSlot.markModified('content');
                                                    aProgramTimeSlot.timeStamp = interval.start + '-' + pad(timeStampIndex, 3);
                                                    timeStampIndex++;
                                                    aProgramTimeSlot.save(function(err3, _result){     
                                                        cb2(err3);
                                                    });
                                                }
                                  ],
                                  function(err, results){
                                      interationDone_putUgcAndPaddingPrograms_cb(err);
                                  });
                                  
                              };
                              async.eachSeries(indexArrayUgcPrograms, iteratorPutUgcAndPaddingProgrames, function(err){
                                  callback3(null);
                              });
                              
                          }
            ],
            function(err, results){
                generatedTimeSlotsOfMicroInterval_cb(err);
            });

            
        };
        
        //TODO: call the real ScalaMgr
        scalaMgr_listAvailableTimeInterval(intervalOfPlanningDoohProgrames,function(err, result){
            if (!err){
                
                //TODO: check if these available time intervals cover existing planned program time slots. If yes, maked the UGCs contained in these program time slots "must-play" and delete these program time slots.
                
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
                        function (cb_whilst) {
                            // add time slots of a micro timeslot (of the same genre) to db
                            var inteval = { start: timeToAddTimeSlot, end:timeToAddTimeSlot+programPeriod  };
                            generateTimeSlotsOfMicroInterval(inteval, function(err1){
                                timeToAddTimeSlot += programPeriod;
                                cb_whilst(err1);
                            });
                        },
                        function (err2) {
                            interationDone_cb(err2);
                        }
                    );
                };
                
                async.eachSeries(availableTimeIntervals, iteratorGenerateTimeSlot, function(err0){
                    if (!err0) {
                        //do the next step.... 
                        _cb1(null);
                    }
                    else{
                        _cb1('Failed to generate time slots in available time intervals: '+err0);
                    }
                });
                
               
            }
            else{
                _cb1('Failed to read available time interval list.', null);                    
            }
            
        });
        
    };  //end of generateTimeSlot()
    
    if (programSequence){
        programPlanningPattern.set(programSequence);
    }
    
    //TODO: call the real censorMgr
    censorMgr_getUGCList_fake(intervalOfSelectingUGC, function(err_1, _sortedUgcList ){
        
        //TODO: check the genre of all these UGC contents. If any of the genres is missing, remove it from the programSequence of programPlanningPattern  
        
        if (!err_1){
            sortedUgcList = _sortedUgcList;
            generateTimeSlot( function(err_2){
                if (!err_2) {
                    console.log('generateTimeSlot() done! ');
                    
                    putUgcIntoTimeSlots(function(err_3, result){
                        console.log('putUgcIntoTimeSlots() done! ');
                        if (created_cb){
                            created_cb(err_3, result);
                        }                        
                    });
                }
                else {
                    if (created_cb){
                        created_cb('Failed to read sorted UGC list.', null);
                    }
                }
            });
        }
        else{
            if (created_cb){
                created_cb('Failed to read sorted UGC list.', null);
            }
        }
    });
    
    
};


//TODO: elaborate resultProgramList
/**
 * Get the programs (of a specific DOOH) of a specific interval.<br>
 * <br>
 * @param {Number} dooh The ID (the hex string representation of its ObjectID in MongoDB) of the DOOH where the program is to be updated
 * 
 * @param {Object} interval An object specifying the starting and ending of of the time interval to query 
 *     <ul>
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 *     For example, {start: 1371861000000, end: 1371862000000} 
 * @param {Number} skip
 * @param {Number} limit
 * @param {Function} created_cb The callback function called when the result program list is created.<br>
 *     The function signature is got_cb(err, resultProgramList):
 *     <ul>
 *     <li>err: error message if any error happens
 *     <li>resultProgramList: An array of objects containing program info:
 *         <ul>
 *         <li>_id: A string (i.e. a hex string representation of its ObjectID in MongoDB) specifying the ID of a program time slot item  
 *         <li>timeSlot: An object specifying the starting and ending time of program's time slot
 *             <ul>
 *             <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *             </ul>
 *         <li>ugc: A number specifying the ID of the UGC contained in this program. (This is
 *             actually the id of items store in UGC collection.) 
 *         </ul>
 *         For example, <br>
 *         [{_id:43524, timeSlot:{start:1371861000000, end :1371862000000}, ugc:48593},<br>
 *          {_id:43525, timeSlot:{start:1371881000000, end:1371882000000}, ugc:48353},<br>
 *          {_id:43544, timeSlot:{start:1371897000000, end:1371898000000}, ugc:43593}]
 *         
 *     </ul>
 */
scheduleMgr.getProgramList = function(dooh, interval, skip, limit, got_cb ){
    
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
 *     <li>start: the start of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     <li>end: the end of the interval (with the number of milliseconds since midnight Jan 1, 1970)
 *     </ul>
 *     For example, {start: 1371861000000, end: 1371862000000} 
 * @param {Function} updated_cb The callback function called when the program list is updated.<br>
 *     The function signature is updated_cb(err, listOfProgramsOutOfSchedule) :
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
 * Set an UGC of specific No to be played in a specific program time slot (of a specific DOOH <br>
 * <br>
 * @param {Number} dooh The ID (the hex string representation of its ObjectID in MongoDB) of the DOOH where the program is to be updated
 * 
 * @param {String} programTimeSlot The ID of the program time slot item
 * 
 * @param {Number} ugcNo The reference No the UGC item to put in the specified program time slot
 * 
 * @param {Function} set_cb The callback function called when the specified program is set.<br>
 *     The function signature is updated_cb(err) where err is the error message indicating failure: 
 *     if successful, err returns null; if failed, err returns the error message.
 *     
 */
scheduleMgr.setUgcToProgram = function(dooh, programTimeSlotId, ugcNo, set_cb ){
    
};


/**
 * Remove the UGC from a specific progrm (of a specific DOOH) and automatically set a new UGC back to this program time slot <br>
 * <br>
 * @param {Number} dooh The ID (the hex string representation of its ObjectID in MongoDB) of the DOOH where the program is to be updated
 * 
 * @param {Number} programTimeSlot The ID of the program time slot item
 * 
 * @param {Function} removed_cb The callback function called when the specific .<br>
 *     The function signature is removed_cb(err) where err is the error message indicating failure: 
 *     if successful, err returns null; if failed, err returns the error message.
 *     
 */
scheduleMgr.removeUgcfromProgramAndAutoSetNewOne = function(dooh, programTimeSlot, removed_cb ){
    
};



module.exports = scheduleMgr;