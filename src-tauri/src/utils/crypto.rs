use magic_crypt::{new_magic_crypt, MagicCryptTrait};
use serde_json::Value;

const CRYPTO_KEY: &str = "magic-key";

pub fn encrypt_string(input: &str) -> String {
    let crypto = new_magic_crypt!(CRYPTO_KEY, 256);
    crypto.encrypt_str_to_base64(input)
}

pub fn decrypt_string(encrypted: &str) -> Result<String, String> {
    let crypto = new_magic_crypt!(CRYPTO_KEY, 256);
    crypto
        .decrypt_base64_to_string(encrypted)
        .map_err(|e| e.to_string())
}

pub fn encrypt_value(value: Value) -> Result<Value, String> {
    match value {
        Value::Object(map) => {
            let mut encrypted_map = serde_json::Map::new();
            for (k, v) in map {
                if let Value::String(s) = v {
                    encrypted_map.insert(k, Value::String(encrypt_string(&s)));
                } else if let Value::Object(_) = v {
                    encrypted_map.insert(k, encrypt_value(v)?);
                } else {
                    encrypted_map.insert(k, v);
                }
            }
            Ok(Value::Object(encrypted_map))
        }
        _ => Ok(value),
    }
}

pub fn decrypt_value(value: Value) -> Result<Value, String> {
    match value {
        Value::Object(map) => {
            let mut decrypted_map = serde_json::Map::new();
            for (k, v) in map {
                if let Value::String(s) = v {
                    // Tenter de déchiffrer, sans erreur si ce n'est pas possible
                    let decrypted = decrypt_string(&s).unwrap_or(s);
                    decrypted_map.insert(k, Value::String(decrypted));
                } else if let Value::Object(_) = v {
                    decrypted_map.insert(k, decrypt_value(v)?);
                } else {
                    decrypted_map.insert(k, v);
                }
            }
            Ok(Value::Object(decrypted_map))
        }
        _ => Ok(value),
    }
}
