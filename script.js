
var request = require('request');0
var cheerio = require('cheerio');

request('https://www.blueletterbible.org/nkjv/rom/14', function(err, resp, html) {
	if (!err){
	  var $ = cheerio.load(html);
		$('div.tools').each(function(i, element){
			var a = $(this);
			a = a.text().split('\n');
			a = a[9];
			a = a.split('\t');
			a = a[4];
			a = a.replace('¶', '');
			a = a.replace('[fn]', '');
			a = a.split('-');
			var verse = a[0];
			var passage = '';
			for (var i=1; i<a.length; i++ ) {
				passage += a[i];
			}
			passage = passage.trim();
			console.log(verse);
			console.log(passage);
			console.log('');
    });
  }
});


