const fs = require('fs');
const path = require('path');
const assert = require('power-assert');

const extractor = require('../lib');

describe('parse', () => {
  it('normal', () => {
    const apiInfo = extractor.extract(path.resolve(__dirname, '../example'));
    const apiStr = JSON.stringify(apiInfo, null, 2);
    assert(fs.readFileSync(path.join(__dirname, '../example/api.json'), 'utf8') === apiStr);
  });
  it('extends', () => {
    const apiInfo = extractor.extract(__dirname, {
      fileErrorHandler: (e) => {
        console.error(e);
      }
    });
    assert('prefix' in apiInfo.props);
    assert('hint' in apiInfo.props);
    assert('getValueLength' in apiInfo.props);
    assert(apiInfo.props.value.description === '当前值');
    assert(apiInfo.props.getValueLength.device.value === 'PC');
    assert(apiInfo.props.getValueLength.version.value === '1.2.0+');
    assert(apiInfo.props.hint.description === '水印 Icon');
  });
});
