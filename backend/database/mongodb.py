from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["smart_utility"]

collection = db["utility_data"]


def insert_records(records):
    collection.insert_many(records)