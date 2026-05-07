from fastapi import APIRouter, HTTPException
from backend.database import supabase
from pydantic import BaseModel
from typing import Optional


router = APIRouter()


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    is_available: Optional[bool] = None
    is_sold_out: Optional[bool] = None
    image_url: Optional[str] = None

@router.patch("/menu/{item_id}")
def update_menu_item(item_id: str, payload: MenuItemUpdate):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Tidak ada data yang diupdate")
    result = supabase.table("menu_items").update(update_data).eq("id", item_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")
    return result.data[0]

@router.post("/menu")
def create_menu_item(payload: MenuItemUpdate):
    result = supabase.table("menu_items").insert(payload.model_dump(exclude_none=True)).execute()
    return result.data[0]

@router.delete("/menu/{item_id}")
def delete_menu_item(item_id: str):
    supabase.table("menu_items").delete().eq("id", item_id).execute()
    return {"message": "Item berhasil dihapus"}


@router.get("/menu")
def get_menu():
    result = supabase.table("menu_items").select(
        "*, categories(name), menu_variations(*)"
    ).eq("is_available", True).order("sort_order").execute()
    return result.data

@router.get("/menu/categories")
def get_categories():
    result = supabase.table("categories").select("*").order("sort_order").execute()
    return result.data

@router.patch("/menu/{item_id}/sold-out")
def toggle_sold_out(item_id: str, sold_out: bool):
    result = supabase.table("menu_items").update(
        {"is_sold_out": sold_out}
    ).eq("id", item_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")
    return result.data[0]