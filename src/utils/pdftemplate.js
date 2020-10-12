"use strict";

let fs = require('fs');

function generate(qrUrl, userName) {
	
	return {
	
	// used fonts
	fonts : {
		Walsheim: {
			normal : __dirname + '/../static/fonts/GT-Walsheim-Regular.ttf',
			bold :  __dirname + '/../static/fonts/GT-Walsheim-Bold.ttf'
		}
	},
	
	docDefinition : {
		  // a string or { width: number, height: number }
		  pageSize: 'A4',

		  // by default we use portrait, you can change it to landscape if you wish
		  pageOrientation: 'portrait',

		  // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
		  pageMargins: [ 40, 20, 40, 60 ],			
			
			background : [
				{	image : __dirname + '/../static/img/pdf-background.png', width: 599 }
			],

		  info: {
			title: 'Check-in met QR code',
			author: 'Present - by Schluss',
			subject: '',
			keywords: '',
		  },			
					
		  content: [
		  
			// logo image
			{
				svg:  fs.readFileSync(__dirname + '/../static/img/logo.svg', 'utf8'),
				alignment : 'center',
				width : 75
			},	

			// title
			{ text: '\nLaat weten dat je er bent', bold: true, fontSize: 30, alignment : 'center' },

			// text
			{ text: '\nDeel je gegevens voor een mogelijk bron\n en contactonderzoek door de GGD\n\n\n\n', fontSize: 15, color : '#666666', alignment : 'center', height: 200 },
			
			// marker 
			{ svg:  fs.readFileSync(__dirname + '/../static/img/marker.svg', 'utf8'), width : 15, alignment : 'center' },
			
			// organization name
			{
				width: '50%',
				text : userName,
				bold: true, 
				fontSize: 20, 
				alignment : 'center'
			},
						
			// spacer
			{ text : '\n\n'},			

			// check items
			{			  
				columns : [
				
					{ text : '', width: '22%' },
					
					{
						width: '8%',
						svg:  fs.readFileSync(__dirname + '/../static/img/check.svg', 'utf8'),
						width : 18,
					},

					{ text : '', width: '1%' },					
					
					{
						width : '20%',
						text: 'Anoniem', fontSize: 15
					},
					
					{
						width: '8%',
						svg:  fs.readFileSync(__dirname + '/../static/img/check.svg', 'utf8'),
						width : 18
					},	

					{ text : '', width: '1%' },						
					
					{
						width : '*',
						text: 'Niet verplicht, wel lief', fontSize: 15
					}			
				
				]
				
			},
			
			// spacer
			{ text : '\n',
				fontSize: 10 
			},
			
			{			  
				columns : [
				
					{ text : '', width: '22%' },
					
					{
						svg:  fs.readFileSync(__dirname + '/../static/img/check.svg', 'utf8'),
						width : 18
					},	

					{ text : '', width: '1%' },						
					
					{
						width : '20%',
						text: 'Veilig', fontSize: 15
					},
					
					{
						svg:  fs.readFileSync(__dirname + '/../static/img/check.svg', 'utf8'),
						width : 18
					},	

					{ text : '', width: '1%' },						
					
					{
						width : '*',
						text: 'Na 14 dagen vernietigd', fontSize: 15
					}				
				
				]
				
			},	

			{ text: '\n', fontSize: 20 },

			// qr code
			{ qr: qrUrl, eccLevel : 'M', fit : 200, alignment: 'center' },
		  
			// spacer
			{ text : '\n\n\n\n\n\n\n\n\n' },
		  
		  
			// powered and secured by
			{
				columns : [
			  
					{ text : '', width: '35%' },
					
					{
						svg:  fs.readFileSync(__dirname + '/../static/img/lock.svg', 'utf8'),
						width : 10
					},
					
					{ text : '', width: '1%' },					
					
					{
						text : 'secured and powered by',
						color : '#7e879c',
						width: '18%',
						fontSize: 8
					},	

					{
						svg:  fs.readFileSync(__dirname + '/../static/img/schluss-logo.svg', 'utf8'),
						width : 55
					}					
			  
				] 
		  }
		  
		  ],

  			defaultStyle: {
				font: 'Walsheim'
			}
	},
	
	options : {
		
	}
	
	}

}

module.exports = generate;