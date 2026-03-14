# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pandas as pd

# app = Flask(__name__)
# CORS(app)


# @app.route("/")
# def home():
#     return {"message": "Backend running successfully"}


# @app.route("/upload", methods=["POST"])
# def upload_file():

#     file = request.files["file"]

#     if file.filename.endswith(".csv"):
#         df = pd.read_csv(file)

#     elif file.filename.endswith(".xlsx"):
#         df = pd.read_excel(file)

#     else:
#         return {"error": "Invalid file format"}

#     return {
#         "message": "File received successfully",
#         "rows": len(df)
#     }


# if __name__ == "__main__":
#     app.run(debug=True)

from flask import Flask
from flask_cors import CORS

from routes.upload_routes import upload_bp
from routes.dashboard_routes import dashboard_bp

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"message": "Backend running successfully"}


# register routes
app.register_blueprint(upload_bp)
app.register_blueprint(dashboard_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)