import {BuilderISO} from './iso.js';

const jsonFile = [
	{
		bitmap: 2,
		name: 'Pan',
		length: '19',
		content: '4213 4211 4214 4210',
		options: 'prefix-length: l-2'
	},
	{
		bitmap: 5,
		name: 'expiryDate',
		length: '10',
		content: '01/25',
		options: 'fill-left: space'
	},
	{
		bitmap: 3,
		name: 'processingCode',
		length: '6',
		content: '18',
		options: 'fill-right: 0, prefix-char: PROC'
	},
	{
		bitmap: 20,
		name: 'amount',
		length: '10',
		content: '1010',
		options: 'fill-left: 0'
	},
	{
		bitmap: 16,
		name: 'location',
		options: 'mask: f-5, prefix-length: l-3',
		length: '10',
		content: [
			{
				bitmap: '1',
				name: 'country',
				options: 'prefix-char: CT',
				length: '15',
				content: 'Romania'
			},
			{
				bitmap: '2',
				name: 'city',
				options: 'prefix-char: CY',
				length: '20',
				content: 'Timisoara'
			}
		]
	},
	{
		bitmap: 64,
		name: 'browserData',
		length: '50',
		content: 'Browser Safari x(64) Pro 1 Device lock',
		options: 'prefix-length: l-4'
	}
];

// Execute the ISO Builder
try {

	const isoMessage = new BuilderISO(jsonFile);
	isoMessage.getMessage();
	
} catch (error) {
	console.log('Error on ISO', error);
}