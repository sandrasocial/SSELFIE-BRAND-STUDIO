const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('client/public'));
app.use('/src', express.static('client/src'));

app.get('/api/health', (req, res) => res.json({status: 'healthy'}));
app.post('/api/admin/consulting-agents/chat', (req, res) => res.json({status: 'success', agent: req.body.agentId}));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client/index.html')));

app.listen(5000, () => console.log('🚀 SSELFIE Studio LIVE: http://localhost:5000'));