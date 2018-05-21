
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
			var val = $input.val().trim().toLowerCase();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			let searchFor = val.split(" ");
			setPassageLines(searchFor[0], searchFor[1]);

			this.verses = val;

			$input.val('');

			this.render();
		}, 
	};

	App.init();
});

//
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
		
		for( let i=0; i< resultsForPassages.length; i++) {
			resultsForPassages[i] = resultsForPassages[i].match(/(?<=\/span>)(.*)(?=<\/div><\/div>)/g)[0];
			resultsForPassages[i] = removeBrackets(resultsForPassages[i]);
			resultsForPassages[i] = resultsForPassages[i].replace("&#8220;", '"').replace("&#8221;", '"').replace("&#8216;", '');
			passages.push(resultsForPassages[i].replace("&#8217;", "'").replace("[fn]", "").replace("&#8201;", ''));
		}

		var passageLines = document.getElementById("passage-lines");

		while (passageLines.firstChild) {
      passageLines.removeChild(passageLines.firstChild);
    }
		
		for (let i=0; i < verses.length; i++) {
			
			var p = document.createElement("p");
			var t = document.createTextNode(verses[i]);
			p.appendChild(t);
			passageLines = document.getElementById("passage-lines");
			passageLines.appendChild(p);

			var p = document.createElement("p");
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
