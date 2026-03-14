# 

from flask import Blueprint, request, jsonify
import os

from services.data_processor import process_file
from database.mongodb import insert_records

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/upload", methods=["POST"])
def upload_file():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    path = os.path.join("uploads", file.filename)
    file.save(path)

    # Process file
    df = process_file(path)

    records = df.to_dict(orient="records")

    # Insert into MongoDB
    insert_records(records)

    return jsonify({
        "message": "File processed successfully",
        "rows": len(records)
    })