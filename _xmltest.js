var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
parser.addListener('end', function(result) {
    //console.dir(result);
	console.log(result.customizable_object_list.customizable_object[0].description);
    console.log('Done.');
});
fs.readFile('D:\\nodejs_projects\\i_am_a_super_star\\public\\contents\\template\\template_memory\\raw_data\\template_raw_data_description.xml', function(err, data) {
    parser.parseString(data);
});