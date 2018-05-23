

jQuery(function ($) {
	'use strict';

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {

		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {
			this.verses = util.store('verses-jquery');
			this.bindEvents();
		},
		bindEvents: function () {
			$('.new-verses').on('keyup', this.create.bind(this));
		},
		render: function () {
			$('.new-verses').focus();
			util.store('verses-jquery', this.verses);
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.verses = this.verses.splice(0, 0);
			let searchFor = val.split(" ");

			// for book of jude
			if (searchFor[0] === "jud" || searchFor[0] === "jude") {
				searchFor[0] = "jde";
			}
			// for book of ruth
			else if (searchFor[0] === "rut" || searchFor[0] === "ruth") {
				searchFor[0] = "rth";
			}
			// for song of solomon
			else if (searchFor[0] === "son" || searchFor[0] === "song") {
				searchFor[0] = "sng";
			}
			// for book of john
			else if (searchFor[0] === "joh" || searchFor[0] === "john") {
				searchFor[0] = "jhn";
			}
			// distinguish between philippians and philemon
			else if (searchFor[0] === "phi" || searchFor[0] === "phil" 
				|| searchFor[0] === "phili" || searchFor[0] === "philip") {

				let result = prompt("Please choose: 1 or 2\n1 - philippians \n2 - philemon");
			  if (result === "1")
			  	searchFor[0] = "phl";
			  else if (result === "2") {
			  	searchFor[0] = "phm";
			  }
			}

			// if there is no chapter given, default to chapter 1
			if (searchFor.length === 1) {
				searchFor.push("1");
			}
      
      // fetch verses and set them
			setPassageLines(searchFor[0], searchFor[1]);

			this.verses.push({
				chapter: searchFor[0], 
        book: searchFor[1]
			});

			// reset
			$input.val('');

			this.render();
		}
	};

	App.init();
});

// Function to fetches verses and creates paragraphs 
function setPassageLines(book, chapter) {  // verse, passage... Ex: rom 14
	const myProxy = 'https://cors-anywhere.herokuapp.com/';
  const myURL = 'https://www.blueletterbible.org/nkjv/' + book + '/' + chapter;

	fetch(myProxy + myURL).then(function(res) {
		return res.text();  // convert to text
	}).then(function(html) {

	  ////// Get verses from html:
		let verses = [];  	// array for final extracted verses
		// get results from html, to begin extacting verses, Ex: Rom 14:1
	  let resultsForVerses = html.match(/<(.*)>/g);

	  // search results for verses
	  let toSearchFor = '<a href="/nkjv/' + book + '/' + chapter;
	  for( let i=0; i< resultsForVerses.length; i++) {
	  	if (resultsForVerses[i].includes(toSearchFor)) {
	  		verses.push(resultsForVerses[i].match(/(>).+?(?=<)/)[0].replace('>', ''));
	  	}
		}

	  ////// Get passages from html:
	  let passages = [];  // array for final extracted passages
		// get results from html, for the passages of verses, 
		// Ex: Receive one who is weak in the faith, but not to disputes over doubtful things.
		let resultsForPassages = html.match(/hide-for-tablet"> - <\/span>(.*)(<\/div><\/div>)/g);
		
		// parse to get passages
		for( let i=0; i< resultsForPassages.length; i++) {
			resultsForPassages[i] = resultsForPassages[i].match(/(?<=\/span>)(.*)(?=<\/div><\/div>)/g)[0];
			resultsForPassages[i] = removeBrackets(resultsForPassages[i]);
			resultsForPassages[i] = resultsForPassages[i].replace("&#8220;", '"').replace("&#8221;", '"').replace("&#8216;", '');
			passages.push(resultsForPassages[i].replace("&#8217;", "'").replace("[fn]", "").replace("&#8201;", ""));
		}

		// get passage-lines to hold paragraph children for passages
		var passageLines = document.getElementById("passage-lines");

		// if there is a prev passage paragraphs, remove them
		while (passageLines.firstChild) {
      passageLines.removeChild(passageLines.firstChild);
    }
		
		// set paragraphs 
		for (let i=0; i < verses.length; i++) {
			
			// create a new paragraph
			var p = document.createElement("p");
			// new text with verse
			var t = document.createTextNode(verses[i]);
			p.appendChild(t);
			passageLines = document.getElementById("passage-lines");
			passageLines.appendChild(p);

			// new paragraph 
			var p = document.createElement("p");
			// new text node for passages
			var t = document.createTextNode(passages[i]);
			p.appendChild(t);
			passageLines = document.getElementById("passage-lines");
			passageLines.appendChild(p);
		}
		
		// clear placeholder 
		document.getElementById("myInput1").placeholder = "";
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
}
