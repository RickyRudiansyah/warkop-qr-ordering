import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load .env dari folder backend/ secara eksplisit
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)