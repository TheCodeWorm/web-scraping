// Noel Caceres
// a script to web scrape and format bible verses 
import React, { Component } from 'react';
//import ReactDOM from 'react-dom';
//import './scraper.css';
//import App from './App';

const request = require('request');
const cheerio = require('cheerio');
const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
const myUrl = 'https://www.blueletterbible.org/nkjv/rom/14';

function scraper() {
	let versesParagraph = document.createElement("p");
	request(proxyUrl + myUrl, function(err, resp, html) {
		let allVerses = ""
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
	  }
	})
}

class Scraper extends Component {
  render() {
    return (
      <div>
        <p>
          testing {("results: " + console.log())}
        </p>
      </div>
    );
  }
}

export default Scraper;
