import fs from 'fs';
import crypto from 'crypto';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
  const body = await request.json();
  console.log('body', body);
  const file = body.file.toString();
  const key = crypto.scryptSync(body.key.toString(), '', 32, { N: 16384, r: 8, p: 1 });
  const iv = Buffer.alloc(16, 0);
  console.log('key', key);
  console.log('iv', iv);
  const input = fs.createReadStream(file, { highWaterMark: 4096 });
  const output = fs.createWriteStream(file + '.enc');
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  input.on('data', (chunk) => {
    const encryptedChunk = cipher.update(chunk);
    output.write(encryptedChunk);
  });
  input.on('end', () => {
    const finalEncryptedChunk = cipher.final();
    output.write(finalEncryptedChunk, () => {
      output.end(() => {
        console.log('done');
        const checkSum = fs.createReadStream(file + '.enc')
          .pipe(crypto.createHash('md5'))
          .digest('hex');
        console.log('checkSum', checkSum);
        return new Response(JSON.stringify({
          message: 'success',
          encryptedName: file + '.enc',
          output: checkSum,
        }), {
          status: 200,
        });
      });
    });
  });
  return new Response(JSON.stringify({
    message: 'success',
    encryptedName: file + '.enc',
    }), {
        status: 200,
    });
    
}) satisfies RequestHandler;

const generateChecksum = (file:any) => {
    return crypto.createHash('md5').update(file).digest('hex');
};
