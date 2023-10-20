import {BuilderISO} from './iso.js';

const jsonFile = [
	{
		bitmap: 2,
		name: 'PAN',
		content: '4123 4123 4123 4123',
		length: '10',
		options: 'prefix-length : l-2'
	},
	
];

// Execute the ISO Builder
try {

	const isoMessage = new BuilderISO(jsonFile);
	isoMessage.getMessage();
	
} catch (error) {
	console.log('Error on ISO', error);
}
