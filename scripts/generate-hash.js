// scripts/generate-hash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'manzur2026';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Contraseña:', password);
  console.log('Hash:', hash);
  console.log('');
  console.log('Copia este hash en lib/users.ts para todos los usuarios');
}

generateHash();