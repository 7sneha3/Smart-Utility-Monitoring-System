from flask import Blueprint, request, jsonify
from database.mongodb import collection
import pandas as pd

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/consumption", methods=["GET"])
def get_consumption():

    resource_type = request.args.get("type")
    month = int(request.args.get("month"))
    sub_utility = request.args.get("sub_utility")

    query = {"resource_type": resource_type}

    if sub_utility:
        query["sub_utility"] = sub_utility.lower()

    data = list(collection.find(query))

    df = pd.DataFrame(data)

    if df.empty:
        return jsonify([])

    df["timestamp"] = pd.to_datetime(df["timestamp"])

    df = df[df["timestamp"].dt.month == month]

    df["day"] = df["timestamp"].dt.day

    grouped = df.groupby("day")["value"].sum().reset_index()

    return jsonify(grouped.to_dict(orient="records"))