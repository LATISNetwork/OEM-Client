from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import os
import hashlib
import sys
import argparse

def compute_checksum(file_path, checksum_file_path):
    # Create a SHA-256 hash object
    hasher = hashlib.sha256()

    # Open the file in binary mode and read it in chunks
    with open(file_path, 'rb') as file:
        while True:
            chunk = file.read(1024 * 1024)  # Read 1 MB at a time
            if not chunk:
                break
            hasher.update(chunk)  # Update the hash object with the chunk
    with open(checksum_file_path, 'w') as checksum_file:
        checksum_file.write(hasher.hexdigest())
    # Return the hexadecimal representation of the hash
    return hasher.hexdigest()

def encrypt_file_AES_CBC(key, input_file_path, output_file_path):
    # Generate random IV
    iv = os.urandom(16)

    # Create AES-CBC cipher object
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv),
                    backend=default_backend())

    # Read input file contents
    with open(input_file_path, 'rb') as input_file:
        input_data = input_file.read()

    # Apply padding to input data
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded_data = padder.update(input_data) + padder.finalize()

    # Encrypt data using AES-CBC
    encryptor = cipher.encryptor()
    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
    # print(encrypted_data)
    # Write encrypted data to output file
    with open(output_file_path, 'wb') as output_file:
        output_file.write(iv + encrypted_data)
    output_file.close()

def decrypt_file_AES_CBC(key, input_file_path, output_file_path):
    # Read input file contents
    with open(input_file_path, 'rb') as input_file:
        input_data = input_file.read()

    # Extract IV and encrypted data
    iv = input_data[:16]
    encrypted_data = input_data[16:]

    # Create AES-CBC cipher object
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv),
                    backend=default_backend())

    # Decrypt data using AES-CBC
    decryptor = cipher.decryptor()
    decrypted_padded_data = decryptor.update(
        encrypted_data) + decryptor.finalize()

    # Remove padding from decrypted data
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    decrypted_data = unpadder.update(
        decrypted_padded_data) + unpadder.finalize()
    print(decrypted_data)
    # Write decrypted data to output file
    with open(output_file_path, 'wb') as output_file:
        output_file.write(decrypted_data)
    output_file.close()

if "__main__" == __name__:
    print('start')
    p = argparse.ArgumentParser()
    p.add_argument('-k', '--key', help='key in hex')
    p.add_argument('-i', '--input', help='input file path')
    p.add_argument('-o', '--output', help='output file path')
    p.add_argument('-m', '--mode', help='mode: encrypt or decrypt')
    p.add_argument('-c', '--checksum', help='checksum file path')
    # p.add_argument('-v', '--iv', help='iv')
    p.add_argument('-s', '--salt', help='salt')

    arg = p.parse_args()

    key = bytes.fromhex(arg.key)
    salt = bytes.fromhex(arg.salt)
    key = key + salt
    input_file_path = arg.input
    encrypt_file_path = arg.output
    decrypt_file_path = arg.output
    checksum_file_path = arg.checksum

    if arg.mode == 'encrypt':
        print('encrypt')
        encrypt_file_AES_CBC(key, input_file_path, encrypt_file_path)
        compute_checksum(encrypt_file_path, checksum_file_path)
    else:
        print('decrypt')
        decrypt_file_AES_CBC(key, input_file_path, decrypt_file_path)
        compute_checksum(encrypt_file_path, checksum_file_path)
    print('done')