

const myProxy = 'https://cors-anywhere.herokuapp.com/';
const myURL = 'https://cors-anywhere.herokuapp.com/https://www.blueletterbible.org/nkjv/rom/14/1/';

fetch(myProxy + myURL).then(function(res) {
	return res.text();
}).then(function(html) {
	const results = html.match(/Rom(.*)div/g);
	const resLen = results.length;
	let verses = [resLen];
	let scriptures = [resLen];
	for( let i=0; i< resLen; i++) {
		//console.log(results[i]);
		verses[i] = results[i].match(/.+?(?=<)/)[0];
		//scriptures[i] = results
		console.log(verses[i]);
		console.log(results[i]);
	}
	//var element = document.getElementById('myImgElement');
});

/*
let versesParagraph = document.createElement("p");
	let allVerses = "";
  if (!err){
  	let $ = cheerio.load(html);
		$('div.tools').each(function(i, element){
			let a = $(this).text().split('\n');
			a = a[9].split('\t');
			a = a[4];
			a = a.replace('¶', '');
			a = a.replace('[fn]', '');
			a = a.split('-');
			let verse = a[0];
			let passage = '';
			for (let i=1; i<a.length; i++ ) {
				passage += a[i];
			}
			passage = passage.trim();
			let arr = passage.split(' ');
			let tmpStr = '';
			let strLen = 0;
			for (let i=0; i<arr.length; i++) {
				strLen += arr[i].length;
				if (strLen > 27) {
					tmpStr += '\n';
					strLen = arr[i].length;
				}
				tmpStr += arr[i] + ' ';
				strLen += 1;
	    }
      
   		allVerses += '\n' + verse + '\n' + tmpStr + '\n';
    });
    //console.log(allVerses);
    versesParagraph.appendChild(document.createTextNode(allVerses));
    //return versesParagraph;
  }
  */