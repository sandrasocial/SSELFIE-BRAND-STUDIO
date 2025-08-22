import requests
import json
from datetime import datetime

class HealthCheck:
    def __init__(self, config_path='config/load_balancer.json'):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        self.nodes = self.config['load_balancer']['nodes']
        
    async def check_node_health(self, node):
        try:
            url = f"http://{node['host']}:{node['port']}/health"
            response = requests.get(url, timeout=5)
            return {
                'node_id': node['id'],
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'last_check': datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                'node_id': node['id'],
                'status': 'unhealthy',
                'error': str(e),
                'last_check': datetime.utcnow().isoformat()
            }
    
    async def check_all_nodes(self):
        health_status = []
        for node in self.nodes:
            status = await self.check_node_health(node)
            health_status.append(status)
        return health_status