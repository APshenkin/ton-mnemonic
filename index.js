const EdDSA = require('elliptic').eddsa;

const base64url = require('base64url');

const ec = new EdDSA('ed25519');
const crc16 = require('crc16');
const initMnemonic = require('./mnemonicLib');

class Mnemonic {
  constructor({ lazyLoad = false } = {}) {
    if (!lazyLoad) {
      this._initLib();
    }

    this.lib = () => {
      this._initLib();

      return this.mnemonicLib;
    };
  }

  _initLib() {
    if (typeof this.mnemonicLib === 'undefined') {
      this.mnemonicLib = initMnemonic();
    }
  }

  createMnemonic(mnemonicPassword = '') {
    return new Promise((resolve, reject) => {
      this.lib().create(mnemonicPassword, (res, err) => {
        if (err == null) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  getKeypairFromMnemonic(mnemonic, mnemonicPassword = '') {
    let promise;

    if (mnemonicPassword === '') {
      promise = this.isBasicSeed(mnemonic);
    } else {
      promise = this.isPasswordSeed(mnemonic);
    }

    return promise.then((res) => {
      if (!res) {
        throw new Error('invalid mnemonic');
      }

      return new Promise((resolve, reject) => {
        this.lib().getPrivateKey(mnemonic, mnemonicPassword, (res, err) => {
          if (err == null) {
            resolve(ec.keyFromSecret(res));
          } else {
            reject(err);
          }
        });
      });
    });
  }

  isBasicSeed(mnemonic) {
    return new Promise((resolve, reject) => {
      this.lib().isBasicSeed(mnemonic, (res, err) => {
        if (err == null) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  isPasswordSeed(mnemonic) {
    return new Promise((resolve, reject) => {
      this.lib().isPasswordSeed(mnemonic, (res, err) => {
        if (err == null) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  }

  getPublicKeyInTonFormat(publicKey) {
    const payload = Buffer.alloc(34);

    payload.fill(0x3E, 0, 1);
    payload.fill(0xE6, 1, 2);
    payload.fill(Buffer.from(publicKey, 'hex'), 2);

    const crc = crc16(payload);

    return base64url(Buffer.concat([payload, Buffer.from(crc.toString(16).padStart(4, '0'), 'hex')]));
  }
}

module.exports = Mnemonic;
