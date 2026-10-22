const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const extensions = [require('./fixtures/treasure-guardian-source-extensions.json'), require('./fixtures/function-forge-source-extensions.json')];

// Preserve historical fingerprints through explicitly reviewed source extensions.
// All other protected files must remain byte-identical.
exports.assertProtectedSource = (file, historicalHash) => {
  const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  let expected = historicalHash;
  for (const stage of extensions) {
    const extension = stage[file];
    if (extension && expected === extension.before) expected = extension.after;
  }
  assert.equal(hash(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')), expected, file);
};
