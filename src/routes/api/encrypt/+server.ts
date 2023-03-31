import fs from 'fs';
import crypto from 'crypto';
import type { RequestHandler } from './$types';
export const POST = (async ({ request }) => {
    const body = await request.json();
    console.log('body', body);
    const file = body.file.toString();
    const key = crypto.scryptSync(body.key, 'salt', 32);
    const iv = Buffer.alloc(16, 0);
    var input = fs.createReadStream(file);
    var output = fs.createWriteStream(file + '.enc');
    input.pipe(crypto.createCipheriv('aes-256-cbc', key, iv)).pipe(output);
    output.on('finish', () => {
        console.log('done');
    }
    );
    var checkSum = generateChecksum(file);

    return new Response(JSON.stringify({
        message: 'success',
        encryptedName: file + '.enc',
        output: checkSum,
    }), {
        status: 200,
    });
}) satisfies RequestHandler;

const generateChecksum = (file:any) => {
    return crypto.createHash('md5').update(file).digest('hex');
};
