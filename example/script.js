'use strict';

const fs = require('fs');
const path = require('path');
const extractor = require('../lib');

const apiInfo = extractor.extract(__dirname);
const apiStr = JSON.stringify(apiInfo, null, 2);
fs.writeFileSync(path.join(__dirname, 'api.json'), apiStr);
console.log('Extract api information successfully!');
