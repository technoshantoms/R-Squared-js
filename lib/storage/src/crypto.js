/**
 * The Revolution Populi Project
 * Copyright (C) 2020 Revolution Populi Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { PassThrough } from 'stream';
import { key, Aes } from '../../ecc';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Encrypt object with subject private key and operator public key
// Return string with serialized representation of nonce and ciphertext
////////////////////////////////////////////////////////////////////////////////////////////////////
function encrypt_object(obj, subject_private_key, operator_public_key) {
    const nonce = key.random32ByteBuffer().toString('base64');
    const cipherbuf = Aes.encrypt_with_checksum(
        subject_private_key, operator_public_key, nonce,
        Buffer.from(JSON.stringify(obj), 'utf-8')
    );
    return `${nonce}:${cipherbuf.toString('base64')}`;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Decrypt string (serialized nonce and ciphertext data) with subject public key and operator private key
// Return original object as before encryption
////////////////////////////////////////////////////////////////////////////////////////////////////
function decrypt_object(str, subject_public_key, operator_private_key) {
    const parts = str.split(':', 2);
    const plainbuf = Aes.decrypt_with_checksum(
        operator_private_key, subject_public_key, parts[0],
        Buffer.from(parts[1], 'base64')
    );
    return JSON.parse(plainbuf.toString('utf-8'));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Encrypt buffer with subject private key and operator public key
// Return buffer (nonce and ciphertext)
////////////////////////////////////////////////////////////////////////////////////////////////////
function encrypt_buffer(buf, subject_private_key, operator_public_key) {
    const noncebuf = key.random32ByteBuffer();
    const cipherbuf = Aes.encrypt_with_checksum(
        subject_private_key, operator_public_key,
        noncebuf.toString('base64'), buf
    );
    return Buffer.concat([ Buffer.from([ noncebuf.length ]), noncebuf, cipherbuf ]);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Decrypt buffer (nonce and ciphertext) with subject public key and operator private key
// Return original buffer as before encryption
////////////////////////////////////////////////////////////////////////////////////////////////////
function decrypt_buffer(buf, subject_public_key, operator_private_key) {
    const noncelen = buf.slice(0, 1)[0];
    const noncebuf = buf.slice(1, 1 + noncelen);
    const cipherbuf = buf.slice(1 + noncelen);
    const plainbuf = Aes.decrypt_with_checksum(
        operator_private_key, subject_public_key,
        noncebuf.toString('base64'), cipherbuf
    );
    return plainbuf;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Content encryption settings
////////////////////////////////////////////////////////////////////////////////////////////////////
const CONTENT_CIPHER_ALGORITHM = 'aes-256-cbc';
const CONTENT_CIPHER_ALGORITHM_KEY_SIZE = 32;
const CONTENT_CIPHER_ALGORITHM_IV_SIZE = 16;
const CONTENT_CIPHER_ALGORITHM_NOENCRYPT = 'noencrypt';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Create content encryption info (algorithm and random key and random IV)
////////////////////////////////////////////////////////////////////////////////////////////////////
function make_content_key() {
    return {
        algo: CONTENT_CIPHER_ALGORITHM,
        key: (CONTENT_CIPHER_ALGORITHM_KEY_SIZE > 0) ?
            randomBytes(CONTENT_CIPHER_ALGORITHM_KEY_SIZE).toString('hex') :
            null,
        iv: (CONTENT_CIPHER_ALGORITHM_IV_SIZE > 0) ?
            randomBytes(CONTENT_CIPHER_ALGORITHM_IV_SIZE).toString('hex') :
            null
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Create content encryption info with no encryption
////////////////////////////////////////////////////////////////////////////////////////////////////
function make_content_key_noencrypt() {
    return {
        algo: CONTENT_CIPHER_ALGORITHM_NOENCRYPT,
        key: null,
        iv: null
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Create content encryption transform stream
////////////////////////////////////////////////////////////////////////////////////////////////////
function make_content_cipher_stream(content_key) {
    if (content_key.algo === CONTENT_CIPHER_ALGORITHM_NOENCRYPT)
        return new PassThrough();
    return createCipheriv(
        content_key.algo,
        Buffer.from(content_key.key, 'hex'),
        content_key.iv ? Buffer.from(content_key.iv, 'hex') : null);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Create content decryption transform stream
////////////////////////////////////////////////////////////////////////////////////////////////////
function make_content_decipher_stream(content_key) {
    if (content_key.algo === CONTENT_CIPHER_ALGORITHM_NOENCRYPT)
        return new PassThrough();
    return createDecipheriv(
        content_key.algo,
        Buffer.from(content_key.key, 'hex'),
        content_key.iv ? Buffer.from(content_key.iv, 'hex') : null);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Transform content buffer using cipher/decipher transform
////////////////////////////////////////////////////////////////////////////////////////////////////
function crypto_content_transform(transform, input) {
    const buf_main = transform.update(input);
    const buf_final = transform.final();
    return Buffer.concat([ buf_main, buf_final ]);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Encrypt content buffer using key
////////////////////////////////////////////////////////////////////////////////////////////////////
function encrypt_content(plain_content_buf, content_key) {
    const cipher = make_content_cipher_stream(content_key);
    return crypto_content_transform(cipher, plain_content_buf);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Decrypt content buffer using key
////////////////////////////////////////////////////////////////////////////////////////////////////
function decrypt_content(cipher_content_buf, content_key) {
    const decipher = make_content_decipher_stream(content_key);
    return crypto_content_transform(decipher, cipher_content_buf);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Encrypt content string using key
////////////////////////////////////////////////////////////////////////////////////////////////////
function encrypt_content_str(plain_content_str, content_key) {
    return encrypt_content(Buffer.from(plain_content_str, 'utf-8'), content_key).toString('base64')
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Decrypt content string using key
////////////////////////////////////////////////////////////////////////////////////////////////////
function decrypt_content_str(cipher_content_str, content_key) {
    return decrypt_content(Buffer.from(cipher_content_str, 'base64'), content_key).toString('utf-8')
}

const _encrypt_object = encrypt_object;
export { _encrypt_object as encrypt_object };
const _decrypt_object = decrypt_object;
export { _decrypt_object as decrypt_object };
const _encrypt_buffer = encrypt_buffer;
export { _encrypt_buffer as encrypt_buffer };
const _decrypt_buffer = decrypt_buffer;
export { _decrypt_buffer as decrypt_buffer };
const _make_content_key = make_content_key;
export { _make_content_key as make_content_key };
const _make_content_key_noencrypt = make_content_key_noencrypt;
export { _make_content_key_noencrypt as make_content_key_noencrypt };
const _make_content_cipher_stream = make_content_cipher_stream;
export { _make_content_cipher_stream as make_content_cipher_stream };
const _make_content_decipher_stream = make_content_decipher_stream;
export { _make_content_decipher_stream as make_content_decipher_stream };
const _crypto_content_transform = crypto_content_transform;
export { _crypto_content_transform as crypto_content_transform };
const _encrypt_content = encrypt_content;
export { _encrypt_content as encrypt_content };
const _decrypt_content = decrypt_content;
export { _decrypt_content as decrypt_content };
const _encrypt_content_str = encrypt_content_str;
export { _encrypt_content_str as encrypt_content_str };
const _decrypt_content_str = decrypt_content_str;
export { _decrypt_content_str as decrypt_content_str };