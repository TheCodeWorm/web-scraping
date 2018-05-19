

/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		}, 
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
			this.todos = util.store('todos-jquery');
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		bindEvents: function () {
			$('.new-todo').on('keyup', this.create.bind(this));
		},
		render: function () {
			var todos = this.getFilteredTodos();
			$('.new-todo').focus();
			util.store('todos-jquery', this.todos);
		}, 
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}
      
			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}
      
			return this.todos;
		}, 
		getIndexFromEl: function (el) {
			var id = $(el).closest('li').data('id');
			var todos = this.todos;
			var i = todos.length;
     
			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}
      //console.log(val);
      let book = "rom";
			let chapter = "14";
			let toSearchFor = '<a href="/nkjv/' + book + '/' + chapter;
			console.log("Results: ", getVerses(toSearchFor));
			this.todos.splice(0,1);

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});

			$input.val('');

			this.render();
		}, 
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				$(e.target).data('abort', true).blur();
			}
		}, 
		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();
			
			if ($el.data('abort')) {
				$el.data('abort', false);
			} else if (!val) {
				this.destroy(e);
				return;
			} else {
				this.todos[this.getIndexFromEl(el)].title = val;
			}

			this.render();
		}
	};

	App.init();
});

const myProxy = 'https://cors-anywhere.herokuapp.com/';
const myURL = 'https://cors-anywhere.herokuapp.com/https://www.blueletterbible.org/nkjv/rom/14/1/';

let getVerses = (toSearchFor) => {
	console.log(fetch(myProxy + myURL).then(function(res) {
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

		/*
		for( let i=0; i< verses.length; i++) {
	  	console.log(verses[i]);
	  }
	  */

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
			//console.log(passages[i]);
		}
	}));

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
