// Genera el hash bcrypt para la contraseña del panel /admin.
//   npm run set-password "TuNuevaClave"
// Copiá la línea ADMIN_PASSWORD_HASH que imprime en tu .env.local
import bcrypt from 'bcryptjs';

const pass = process.argv[2];
if (!pass) {
  console.error('Uso: npm run set-password "TuNuevaClave"');
  process.exit(1);
}
if (pass.length < 8) {
  console.error('La contraseña debería tener al menos 8 caracteres.');
  process.exit(1);
}

const hash = bcrypt.hashSync(pass, 10);
// En .env los $ deben ir escapados como \$ para que dotenv no los expanda.
const escaped = hash.replace(/\$/g, '\\$');

console.log('\nPegá esta línea en tu .env.local:\n');
console.log(`ADMIN_PASSWORD_HASH="${escaped}"\n`);
