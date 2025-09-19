module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, source: 'api/health', method: req.method, runtime: 'node' });
};


