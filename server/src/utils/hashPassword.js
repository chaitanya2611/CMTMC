// Usage: npm run hash-password -- "your-strong-password"
import bcrypt from 'bcryptjs';

const pw = process.argv[2];
if (!pw || pw.length < 10) {
  console.error('Give a password of at least 10 characters:  npm run hash-password -- "your-strong-password"');
  process.exit(1);
}
const hash = await bcrypt.hash(pw, 12);
console.log('\nPut this line in server/.env (keep the single quotes):\n');
console.log(`ADMIN_PASSWORD_HASH='${hash}'\n`);
