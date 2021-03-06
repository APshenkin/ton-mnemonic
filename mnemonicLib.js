const ffi = require('ffi');
const path = require('path');
const child = require('child_process');

const { platform } = process;
let mnemoniclibLoc = null;

// Hack for electron asar package
const basePath = __dirname.replace('app.asar', 'app.asar.unpacked');

const isMusl = () => {
  const output = child.spawnSync('ldd', ['--version']).stderr.toString('utf8');
  if (output.indexOf('musl') > -1) {
    return true;
  }
  return false;
};

if (platform === 'darwin') {
  mnemoniclibLoc = path.join(basePath, '/lib/libmnemoniclib.dylib');
} else if (platform === 'win32') {
  mnemoniclibLoc = path.join(basePath, '/lib/mnemoniclib.dll');

  // add ./lib to dll directory (for windows we need linked libraries)
  process.env.PATH = process.env.PATH === '' ? path.join(basePath, '/lib') : `${process.env.PATH};${path.join(basePath, '/lib')}`;
} else if (platform === 'linux') {
  if (isMusl()) {
    mnemoniclibLoc = path.join(basePath, '/lib/musl/libmnemoniclib.so');
  } else {
    mnemoniclibLoc = path.join(basePath, '/lib/libmnemoniclib.so');
  }
} else {
  throw new Error('unsupported platform for libmnemonic');
}

const init = () => {
  const callback = ffi.Function('void', ['CString', 'CString']);

  const boolCallback = ffi.Function('void', ['bool', 'CString']);

  return ffi.Library(mnemoniclibLoc, {
    create: ['void', ['CString', callback]],
    getPrivateKey: ['void', ['CString', 'CString', callback]],
    isBasicSeed: ['void', ['CString', boolCallback]],
    isPasswordSeed: ['void', ['CString', boolCallback]],
  });
};

module.exports = init;
