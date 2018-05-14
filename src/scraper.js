// Noel Caceres
// a script to web scrape and format bible verses 
import React, { Component } from 'react';
//import ReactDOM from 'react-dom';
//import './scraper.css';
//import App from './App';

class Scraper extends Component {
  render() {
    return (
      <div>
        <p>
          testing Scraper
        </p>
      </div>
    );
  }
}

export default Scraper;


let request = require('request');
let cheerio = require('cheerio');

let myUrl = 'https://www.blueletterbible.org/nkjv/rom/14';

let myreq = request(myUrl, function(err, resp, html) {
	let arr = [];
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
   		passage = '\n' + verse + '\n' + tmpStr;
			console.log(passage);
			arr.push(passage);
    });
  }
  return arr;
});
