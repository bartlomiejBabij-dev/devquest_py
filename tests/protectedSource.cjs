const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const extensions = require('./fixtures/treasure-guardian-source-extensions.json');

// Preserve historical fingerprints while explicitly pinning the three reviewed
// boss-integration extensions. All other protected files must remain byte-identical.
exports.assertProtectedSource = (file, historicalHash) => {
  const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const extension = extensions[file];
  if (extension) assert.equal(historicalHash, extension.before, `${file}: historical baseline`);
  assert.equal(hash(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')), extension?.after ?? historicalHash, file);
};
