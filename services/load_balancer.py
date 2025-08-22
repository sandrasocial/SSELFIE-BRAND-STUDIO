import json
from typing import List, Dict
from datetime import datetime
from .health_check import HealthCheck

class StyleTransferLoadBalancer:
    def __init__(self, config_path='config/load_balancer.json'):
        self.current_node_index = 0
        self.health_checker = HealthCheck(config_path)
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        self.nodes = self.config['load_balancer']['nodes']
        self.healthy_nodes = self.nodes.copy()
    
    async def get_next_healthy_node(self) -> Dict:
        if not self.healthy_nodes:
            await self.refresh_healthy_nodes()
            if not self.healthy_nodes:
                raise Exception("No healthy nodes available")
        
        # Round-robin selection
        node = self.healthy_nodes[self.current_node_index]
        self.current_node_index = (self.current_node_index + 1) % len(self.healthy_nodes)
        return node
    
    async def refresh_healthy_nodes(self):
        health_status = await self.health_checker.check_all_nodes()
        self.healthy_nodes = [
            node for node, status in zip(self.nodes, health_status)
            if status['status'] == 'healthy'
        ]
    
    async def handle_request(self, style_request):
        retries = 0
        max_retries = self.config['load_balancer']['max_retries']
        
        while retries < max_retries:
            try:
                node = await self.get_next_healthy_node()
                # Forward request to selected node
                response = await self.forward_request(node, style_request)
                return response
            except Exception as e:
                retries += 1
                await self.refresh_healthy_nodes()
                if retries == max_retries:
                    raise Exception(f"Failed to process style transfer after {max_retries} attempts")
    
    async def forward_request(self, node, style_request):
        # Implementation for forwarding request to specific node
        url = f"http://{node['host']}:{node['port']}/style-transfer"
        # Add actual request forwarding implementation here
        pass