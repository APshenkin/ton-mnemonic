const assert = require('assert');

const Mnemonic = require('../index');

const mnemonic = new Mnemonic({lazyLoad: true});

describe('address', () => {
  it('should create mnemonic', async () => {
    const res = await mnemonic.createMnemonic();

    assert.equal(typeof res, 'string');
  });

  it('should return ec pair from mnemonic', async () => {
    const res = await mnemonic.getKeypairFromMnemonic('profit chief ask coral kid focus marble apple angry lumber shadow target claim slogan grocery arm village avoid nuclear public ugly glow advance sugar');

    assert.equal(res.getSecret('hex'), '56906a59408c5d117d39d9a9b000416f19e21f14426ece092fd00841b90f7568');
    assert.equal(res.getPublic('hex'), '2a355e071a103f09f3236f191cddb99f4a2ef9dce169e516566e470a6cbf8550');
  });

  it('should return error if get keypair withoit password', async () => {
    const res = await mnemonic.createMnemonic('testme');

    try {
      await mnemonic.getKeypairFromMnemonic(res);
    } catch (e) {
      assert.equal(e.message, 'invalid mnemonic');
    }
  });

  it('should return error if get keypair with password', async () => {
    const res = await mnemonic.createMnemonic();

    try {
      await mnemonic.getKeypairFromMnemonic(res, 'testme');
    } catch (e) {
      assert.equal(e.message, 'invalid mnemonic');
    }
  });

  it('should return public key in ton format', async () => {
    const res = mnemonic.getPublicKeyInTonFormat('2a355e071a103f09f3236f191cddb99f4a2ef9dce169e516566e470a6cbf8550');

    assert.equal(res, 'PuYqNV4HGhA_CfMjbxkc3bmfSi753OFp5RZWbkcKbL-FUIGI');
  });
});
