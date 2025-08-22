"""
Task Repository and Monitoring System
"""
import logging
from datetime import datetime
from typing import Dict, List

class TaskRepository:
    def __init__(self):
        self.tasks = {}
        self.metrics = {}
        self.setup_logging()
    
    def setup_logging(self):
        logging.basicConfig(
            filename='monitoring/task_execution.log',
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def add_task(self, task_id: str, details: Dict):
        self.tasks[task_id] = {
            **details,
            'created_at': datetime.now(),
            'status': 'pending',
            'metrics': {}
        }
        logging.info(f'Task created: {task_id}')
    
    def update_task_status(self, task_id: str, status: str):
        if task_id in self.tasks:
            self.tasks[task_id]['status'] = status
            self.tasks[task_id]['updated_at'] = datetime.now()
            logging.info(f'Task {task_id} status updated to: {status}')
    
    def log_metrics(self, task_id: str, metrics: Dict):
        if task_id in self.tasks:
            self.tasks[task_id]['metrics'] = metrics
            logging.info(f'Metrics logged for task {task_id}')
    
    def archive_completed_tasks(self):
        archive = {}
        for task_id, task in self.tasks.items():
            if task['status'] == 'completed':
                archive[task_id] = task
        return archive