from pymongo import MongoClient
from app.settings import settings

client = None
db = None


def get_database():
    global client, db
    if client is None:
        try:
            print(f"Connecting to MongoDB at {settings.mongo_uri}...")
            client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
            db = client[settings.MONGO_DB]
            # Verify connection
            client.admin.command('ping')
            print("Successfully connected to MongoDB.")
            
            db.users.create_index("username", unique=True)
            db.users.create_index("email", unique=True)
        except Exception as e:
            print(f"CRITICAL: Could not connect to MongoDB: {e}")
            raise e
    return db


def get_users_collection():
    db = get_database()
    return db.users


def close_database():
    global client
    if client:
        client.close()
