const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Map to store generated ephemeral secrets so they persist for the lifetime of the process
const ephemeralSecrets = new Map();

/**
 * Safely fetches a secret from environment variables or fallback files.
 * If no secret is found, generates a random ephemeral secret (warning logged).
 * @param {string} key - Environment variable key
 * @param {string} fallbackFile - Optional text file containing the secret
 * @param {boolean} required - If true, throws an error in production instead of generating ephemeral secrets
 * @returns {string} The secret value
 */
function getSecret(key, fallbackFile = null, required = false) {
  // 1. Try Environment Variable
  if (process.env[key]) {
    return process.env[key];
  }

  // 2. Try Fallback File
  if (fallbackFile) {
    const resolvedPath = path.resolve(process.cwd(), fallbackFile);
    if (fs.existsSync(resolvedPath)) {
      try {
        const fileContent = fs.readFileSync(resolvedPath, 'utf-8').trim();
        if (fileContent) return fileContent;
      } catch (err) {
        console.error(`Error reading fallback secret file at ${resolvedPath}:`, err);
      }
    }
  }

  // 3. Handle Production Requirements
  if (required && process.env.NODE_ENV === 'production') {
    throw new Error(`CRITICAL CONFIGURATION ERROR: Secret key "${key}" is required but not provided in production.`);
  }

  // 4. Generate/Return Ephemeral Secret for local development/sandboxes
  if (ephemeralSecrets.has(key)) {
    return ephemeralSecrets.get(key);
  }

  const length = key === 'MONGO_URI' ? 64 : 32; // custom size if needed
  const ephemeralValue = crypto.randomBytes(length).toString('hex');
  ephemeralSecrets.set(key, ephemeralValue);

  console.warn(
    `[SECURITY WARNING] Missing config "${key}". Generated ephemeral instance-isolated secret. Do NOT use in production!`
  );
  return ephemeralValue;
}

module.exports = { getSecret };
