var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser({explicitArray: false});
fs.readFile( 'D:\\nodejs_projects\\star_server\\public\\contents\\user_project\\greeting-50c99d81064d2b841200000a-20130129T072747490Z\\user_data\\customized_content2.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
	
		if (!error)
		var customizable_objects = result.customized_content.customizable_object_list.customizable_object;
		
		if( Object.prototype.toString.call( customizable_objects ) === '[object Array]' ){
		
		
		}
        console.dir(result);
		console.dir(result.customized_content.customizable_object_list.customizable_object );
        console.log('Done');
    });
});