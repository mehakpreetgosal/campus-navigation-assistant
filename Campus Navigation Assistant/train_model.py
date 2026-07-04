import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# Load dataset
df = pd.read_csv("campus_navigation_dataset.csv")

# Create separate encoders
month_encoder = LabelEncoder()
place_encoder = LabelEncoder()
crowd_encoder = LabelEncoder()

# Encode columns
df["Month"] = month_encoder.fit_transform(df["Month"])
df["Place"] = place_encoder.fit_transform(df["Place"])
df["Crowd_level"] = crowd_encoder.fit_transform(df["Crowd_level"])

# Features and target
X = df.drop("Crowd_level", axis=1)
y = df["Crowd_level"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# Create models folder
os.makedirs("models", exist_ok=True)

# Save model
with open("models/crowd_model.pkl", "wb") as f:
    pickle.dump(model, f)

# Save all encoders
encoders = {
    "Month": month_encoder,
    "Place": place_encoder,
    "Crowd_level": crowd_encoder
}

with open("models/encoders.pkl", "wb") as f:
    pickle.dump(encoders, f)

print("Model trained successfully!")