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
		content: 'Browser Opera x(64) Pro 1 Device Machine',
		options: 'prefix-length: l-4'
	},
	{
		bitmap: 65,
		name: 'merchantDetails',
		length: '50',
		options: 'fill-left: 0',
		content: [
			{
				bitmap: 1,
				name: 'merchantName',
				length: '20',
				content: 'John Doe',
				options: 'fill-left: space'
			},
			{
				bitmap: 2,
				name: 'merchantInsitutionCode',
				length: '6',
				content: '115588',
				options: 'prefix-char: MIC'
			},
			{
				bitmap: 3,
				name: 'merchantPostCode',
				length: '50',
				content: 'HA1 1TU',
				options: 'prefix-char: MPC'
			},
		]
	}
];

// Execute the ISO Builder
try {

	const builderISO	= new BuilderISO(jsonFile);
	const iso8583		= builderISO.getMessage();

	const bitmapStrings	= builderISO.getPrimarySecondaryBM();

	const primaryHEX	= builderISO.createHexPrimarySecondary(bitmapStrings.primary);
	const secondaryHEX	= builderISO.createHexPrimarySecondary(bitmapStrings.secondary);
	
} catch (error) {
	console.log('Error on ISO', error);
}