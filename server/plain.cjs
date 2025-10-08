module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, route: 'api/plain.cjs', method: req.method });
};


