"""
LSTM FORECAST SERVICE
---------------------------------------------------------
Receives:
    Daily aggregated dataframe
Returns:
    Next N day predictions
Used By:
    forecast_service.py
Model:
    LSTM (TensorFlow / Keras)
"""
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping

# Build LSTM Sequences

def create_sequences(values, window_size=14):

    X = []
    y = []

    for i in range(len(values) - window_size):

        X.append(
            values[i:i + window_size]
        )

        y.append(
            values[i + window_size]
        )

    return (
        np.array(X),
        np.array(y)
    )

# Train LSTM
def train_lstm(df):

    values = (
        df["consumption"]
        .values
        .reshape(-1, 1)
    )

    scaler = MinMaxScaler()

    scaled_values = scaler.fit_transform(values)

    X_train, y_train = create_sequences(
        scaled_values,
        window_size=14
    )

    X_train = X_train.reshape(
        (
            X_train.shape[0],
            X_train.shape[1],
            1
        )
    )

    model = Sequential()

    model.add(Input(shape=(14, 1)))

    model.add(
        LSTM(
            64,
            return_sequences=True
        )
    )

    model.add(
        LSTM(
            32
        )
    )

    model.add(
        Dense(
            16,
            activation="relu"
        )
    )

    model.add(Dense(1))

    model.compile(
        optimizer="adam",
        loss="mse"
    )

    early_stop = EarlyStopping(
        monitor="val_loss",
        patience=10,
        restore_best_weights=True
    )

    model.fit(
        X_train,
        y_train,
        epochs=100,
        batch_size=16,
        validation_split=0.2,
        callbacks=[early_stop],
        verbose=0
    )

    return (
        model,
        scaler,
        scaled_values
    )


# Recursive Forecast
def predict_lstm(df, forecast_days=7):
    model, scaler, scaled_values = train_lstm(df)
    history = scaled_values[-14:].flatten().tolist()
    predictions = []

    for _ in range(forecast_days):
        x = np.array(history[-14:])
        x = x.reshape(1, 14, 1)

        pred_scaled = model.predict(
            x,
            verbose=0
        )[0][0]

        history.append(pred_scaled)

        pred = scaler.inverse_transform(
            [[pred_scaled]]
        )[0][0]

        predictions.append(
            round(
                float(pred), 2
            )
        )
    return predictions
