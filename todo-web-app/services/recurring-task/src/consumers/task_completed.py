"""
Task Completed Event Consumer
"""
from fastapi import BackgroundTasks
from typing import Dict, Any
from ..services.occurrence_generator import OccurrenceGenerator

class TaskCompletedConsumer:
    def __init__(self):
        self.generator = OccurrenceGenerator()
    
    async def process_task_completed(self, event_data: Dict[str, Any]):
        """
        Process task completed event and generate next occurrence if needed.
        """
        task_data = event_data.get('data', {})
        
        if not task_data.get('is_recurring'):
            return {"message": "Task is not recurring, skipping"}
        
        try:
            # Generate next occurrence
            new_task = await self.generator.generate_next_occurrence(task_data)
            
            # Here we would typically call the task API to create the new task
            # For now, we'll just return the new task data
            return {
                "message": "Next occurrence generated",
                "new_task": new_task
            }
        except Exception as e:
            return {
                "message": f"Error generating next occurrence: {str(e)}",
                "error": str(e)
            }