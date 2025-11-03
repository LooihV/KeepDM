from pymongo import MongoClient
from app.settings import settings

client = None
db = None


def get_database():
    global client, db
    if client is None:
        client = MongoClient(settings.mongo_uri)
        db = client[settings.MONGO_DB]
        db.users.create_index("username", unique=True)
        db.users.create_index("email", unique=True)
    return db


def get_users_collection():
    db = get_database()
    return db.users


def close_database():
    global client
    if client:
        client.close()
