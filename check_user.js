const db = require('./database');
(async () => {
  try {
    const user = await db.getUserByEmail('teste@notcare.com');
    console.log('user=', user);
  } catch (err) {
    console.error('err', err);
  }
})();