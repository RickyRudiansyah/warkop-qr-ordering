from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import supabase
from datetime import datetime


router = APIRouter()


class OrderItemIn(BaseModel):
    menu_item_id: str
    menu_item_name: str
    menu_item_price: int
    quantity: int
    variations: List[dict] = []
    subtotal: int
    notes: Optional[str] = None


class CreateOrderIn(BaseModel):
    table_id: str
    payment_method: str
    total_amount: int
    items: List[OrderItemIn]
    notes: Optional[str] = None


@router.post("/orders")
def create_order(payload: CreateOrderIn):
    status = "PENDING_CASH" if payload.payment_method == "CASH" else "PENDING_PAYMENT"

    order_result = supabase.table("orders").insert({
        "table_id": payload.table_id,
        "status": status,
        "payment_method": payload.payment_method,
        "total_amount": payload.total_amount,
        "notes": payload.notes,
    }).execute()

    order = order_result.data[0]
    order_id = order["id"]

    items_to_insert = [
        {
            "order_id": order_id,
            "menu_item_id": item.menu_item_id,
            "menu_item_name": item.menu_item_name,
            "menu_item_price": item.menu_item_price,
            "quantity": item.quantity,
            "variations": item.variations,
            "subtotal": item.subtotal,
            "notes": item.notes,
        }
        for item in payload.items
    ]
    supabase.table("order_items").insert(items_to_insert).execute()

    return {"order_id": order_id, "status": status}


@router.get("/orders/active")
def get_active_orders():
    result = supabase.table("orders").select(
        "*, tables(table_number, label), order_items(*)"
    ).in_("status", ["PENDING_CASH", "PENDING_PAYMENT", "CONFIRMED", "PROCESSING"]).order("created_at").execute()
    return result.data


@router.get("/orders/history")
def get_orders_history():
    result = supabase.table("orders").select(
        "*, tables(table_number, label), order_items(*)"
    ).order("created_at", desc=True).limit(200).execute()
    return result.data


@router.get("/orders/{order_id}")
def get_order_detail(order_id: str):
    result = supabase.table("orders").select(
        "*, tables(table_number, label), order_items(*)"
    ).eq("id", order_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    return result.data


@router.patch("/orders/{order_id}/confirm-cash")
def confirm_cash_payment(order_id: str):
    result = supabase.table("orders").update({
        "status": "CONFIRMED",
        "confirmed_at": datetime.utcnow().isoformat()
    }).eq("id", order_id).eq("status", "PENDING_CASH").execute()
    return result.data[0] if result.data else {"error": "Order tidak ditemukan atau sudah dikonfirmasi"}


@router.patch("/orders/{order_id}/status")
def update_order_status(order_id: str, status: str):
    allowed_transitions = {
        "CONFIRMED": "PROCESSING",
        "PROCESSING": "SERVED",
    }
    order = supabase.table("orders").select("status").eq("id", order_id).single().execute()
    if not order.data:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    current = order.data["status"]
    if allowed_transitions.get(current) != status:
        raise HTTPException(status_code=400, detail=f"Tidak bisa update dari {current} ke {status}")

    result = supabase.table("orders").update({"status": status}).eq("id", order_id).execute()
    return result.data[0]


@router.patch("/orders/{order_id}/cancel")
def cancel_order(order_id: str, reason: str, actor_email: str = "cashier"):
    order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    if not order.data:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    if order.data["status"] in ["SERVED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail="Order tidak bisa dicancel")

    result = supabase.table("orders").update({
        "status": "CANCELLED",
        "cancel_reason": reason,
    }).eq("id", order_id).execute()

    supabase.table("activity_logs").insert({
        "actor_email": actor_email,
        "actor_role": "cashier",
        "action": "CANCEL_ORDER",
        "target_type": "order",
        "target_id": order_id,
        "detail": {"reason": reason, "previous_status": order.data["status"]}
    }).execute()

    return result.data[0]
