export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    res.status(501).json({ error: 'Not implemented yet' });
}
//# sourceMappingURL=save.js.map