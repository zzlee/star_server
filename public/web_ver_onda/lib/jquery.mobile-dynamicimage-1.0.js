(function($){

    // Widget definition
    $.widget("mobile.dynamicimage", $.mobile.widget, {
    
        options:{
        // Here we can create defualt options fo our widget
            width: "100%",
            margin: 0
        },
        // Private methods
        _create: function(){
            // The constructor function
            this._loadURL();
        },
        
        _loadURL: function(){
            // this.element will be our +img+ element
            var url;
            url = "http://src.sencha.io/";
            
            var parameters = "";
            if(!isNaN(this.options.width)){
                parameters += "x" + this.options.width;
            }
            if((!isNaN(this.options.margin)) && this.options.margin > 0){
                parameters += "-" + this.options.margin;
            }
            if(parameters.length > 0){
                url += parameters + "/";
            }
            
            // Sencha IO needs an absolute URL.
            var originalUrl = $(this.element).jqmData("src");
            if(originalUrl.length > 1){
                var newUrl = "";
                if($.mobile.path.isAbsoluteUrl(originalUrl)){
                    // The image URL is relative, we create an absolute one.
                    var baseUrl = $.mobile.path.parseUrl(location.href);
                    var baseUrlWithoutScript = baseUrl.directory;
                    newUrl = $.mobile.path.makeUrlAbsolute(originalUrl, baseUrlWithoutScript);
                }
                
                url += newUrl;
                $(this.element).attr("src", url);
            }
        },
        
        // Public methods
        enable: function(){
            $(this.element).attr('disabled', '');
        },
        disable: function(){
            $(this.element).removeAttr('disabled');
        },
        refresh: function(){
            this._loadURL();
        }
    }); // End of widget definition
    
    //  Auto-initialization code
    $(document).bind("pagecreate", function(event){
        // We find data-role's and apply our widget constructor
        $(event.target).find(":jqmData(role='dynamic-image')").dynamicimage();
    });
    
}(jQuery));