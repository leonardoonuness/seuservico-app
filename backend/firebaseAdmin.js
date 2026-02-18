function formatPrivateKey(privateKey = '') {
  return privateKey.replace(/\\n/g, '\n');
}

function getFirebaseAdminConfigFromEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return {
    projectId,
    clientEmail,
    privateKey: privateKey ? formatPrivateKey(privateKey) : undefined,
  };
}

function validateFirebaseAdminConfig({ strict = false } = {}) {
  const config = getFirebaseAdminConfigFromEnv();
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    const message = `Firebase Admin (Service Account) não configurado. Variáveis faltando: ${missing.join(', ')}`;
    if (strict) {
      throw new Error(message);
    }
    return { ok: false, message, config: null };
  }

  return { ok: true, config };
}

function initializeFirebaseAdmin({ strict = false } = {}) {
  const validation = validateFirebaseAdminConfig({ strict });

  if (!validation.ok) {
    console.warn(validation.message);
    return null;
  }

  console.log('Firebase Admin (Service Account) validado com sucesso.');
  return validation.config;
}

module.exports = {
  initializeFirebaseAdmin,
  validateFirebaseAdminConfig,
};
