/**
 * Client-side zero-knowledge encryption for TravelVault.
 *
 * Three-layer key hierarchy:
 * 1. Master Key — derived from user passphrase via PBKDF2 (AES-256-GCM)
 * 2. Per-Document Key — random AES-256-GCM key, wrapped with master key
 * 3. RSA-OAEP Key Pair — for sharing document keys with other users
 *
 * The server NEVER sees plaintext documents or the master key.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

// Helper: cast Uint8Array for Web Crypto API compatibility with strict TS
function buf(data: Uint8Array | ArrayBuffer): any {
  return data;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ── Layer 1: Passphrase → Master Key ─────────────────────────────────────────

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: buf(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["wrapKey", "unwrapKey", "encrypt", "decrypt"]
  );
}

// ── Layer 2: Per-Document Encryption ─────────────────────────────────────────

export async function generateDocumentKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptDocument(
  file: ArrayBuffer,
  docKey: CryptoKey
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: buf(iv) },
    docKey,
    file
  );
  return { ciphertext, iv };
}

export async function decryptDocument(
  ciphertext: ArrayBuffer,
  iv: Uint8Array,
  docKey: CryptoKey
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: buf(iv) }, docKey, ciphertext);
}

/** Encrypt arbitrary string data (metadata JSON) with a document key. */
export async function encryptMetadata(
  metadata: string,
  docKey: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: buf(iv) },
    docKey,
    encoder.encode(metadata)
  );
  // Pack iv + ciphertext into a single base64 string
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return arrayBufferToBase64(combined.buffer);
}

/** Decrypt metadata string previously encrypted with encryptMetadata. */
export async function decryptMetadata(
  encryptedBase64: string,
  docKey: CryptoKey
): Promise<string> {
  const combined = new Uint8Array(base64ToArrayBuffer(encryptedBase64));
  const iv = combined.slice(0, IV_BYTES);
  const ciphertext = combined.slice(IV_BYTES);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: buf(iv) },
    docKey,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}

// ── Key Wrapping (document key ↔ master key) ────────────────────────────────

/** Wrap a per-document key with the user's master key. Returns base64 string. */
export async function wrapKey(
  docKey: CryptoKey,
  masterKey: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const wrappedKey = await crypto.subtle.wrapKey("raw", docKey, masterKey, {
    name: "AES-GCM",
    iv,
  });
  const combined = new Uint8Array(iv.byteLength + wrappedKey.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(wrappedKey), iv.byteLength);
  return arrayBufferToBase64(combined.buffer);
}

/** Unwrap a per-document key using the user's master key. */
export async function unwrapKey(
  wrappedBase64: string,
  masterKey: CryptoKey
): Promise<CryptoKey> {
  const combined = new Uint8Array(base64ToArrayBuffer(wrappedBase64));
  const iv = combined.slice(0, IV_BYTES);
  const wrappedKey = combined.slice(IV_BYTES);
  return crypto.subtle.unwrapKey(
    "raw",
    buf(wrappedKey),
    masterKey,
    { name: "AES-GCM", iv: buf(iv) },
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// ── Layer 3: RSA-OAEP Key Pair (for sharing) ────────────────────────────────

export async function generateKeyPair(): Promise<{
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["wrapKey", "unwrapKey"]
  );

  const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  return { publicKey, privateKey };
}

/** Encrypt a document key for a specific recipient using their RSA public key. */
export async function encryptForRecipient(
  docKey: CryptoKey,
  recipientPublicKeyJwk: JsonWebKey
): Promise<string> {
  const recipientKey = await crypto.subtle.importKey(
    "jwk",
    recipientPublicKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["wrapKey"]
  );
  const wrapped = await crypto.subtle.wrapKey("raw", docKey, recipientKey, {
    name: "RSA-OAEP",
  });
  return arrayBufferToBase64(wrapped);
}

/** Decrypt a document key that was encrypted for you with your RSA private key. */
export async function decryptFromSender(
  encryptedKeyBase64: string,
  privateKeyJwk: JsonWebKey
): Promise<CryptoKey> {
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["unwrapKey"]
  );
  return crypto.subtle.unwrapKey(
    "raw",
    base64ToArrayBuffer(encryptedKeyBase64),
    privateKey,
    { name: "RSA-OAEP" },
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/** Encrypt private key JWK with master key for server storage. */
export async function encryptPrivateKey(
  privateKeyJwk: JsonWebKey,
  masterKey: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: buf(iv) },
    masterKey,
    encoder.encode(JSON.stringify(privateKeyJwk))
  );
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return arrayBufferToBase64(combined.buffer);
}

/** Decrypt private key JWK stored on server. */
export async function decryptPrivateKey(
  encryptedBase64: string,
  masterKey: CryptoKey
): Promise<JsonWebKey> {
  const combined = new Uint8Array(base64ToArrayBuffer(encryptedBase64));
  const iv = combined.slice(0, IV_BYTES);
  const ciphertext = combined.slice(IV_BYTES);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: buf(iv) },
    masterKey,
    ciphertext
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}
