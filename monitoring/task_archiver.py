"""
Automatic Task Archiving System
"""
import json
from datetime import datetime, timedelta
from typing import Dict, List

class TaskArchiver:
    def __init__(self, archive_after_days: int = 30):
        self.archive_after_days = archive_after_days
        self.archive = {}
    
    def should_archive(self, task: Dict) -> bool:
        if task['status'] != 'completed':
            return False
        
        completed_at = datetime.fromisoformat(str(task['completed_at']))
        age = datetime.now() - completed_at
        return age.days >= self.archive_after_days
    
    def archive_tasks(self, active_tasks: Dict) -> Dict:
        tasks_to_archive = {}
        tasks_to_keep = {}
        
        for task_id, task in active_tasks.items():
            if self.should_archive(task):
                tasks_to_archive[task_id] = task
            else:
                tasks_to_keep[task_id] = task
        
        self.archive.update(tasks_to_archive)
        return tasks_to_keep
    
    def save_archive(self, filename: str):
        with open(f'monitoring/archives/{filename}', 'w') as f:
            json.dump(self.archive, f, default=str)
    
    def load_archive(self, filename: str):
        try:
            with open(f'monitoring/archives/{filename}', 'r') as f:
                self.archive = json.load(f)
        except FileNotFoundError:
            self.archive = {}
    
    def get_archived_task(self, task_id: str) -> Dict:
        return self.archive.get(task_id)
    
    def search_archive(self, criteria: Dict) -> List[Dict]:
        results = []
        for task_id, task in self.archive.items():
            matches = all(
                task.get(key) == value 
                for key, value in criteria.items()
            )
            if matches:
                results.append(task)
        return results