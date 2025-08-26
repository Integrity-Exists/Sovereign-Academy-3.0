export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, runtime: process.version, ts: Date.now() });
  }
  return res.status(405).json({ error: 'Method Not Allowed' });
}
