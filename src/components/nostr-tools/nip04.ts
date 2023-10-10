import { randomBytes } from '@noble/hashes/utils'
import { secp256k1 } from '@noble/curves/secp256k1'
import { base64 } from '@scure/base'
import { utf8Encoder } from './utils'
import CryptoJS  from 'crypto-js'

export async function encrypt(privkey: string, pubkey: string, text: string): Promise<string> {
  const key = secp256k1.getSharedSecret(privkey, '02' + pubkey)
  const normalizedKey = getNormalizedX(key)

  let iv = Uint8Array.from(randomBytes(16))
  let plaintext = utf8Encoder.encode(text)
  let cryptoKey = await crypto.subtle.importKey('raw', normalizedKey, { name: 'AES-CBC' }, false, ['encrypt'])
  let ciphertext = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, plaintext)
  let ctb64 = base64.encode(new Uint8Array(ciphertext))
  let ivb64 = base64.encode(new Uint8Array(iv.buffer))

  return `${ctb64}?iv=${ivb64}`
}

export function decrypt(privkey: string, pubkey: string, data: string): string {
  let [ctb64, ivb64] = data.split('?iv=')
  let key = secp256k1.getSharedSecret(privkey, '02' + pubkey)
  let normalizedKey = getNormalizedX2(key)
  let ctext = CryptoJS.enc.Base64.parse(ctb64)
  let ckey = CryptoJS.enc.Hex.parse(normalizedKey)
  let civ = CryptoJS.enc.Base64.parse(ivb64)

  let ciper = CryptoJS.lib.CipherParams.create({
    ciphertext: ctext, key:ckey, iv:civ,
    padding:CryptoJS.pad.ZeroPadding, blockSize:4,formatter:CryptoJS.format.Hex})

  let plaintext = CryptoJS.AES.decrypt(ciper, ckey,{iv:civ})
  let decodetext = plaintext.toString(CryptoJS.enc.Utf8)
  return decodetext;
}

function getNormalizedX(key: Uint8Array): Uint8Array {
  return key.slice(1, 33)
}

function getNormalizedX2(key: Uint8Array): string {
  let keyArray = key.slice(1, 33)
  let hexstring = ""
  keyArray.forEach((value) => {
    hexstring = hexstring.concat(value.toString(16).padStart(2,'0'))
  })
  return hexstring;
}
