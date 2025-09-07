import { query } from '../server/db';

(async () => {
  try {
    const r = await query('select 1 as ok');
    console.log('DB OK:', r.rows[0]);
    process.exit(0);
  } catch (e) {
    console.error('DB FAIL:', e?.message || e);
    process.exit(1);
  }
})();