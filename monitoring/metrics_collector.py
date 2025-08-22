"""
Task Execution Metrics Collector
"""
import time
from typing import Dict, List
from datetime import datetime

class MetricsCollector:
    def __init__(self):
        self.metrics_store = {}
        self.current_tasks = {}
    
    def start_task_timing(self, task_id: str):
        self.current_tasks[task_id] = {
            'start_time': time.time(),
            'checkpoints': []
        }
    
    def log_checkpoint(self, task_id: str, checkpoint: str):
        if task_id in self.current_tasks:
            self.current_tasks[task_id]['checkpoints'].append({
                'name': checkpoint,
                'time': time.time()
            })
    
    def complete_task_timing(self, task_id: str):
        if task_id in self.current_tasks:
            end_time = time.time()
            task_data = self.current_tasks[task_id]
            
            execution_time = end_time - task_data['start_time']
            checkpoints = task_data['checkpoints']
            
            self.metrics_store[task_id] = {
                'execution_time': execution_time,
                'checkpoints': checkpoints,
                'completed_at': datetime.now()
            }
            
            del self.current_tasks[task_id]
            return self.metrics_store[task_id]
    
    def get_task_metrics(self, task_id: str):
        return self.metrics_store.get(task_id)
    
    def get_average_execution_time(self):
        if not self.metrics_store:
            return 0
        times = [m['execution_time'] for m in self.metrics_store.values()]
        return sum(times) / len(times)