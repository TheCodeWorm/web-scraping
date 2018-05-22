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
			/*jshint bitwise:false */
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
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
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
			this.todoTemplate = Handlebars.compile($('#verses-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		bindEvents: function () {
			$('.new-verses').on('keyup', this.create.bind(this));
			$('.toggle-all').on('change', this.toggleAll.bind(this));
		},
		render: function () {
			var todos = this.getFilteredTodos();
			$('.todo-list').html(this.todoTemplate(todos));
			$('.main').toggle(todos.length > 0);
			$('.new-verses').focus();
			util.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('.footer').toggle(todoCount > 0).html(template);
		},
		toggleAll: function (e) {
			var isChecked = $(e.target).prop('checked');

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});

			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
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
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
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

			this.todos = this.todos.splice(0, 0);
			let searchFor = val.split(" ");
			setPassageLines(searchFor[0], searchFor[1]);

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});

			$input.val('');

			this.render();
		},
		toggle: function (e) {
			var i = this.getIndexFromEl(e.target);
			this.todos[i].completed = !this.todos[i].completed;
			this.render();
		},
		editingMode: function (e) {
			var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			// puts caret at end of input
			var tmpStr = $input.val();
			$input.val('');
			$input.val(tmpStr);
			$input.focus();
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
		},
		destroy: function (e) {
			this.todos.splice(this.getIndexFromEl(e.target), 1);
			this.render();
		}
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
