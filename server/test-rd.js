// Standalone Reality Defender SDK probe — prints the FULL error so we can see
// what "Unknown error" actually is. Run: node test-rd.js <file>
import 'dotenv/config';
import { RealityDefender } from '@realitydefender/realitydefender';

const file = process.argv[2] || 'test-face.jpg';
const apiKey = process.env.RD_API_KEY;
console.log('key present:', !!apiKey, 'len:', apiKey?.length);
console.log('file:', file);

const rd = new RealityDefender({ apiKey });

try {
  // Try the two-step path so we can see where it fails (upload vs result).
  console.log('--- uploading...');
  const up = await rd.upload({ filePath: file });
  console.log('upload OK:', JSON.stringify(up));
  console.log('--- getting result...');
  const result = await rd.getResult(up.requestId);
  console.log('RESULT:', JSON.stringify(result, null, 2));
} catch (err) {
  console.log('--- ERROR caught ---');
  console.log('message:', err?.message);
  console.log('name:', err?.name);
  console.log('code:', err?.code);
  console.log('status:', err?.status || err?.statusCode);
  console.log('response:', JSON.stringify(err?.response?.data || err?.response || null));
  console.log('keys:', Object.keys(err || {}));
  console.log('full:', JSON.stringify(err, Object.getOwnPropertyNames(err || {})));
}
