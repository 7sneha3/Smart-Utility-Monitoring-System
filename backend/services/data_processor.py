import pandas as pd

# Required columns
REQUIRED_COLUMNS = [
    "utility_id",
    "sub_utility",
    "timestamp",
    "value"
]

# Map sub-utility → resource type
UTILITY_TYPE_MAP = {
    "backup diesel generator": "energy",
    "solar panels": "energy",
    "main grid supply": "energy",

    "borewell pump": "water",
    "ro plant": "water",
    "cooling tower": "water"
}


def process_file(path):

    # Detect file type
    if path.lower().endswith(".csv"):
        df = pd.read_csv(path, encoding="utf-8", engine="python")

    elif path.lower().endswith((".xls", ".xlsx")):
        df = pd.read_excel(path)

    else:
        raise Exception("Unsupported file format")

    # Normalize column names
    df.columns = df.columns.str.strip().str.lower()

    # Validate required columns
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]

    if missing:
        raise Exception(f"Missing columns: {missing}")

    # Normalize sub_utility text
    df["sub_utility"] = df["sub_utility"].str.strip().str.lower()

    # Detect resource type
    df["resource_type"] = df["sub_utility"].map(UTILITY_TYPE_MAP)

    # Convert timestamp
    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        format="%d-%m-%Y %H:%M",
        errors="coerce"
    )

    # Keep required columns + resource_type
    df = df[[
        "utility_id",
        "sub_utility",
        "resource_type",
        "timestamp",
        "value"
    ]]

    return df