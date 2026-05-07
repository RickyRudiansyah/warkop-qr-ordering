from fastapi import APIRouter, HTTPException
from backend.database import supabase

router = APIRouter()

@router.get("/tables")
def get_all_tables():
    result = supabase.table("tables").select("*").eq("is_active", True).order("table_number").execute()
    return result.data

@router.get("/tables/{table_number}")
def get_table(table_number: int):
    result = supabase.table("tables")\
        .select("*")\
        .eq("table_number", table_number)\
        .eq("is_active", True)\
        .single()\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Meja tidak ditemukan atau tidak aktif")
    return result.data