const ffi = require('ffi');
const path = require('path');

const { platform } = process;
let mnemoniclibLoc = null;

if (platform === 'darwin') {
  mnemoniclibLoc = path.join(__dirname, '/lib/libmnemoniclib.dylib');
} else if (platform === 'win32') {
  mnemoniclibLoc = path.join(__dirname, '/lib/mnemoniclib.dll');

  // add /lib to dll directory (for windows we need linked libraries)
  const kernel32 = ffi.Library('kernel32', {
    SetDllDirectoryA: ['bool', ['string']],
  });
  kernel32.SetDllDirectoryA(path.join(__dirname, '/lib'));
} else if (platform === 'linux') {
  mnemoniclibLoc = path.join(__dirname, '/lib/libmnemoniclib.so');
} else {
  throw new Error('unsupported platform for libmnemonic');
}

const callback = ffi.Function('void', ['CString', 'CString']);

const boolCallback = ffi.Function('void', ['bool', 'CString']);

const mnemonicLib = ffi.Library(mnemoniclibLoc, {
  create: ['void', ['CString', callback]],
  getPrivateKey: ['void', ['CString', 'CString', callback]],
  isBasicSeed: ['void', ['CString', boolCallback]],
  isPasswordSeed: ['void', ['CString', boolCallback]],
});

module.exports = mnemonicLib;