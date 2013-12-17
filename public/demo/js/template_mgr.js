
TemplateMgr = (function(){
    var uInstance = null;
    
    
    function constructor(cb_constructor){
        
        var templates = {};
        var doohPreviewTemplates = {};
        
        var obj = {
            //=== public services of TemplateMgr ===
            /**
             * List the main template 
             */
            getTemplateList: function(){
                var templateList = [];
                for(var template in templates){
                    templates[template].id = template;
                    templateList.push(templates[template]);
                }
                return templateList;
            },
            
            /**
             * List the sub-templates of a specific main template
             * 
             * @param mainTemplateId
             * @returns {Array}
             */
            getSubTemplateList: function(mainTemplateId){
                var subTemplateList = [];
                var subTemplates = templates[mainTemplateId].subTemplate;
                for(var subTemplate in subTemplates){
                    //sort subTemplateList by name
                    subTemplates[subTemplate].id = subTemplate;
                    if (subTemplateList.length===0){
                        subTemplateList.push(subTemplates[subTemplate]);
                    }
                    else if (subTemplates[subTemplate].name < subTemplateList[0]){
                        subTemplateList.unshift(subTemplates[subTemplate]);
                    }
                    else {
                        subTemplateList.push(subTemplates[subTemplate]);
                    }
                    
                }
                return subTemplateList;
            },
            
            /**
             * Get a specific template
             * 
             * @param mainTemplateId
             * @returns
             */
            getTemplate: function(mainTemplateId){
                return templates[mainTemplateId];
            },
            
            /**
             * Get a specific sub template
             * 
             * @param mainTemplateId
             * @param subTemplateId
             * @returns
             */
            getSubTemplate: function(mainTemplateId, subTemplateId){
                return templates[mainTemplateId].subTemplate[subTemplateId];
            },
            
            /**
             * Get the folder path of templates
             * 
             * @returns {String}
             */
            getTemplateFolderPath: function(mainTemplateId){
                return templates[mainTemplateId].path;
            },
            
            /**
             * get a specific DOOH preview template
             * 
             * @param mainTemplateId
             * @param subTemplateId
             * @param doohId
             * @returns
             */
            getDoohPreviewTemplate: function(mainTemplateId, subTemplateId, doohId){
                return doohPreviewTemplates[mainTemplateId][doohId][subTemplateId];
            }
    
        };
		
		//-- class TemplateGroup --
		function TemplateGroup(path, locatedOnRemote) {
            this.path = path;
            this.locatedOnRemote = locatedOnRemote;
            this.templates = {};
            this.doohPreviewTemplates = {};
		}
		
		TemplateGroup.prototype.getTemplates = function() {
            return JSON.parse(JSON.stringify(this.templates));
		};
		
		TemplateGroup.prototype.getDoohPreviewTemplates = function() {
            return JSON.parse(JSON.stringify(this.doohPreviewTemplates));
        };
		
		TemplateGroup.prototype.load = function(cbOfLoad){
			var templateList = [];
			var _this = this;
			async.waterfall([
				function(callback){
                    //read template_list.json
					var settings = {
							type: "GET",
							dataType: "json",
							data:{ miixToken: localStorage.miixToken },
							success: function(data, textStatus, jqXHR ){
								//console.dir(data);
								templateList = data;
								callback(null);
							},
							error: function(jqXHR, textStatus, errorThrown){
								callback(errorThrown);
							}						
					};
					$.ajax(_this.path+'template_list_wow.json',settings);
				},
				function(callback){
					//read template_description.json of each template
					var iterator = function(aTemplate, cb_each){
						var settings = {
								type: "GET",
								dataType: "json",
								data:{ miixToken: localStorage.miixToken },
								success: function(data, textStatus, jqXHR ){
									//console.dir(data);
									_this.templates[aTemplate] = data;
									_this.templates[aTemplate].path = _this.path;
									cb_each(null);
								},
								error: function(jqXHR, textStatus, errorThrown){
									cb_each(errorThrown);
								}						
						};
						$.ajax(_this.path+aTemplate+'/template_description.json',settings);
					};
					async.eachSeries(templateList, iterator, function(err, results){
                        if (!err){
                            callback(null);
                        }
                        else {
                            callback('Failed to read template_description.json: '+err);
                        }
					});
				},
				function(callback){
                    //read dooh_preview_description.json of each template
                    var iterator = function(aTemplate, cb_each){
                        var settings = {
                                type: "GET",
                                dataType: "json",
                                data:{ miixToken: localStorage.miixToken },
                                success: function(data, textStatus, jqXHR ){
                                    //console.dir(data);
                                    _this.doohPreviewTemplates[aTemplate] = data;
                                    cb_each(null);
                                },
                                error: function(jqXHR, textStatus, errorThrown){
                                    cb_each('['+aTemplate+']'+errorThrown);
                                }                       
                        };
                        $.ajax(_this.path+aTemplate+'/dooh_preview_description.json',settings);
                    };
                    async.eachSeries(templateList, iterator, function(err, results){
                        if (!err){
                            callback(null);
                        }
                        else {
                            callback('Failed to read dooh_preview_description.json: '+err);
                        }
                    });
                },
                function(callback){
                    //insert absolute path into the properties containing url (i.e. "xxxxUrlxx")
                    //-- UGC templates --
                    for(var mainTemplateId in _this.templates) {
                        var aMainTemplate = _this.templates[mainTemplateId];
                        for(var propertyOfMainTemplate in aMainTemplate) {
                            if (propertyOfMainTemplate.indexOf('Url')>=0) {
                                aMainTemplate[propertyOfMainTemplate] = _this.path + aMainTemplate[propertyOfMainTemplate];
                            }
                        }
                        for(var subTemplateId in aMainTemplate.subTemplate) {
                            var aSubTemplate = aMainTemplate.subTemplate[subTemplateId];
                            for(var propertyOfSubTemplate in aSubTemplate) {
                                if (propertyOfSubTemplate.indexOf('Url')>=0) {
                                    aSubTemplate[propertyOfSubTemplate] = _this.path + aSubTemplate[propertyOfSubTemplate];
                                }
                            }
                        }
                    }
                    //--DOOH preview templates --
                    for(var mainTemplateId in _this.doohPreviewTemplates) {
                        var aMainTemplate = _this.doohPreviewTemplates[mainTemplateId];
                        for (var doohId in aMainTemplate) {
                            var aDooh = aMainTemplate[doohId];
                            for(var subTemplateId in aDooh) {
                                var aSubTemplate = aDooh[subTemplateId];
                                for(var propertyOfSubTemplate in aSubTemplate) {
                                    if (propertyOfSubTemplate.indexOf('Url')>=0) {
                                        aSubTemplate[propertyOfSubTemplate] = _this.path + aSubTemplate[propertyOfSubTemplate];
                                    }
                                }
                            }
                        }
                    }

                    callback(null);
                }

			], 
			function (err, result) {
				if (!err){
					cbOfLoad(null);
				}
				else {
					cbOfLoad("Failed to read template json files: "+err);
				}
				//console.dir(templates);
			});
		};
		//-- end of class TemplateGroup --
		
		var localTemplateGroup = null;
//		var remoteTemplateGroup = null;
		
		async.series([
            function(callback){
                //load local templates
                localTemplateGroup = new TemplateGroup(serverUrl + '/template/', false);
                localTemplateGroup.load(function(err){
                    if (!err){
                        callback(null);
                    }
                    else {
                        callback('Failed to load local templates: '+err);
                    }
                });
            },
            function(callback){
                //load remote templates
                remoteTemplateGroup = new TemplateGroup(serverUrl + '/template/', true);
                remoteTemplateGroup.load(function(err){
                    callback(null);
                });
            },
            function(callback){
                //merge all templates
                $.extend(templates, localTemplateGroup.templates, remoteTemplateGroup.templates);
                $.extend(doohPreviewTemplates, localTemplateGroup.doohPreviewTemplates, remoteTemplateGroup.doohPreviewTemplates);
                callback(null);
            }
        ], 
        function (err, result) {
        if (!err){
                cb_constructor(null, obj);
            }
            else {
                cb_constructor(err,null);
            }
        });
		
	}
	
	
	return {
		getInstance: function(got_cb){
			if(!uInstance){
				constructor(function(err, _uInstance){
					uInstance = _uInstance;
					got_cb(err, uInstance);
				});
            }
			else {
				got_cb(null, uInstance);
			}
		}
	};
})();