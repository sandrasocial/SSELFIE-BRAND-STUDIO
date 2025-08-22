"""
Agent Performance Dashboard
"""
from datetime import datetime, timedelta
from typing import Dict, List

class AgentDashboard:
    def __init__(self):
        self.agent_metrics = {}
        self.performance_thresholds = {
            'response_time': 5.0,  # seconds
            'task_completion_rate': 0.95,
            'quality_score': 0.90
        }
    
    def update_agent_metrics(self, agent_id: str, metrics: Dict):
        if agent_id not in self.agent_metrics:
            self.agent_metrics[agent_id] = []
        self.agent_metrics[agent_id].append({
            **metrics,
            'timestamp': datetime.now()
        })
    
    def get_agent_performance(self, agent_id: str, timeframe: timedelta):
        if agent_id not in self.agent_metrics:
            return None
        
        cutoff = datetime.now() - timeframe
        relevant_metrics = [
            m for m in self.agent_metrics[agent_id]
            if m['timestamp'] > cutoff
        ]
        
        return {
            'total_tasks': len(relevant_metrics),
            'avg_response_time': sum(m['response_time'] for m in relevant_metrics) / len(relevant_metrics),
            'completion_rate': len([m for m in relevant_metrics if m['completed']]) / len(relevant_metrics),
            'quality_score': sum(m['quality_score'] for m in relevant_metrics) / len(relevant_metrics)
        }
    
    def generate_performance_alerts(self):
        alerts = []
        for agent_id in self.agent_metrics:
            perf = self.get_agent_performance(agent_id, timedelta(hours=24))
            if perf:
                if perf['avg_response_time'] > self.performance_thresholds['response_time']:
                    alerts.append(f'High response time for agent {agent_id}')
                if perf['completion_rate'] < self.performance_thresholds['task_completion_rate']:
                    alerts.append(f'Low completion rate for agent {agent_id}')
                if perf['quality_score'] < self.performance_thresholds['quality_score']:
                    alerts.append(f'Quality score below threshold for agent {agent_id}')
        return alerts