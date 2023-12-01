class BuilderISO {

	constructor(jsonFile) {
		this.isSecondary = false;
		this.isoMessage = '';
		this.primaryBitMapString = undefined;
		this.secondaryBitMapString = undefined;


		// Arrange the bitmap json in ascending order.
		jsonFile = BuilderISO.arrangeIsoByBM(jsonFile);

		// Iterate over each field and construct the message.
		jsonFile.forEach(field => {
			this.checkIfSecondaryBMExists(field);
			this.isoMessage += new FieldISO(field).getFieldContent();
		});

		let { primaryBitMapString, secondaryBitMapString} = this.createPrimarySecondaryBM(jsonFile);
		this.createHexPrimarySecondary(primaryBitMapString);

		if (primaryBitMapString) {
			this.primaryBitMapString = primaryBitMapString;
		}

		if (secondaryBitMapString) {
			this.secondaryBitMapString = secondaryBitMapString
		}
	}

	static validateFile() {
		// @TO DO
	}

	createPrimarySecondaryBM(jsonFile) {

		let primaryBitMapArray = Array(64).fill(0);
		let secondaryBitMapArray = (this.isSecondary ? Array(64).fill(0) : undefined);

		for (let i = 0; i < jsonFile.length; ++i) {
			let bitmapInt = parseInt(jsonFile[i]['bitmap']);

			if (bitmapInt > 64 && bitmapInt < 129) {
				secondaryBitMapArray[bitmapInt - 65] = 1;
			} else {
				primaryBitMapArray[bitmapInt - 1] = 1;
			}
		}

		primaryBitMapArray[0] = (this.isSecondary ? 1 : 0);

		let primaryBitMapString = (primaryBitMapArray ? primaryBitMapArray.join('') : undefined);
		let secondaryBitMapString = (secondaryBitMapArray ? secondaryBitMapArray.join('') : undefined);

		return {primaryBitMapString , secondaryBitMapString }
	}

	createHexPrimarySecondary(bitmapString) {

		if (!bitmapString)  { return }

		let binaryChunks = [];
		let binaryString = [];

		bitmapString = bitmapString.split('');

		let bitChunk = '';
		let count = 1;

		for (let i = 0, j = 0; i < bitmapString.length + 1; ++i, ++j) {
			if (j < 4) {
				bitChunk += bitmapString[i];
			} else {
				++count;
				binaryChunks.push(bitChunk);
				bitChunk = '';
				bitChunk += bitmapString[i];
				j = 0;
			}
		}


		binaryChunks.forEach(chunk => {
			let decimal = parseInt(chunk, 2);
				decimal = decimal.toString(16);

				binaryString.push(decimal);
		});

		
		binaryString = binaryString.join('');

		return binaryString;
	}

	static arrangeIsoByBM(jsonFile) {

		let swapped;

		do {
			swapped = false;
			for (let i = 0; i < jsonFile.length - 1; ++i) {
				if (jsonFile[i]['bitmap'] > jsonFile[i + 1]['bitmap']) {
					const temporary = jsonFile[i];
					jsonFile[i] = jsonFile[i + 1];
					jsonFile[i + 1] = temporary;
					swapped = true;
				}
			}
			
		} while (swapped);

		return jsonFile;
	}

	checkIfSecondaryBMExists(field) {
		if (parseInt(field['bitmap']) > 64) {
			this.isSecondary = true;
		}
	}

	getMessage() {
		return this.isoMessage;
	}

	getPrimarySecondaryBM() {
		return {
			primary : this.primaryBitMapString, 
			secondary: this.secondaryBitMapString
		};
	}

}


class FieldISO {

	constructor(field) {
		this.fieldContent = '';

		this.bitmap		= (field['bitmap'] ? field['bitmap'] : undefined);
		this.name		= (field['name'] ? field['name'] : undefined);
		this.content	= (field['content'] ? field['content'] : undefined);
		this.length		= (field['length'] ? field['length'] : undefined);
		this.options	= (field['options'] ? field['options'] : undefined);

		this.processField();
	}

	processField() {
		if (Array.isArray(this.content)) {

			let temporary = '';

			this.content.forEach(field => {
				let fieldInstance = new FieldISO(field).getFieldContent();
				temporary += fieldInstance;
			});

			this.captureFieldContent(temporary);
		} else {
			this.captureFieldContent(this.content);
		}
	}

	captureFieldContent(content) {

		if (this.options) {
			content = new Options(this.options, content, this.length).getApplyedOptions();
		}

		this.fieldContent += content;
	}

	getFieldContent() {
		return this.fieldContent;
	}

}


class Options {

	constructor(options, content, length) {

		this.options = options.split(',');
		this.content = Options.removeWhiteSpaces(content);
		this.length = length;

		this.processAndApply();
	}

	processAndApply() {
		this.options.forEach(option => {

			option = Options.removeWhiteSpaces(option);

			let [name, value] = option.split(':');

			switch (name) {
				case 'mask':
					this.mask(value);
					break;

				case 'fill-left':
					this.fillLeft(value);
					break;

				case 'fill-right':
					this.fillRight(value);
					break;

				case 'prefix-length':
					this.prefixLength(value);
					break;

				case 'prefix-char':
					this.prefixChar(value);
					break;

				default:
					throw new Error(`There is no such option ${option}`);
					break;
			}
			
		});
	}

	// Each option has it's own function declared below.

	prefixLength(value) {
		if (value) {
			let [valueName, valueNumber] = value.split('-');

			if (valueName !== 'l') {
				throw new Error('prefix-length option must contain `l-{value}` as variable length');
			} 

			let lengthArray = Array(parseInt(valueNumber)).fill(0);

			let contentLength = `${this.content.length}`;
				contentLength = contentLength.split('');

			for (let i = contentLength.length - 1, j = lengthArray.length - 1; i > -1; --i, --j) {
				lengthArray[j] = contentLength[i];
			}

			lengthArray = lengthArray.join('');

			this.content = lengthArray + this.content;

		} else {
			this.content = this.content.length + this.content;
		}
	}

	prefixChar(value) {
		if (!value) {
			throw new Error('prefix-char option doesn\'t contain a character to prefix.');
		}

		this.content = value + this.content;
	}

	fillLeft(value) {
		if (!this.length) {
			throw new Error('fill-left option must contain the length of the field.');
		} else if (!value) {
			throw new Error('fill-left option must contain a character.');
		} else if (this.length <= this.content.length) {
			throw new Error('fill-left option field\'s length is shorter then length of content.');
		}

		if (value === 'space') {
			let filler = Array(this.length - this.content.length).fill('*');
				filler = filler.join('');
				filler = filler.replace(/\*/g, ' ');

			this.content = filler + this.content;

		} else {
			let filler = Array(this.length - this.content.length).fill(value);
			filler = filler.join('');

			this.content = filler + this.content;
		}
	}

	fillRight(value) {
		if (!this.length) {
			throw new Error('fill-right option must contain the length of the field.');
		} else if (!value) {
			throw new Error('fill-right option must contain a character.');
		} else if (this.length <= this.content.length) {
			throw new Error('fill-right option field\'s length is shorter then length of content.');
		}

		if (value === 'space') {
			let filler = Array(this.length - this.content.length).fill('*');
				filler = filler.join('');
				filler = filler.replace(/\*/g, ' ');

			this.content = this.content + filler;

		} else {
			let filler = Array(this.length - this.content.length).fill(value);
			filler = filler.join('');

			this.content = this.content + filler;
		}
	}

	mask(value) {
		let temporary		= this.content.split('');
		let temporaryLength	= temporary.length;

		if (!value) {
			for (let i = 0; i < temporary.length; ++i) {
				temporary[i] = '*';
			}

			this.content = temporary.join('');
			return;
		}

		// positionToMask can be :
		// 'f' === 'first'
		// 'l' === 'last'
		// 'ft' === 'fromTo'
		let [positionToMask, numberOfCharacters, characterEnding] = value.split('-');

		if (positionToMask === 'f') {
			numberOfCharacters = parseInt(numberOfCharacters);

			if (numberOfCharacters > temporaryLength) {
				throw new Error('Value of position to mask is greater then content length.');
			}

			for (let i = 0; i < numberOfCharacters; ++i) {
				temporary[i] = '*';
			}

			this.content = temporary.join('');
			return;
		}

		if (positionToMask === 'l') {
			numberOfCharacters	= parseInt(numberOfCharacters);

			if (numberOfCharacters > temporaryLength) {
				throw new Error('Value of position to mask is greater then content length.');
			}

			for (let i = temporaryLength - 1, j = 0; j < numberOfCharacters; --i, ++j) {
				temporary[i] = '*';
			}

			this.content = temporary.join('');
			return;
		}

		if (positionToMask === 'ft') {
			numberOfCharacters	= parseInt(numberOfCharacters);
			characterEnding		= parseInt(characterEnding);

			if (numberOfCharacters - 1 < 0) {
				throw new Error('Can not start to mask from a position less then 1');
			} else if (numberOfCharacters > temporaryLength) {
				throw new Error('Value of position to start mask is greater then content length.');
			} else if (characterEnding > temporaryLength) {
				throw new Error('Value of position to end mask is greater then content length.');
			} else if (numberOfCharacters > characterEnding) {
				throw new Error('Value of position to start mask is greater then position to end mask.');
			}

			for (let i = numberOfCharacters - 1; i < characterEnding; ++i) {
				temporary[i] = '*';
			}

			this.content = temporary.join('');
			return;
		}
	}

	static removeWhiteSpaces(value) {
		value = value.replace(/\s/g, '');
		return value;
	}

	getApplyedOptions() {
		return this.content;
	}
}


export {
	Options,
	BuilderISO
}