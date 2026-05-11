from fastapi import APIRouter
from database import supabase

router = APIRouter()

@router.get("/logs")
def get_activity_logs(limit: int = 50):
    result = supabase.table("activity_logs")\
        .select("*")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    return result.data
