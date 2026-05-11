from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os


# Load .env eksplisit
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# baru import routes (setelah load_dotenv)
# from backend.routes.health import router as health_router
# from backend.routes.menu import router as menu_router
# from backend.routes.orders import router as orders_router
# from backend.routes.tables import router as tables_router
# from backend.routes.logs import router as logs_router
from routes.health import router as health_router
from routes.menu import router as menu_router
from routes.orders import router as orders_router
from routes.tables import router as tables_router
from database import supabase



app = FastAPI(title="Warkop QR API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(menu_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(tables_router, prefix="/api")
app.include_router(logs_router, prefix="/api")
