import http from 'http';

const postData = JSON.stringify({
  message: "Execute restart_workflow with name: workflow_1753660762258. I need to verify that our agents complete their tasks properly.",
  conversationId: "elena-workflow-test-direct",
  userId: "42585527"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/consulting-agents/elena/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sandra-admin-2025',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Elena Response Status: ${res.statusCode}`);
  console.log(`Elena Response Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
    // Process streaming responses
    if (chunk.toString().includes('data: ')) {
      const lines = chunk.toString().split('\n');
      lines.forEach(line => {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.substring(6));
            console.log('Elena Streaming Response:', jsonData);
          } catch (e) {
            console.log('Elena Raw Data:', line.substring(6));
          }
        }
      });
    }
  });
  
  res.on('end', () => {
    console.log('Elena Response Complete');
  });
});

req.on('error', (e) => {
  console.error(`Elena Request Error: ${e.message}`);
});

req.write(postData);
req.end();
