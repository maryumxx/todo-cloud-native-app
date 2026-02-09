"""
RRULE Parser for recurring tasks
"""
from datetime import datetime
from typing import Optional
from dateutil.rrule import rrulestr

def get_next_occurrence(rrule_string: str, after: datetime) -> Optional[datetime]:
    """
    Parse RRULE and return next occurrence after given datetime.
    """
    try:
        rule = rrulestr(rrule_string, dtstart=after)
        next_dt = rule.after(after)
        return next_dt
    except Exception as e:
        print(f"Error parsing RRULE: {e}")
        return None