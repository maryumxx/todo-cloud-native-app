"""
Reminder Service

Handles scheduling and triggering of task reminders.
"""
from fastapi import FastAPI, BackgroundTasks
from datetime import datetime, timedelta
from typing import Dict, Any
import asyncio
import logging

app = FastAPI(
    title="Reminder Service",
    description="Service to handle task reminder scheduling and notifications",
    version="1.0.0"
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {"message": "Reminder Service", "status": "running"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/schedule-reminder")
async def schedule_reminder(task_id: str, remind_at: str, user_id: str):
    """
    Schedule a reminder for a specific task.
    """
    try:
        # Parse the reminder time
        reminder_time = datetime.fromisoformat(remind_at.replace('Z', '+00:00'))
        
        # Calculate delay in seconds
        now = datetime.utcnow()
        delay = (reminder_time - now).total_seconds()
        
        if delay <= 0:
            # Reminder time has already passed, trigger immediately
            await trigger_reminder(task_id, user_id)
            return {"message": "Reminder triggered immediately", "task_id": task_id}
        
        # In a real implementation, we would schedule this with a job scheduler
        # For now, we'll simulate with a background task
        asyncio.create_task(delayed_reminder(task_id, user_id, delay))
        
        logger.info(f"Scheduled reminder for task {task_id} at {remind_at}")
        return {
            "message": "Reminder scheduled successfully",
            "task_id": task_id,
            "scheduled_time": remind_at
        }
    except Exception as e:
        logger.error(f"Error scheduling reminder: {str(e)}")
        return {"error": str(e)}, 500

async def delayed_reminder(task_id: str, user_id: str, delay: float):
    """
    Internal function to delay and trigger a reminder.
    """
    await asyncio.sleep(delay)
    await trigger_reminder(task_id, user_id)

async def trigger_reminder(task_id: str, user_id: str):
    """
    Trigger a reminder notification.
    """
    logger.info(f"Triggering reminder for task {task_id}, user {user_id}")
    
    # In a real implementation, this would send a notification to the user
    # via email, push notification, or WebSocket
    
    # For now, just log the event
    print(f"REMINDER TRIGGERED: Task {task_id} for user {user_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)