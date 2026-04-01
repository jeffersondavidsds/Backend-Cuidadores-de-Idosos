// Node script to test backend endpoints
// Node 18+ has global fetch; no extra dependency required.

(async () => {
  try {
    const registerRes = await fetch('https://backend-cuidadores-de-idosos.onrender.com/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'maria', email: 'maria@teste.com', password: 'senha123' })
    });

    const registerBody = await registerRes.text();
    console.log('register status', registerRes.status);
    console.log(registerBody);

    const loginRes = await fetch('https://backend-cuidadores-de-idosos.onrender.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'maria@teste.com', password: 'senha123' })
    });

    const loginBody = await loginRes.text();
    console.log('login status', loginRes.status);
    console.log(loginBody);
  } catch (err) {
    console.error('error', err.message);
  }
})();