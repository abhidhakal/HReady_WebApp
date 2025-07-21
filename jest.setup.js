const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { VITE_API_BASE_URL: '' } } },
  configurable: true,
}); 