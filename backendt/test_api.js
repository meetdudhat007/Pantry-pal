async function test() {
  const base = 'http://localhost:4000';
  try {
    const h = await fetch(base + '/api/health');
    console.log('/api/health', await h.json());

    const s = await fetch(base + '/api/suggest', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ ingredients: 'eggs, tomato, cheese', diet: 'Any' })
    });
    const data = await s.json();
    console.log('/api/suggest', data);
  } catch (err) {
    console.error('Test failed', err);
  }
}

test();
