

const myProxy = 'https://cors-anywhere.herokuapp.com/';
const myURL = 'https://cors-anywhere.herokuapp.com/https://www.blueletterbible.org/nkjv/rom/14/1/';

let book = "rom";
let chapter = "14";
let toSearchFor = '<a href="/nkjv/' + book + '/' + chapter;

fetch(myProxy + myURL).then(function(res) {
	return res.text();  // convert to text
}).then(function(html) {

  ////// Get verses from html:
	let verses = [];  	// array for final extracted verses
	// get results from html, to begin extacting verses, Ex: Rom 14:1
  let resultsForVerses = html.match(/<(.*)>/g);

  // search results for verses
  for( let i=0; i< resultsForVerses.length; i++) {
  	if (resultsForVerses[i].includes(toSearchFor)) {
  		verses.push(resultsForVerses[i].match(/(>).+?(?=<)/)[0].replace('>', ''));
  	}
	}

	for( let i=0; i< verses.length; i++) {
  	console.log(verses[i]);
  }

  ////// Get passages from html:
  let passages = [];  // array for final extracted passages
	// get results from html, for the passages of verses, 
	// Ex: Receive one who is weak in the faith, but not to disputes over doubtful things.
	let resultsForPassages = html.match(/hide-for-tablet"> - <\/span>(.*)(<\/div><\/div>)/g);
	
	for( let i=0; i< resultsForPassages.length; i++) {
		resultsForPassages[i] = resultsForPassages[i].match(/(?<=\/span>)(.*)(?=<\/div><\/div>)/g)[0];
		resultsForPassages[i] = removeBrackets(resultsForPassages[i]);
		resultsForPassages[i] = resultsForPassages[i].replace("&#8220;", '"').replace("&#8221;", '"');
		passages.push(resultsForPassages[i].replace("&#8217;", "'").replace("[fn]", ""));
		console.log(passages[i]);
	}
});

// remove everything inside brackets, including brackets
function removeBrackets(str) {
	let result = "";
	let isInBracket = false   // if in bracket, including bracket
  for (let i=0; i < str.length; i++) {
  	if (str[i] === '<') {
  		isInBracket = true;
  	}
  	else if (str[i] === '>') {
  		isInBracket = false;
  	}
    else if (isInBracket === false) {
    	result +=  str[i];
    }
  }
  return result;
}

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