
const models = require('./model');
const path = require('path');
const fs = require('fs');
const sequelize = require('sequelize');

const headers = ['Field', 'PK', 'Type', 'Allow Null', 'Default Value', 'Comment'];

function formatValue(val) {
	if (val === undefined || val === null) {
		return ''
	}

	return val;
}

let modelPath = path.join(__dirname, './model');
let fileList = fs.readdirSync(modelPath);
//logger.debug(fileList);
let modelDict = {};
let modelOptions = {};
let seque = {
	define(name, attributes, options) {
		options = options || {};
		modelOptions[name] = options;
		modelDict[name] = [];
		for (let key in attributes) {
			let obj = attributes[key];
			if (typeof obj.defaultValue === 'function') {
				obj.defaultValue = obj.defaultValue.name;
			}
			modelDict[name].push([key, obj.primaryKey || '',
				(obj.type && obj.type.key),
				(!!obj.allowNull || false) + '',
				formatValue(obj.defaultValue),
				obj.comment || ''])
		}
	},
};

fileList.forEach(function (fileName) {
	if (fileName !== 'index.js' && fileName.indexOf('.js') !== -1) {
		let fn = require(path.join(modelPath, fileName));
		fn(seque, sequelize);
	}
});

// start with header

console.log('# DB Doc')

for (let key in modelDict) {
	console.log(`## ${key} \n`);
	let tableComment = modelOptions[key].comment || '';
	console.log(`**${tableComment}** \n`)

	let line = '|';
	for (let header of headers) {
		line += header + '|';
	}
	console.log(line);

	line = '|';
	for (let header of headers) {
		line += ':--' + '|';
	}
	console.log(line);

	for (let arr of modelDict[key]) {
		line = '|';
		for (let item of arr) {
			line += item + '|';
		}
		console.log(line)
	}
	console.log(' \n')
}
