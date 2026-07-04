import pickle
import pandas as pd

# Load model
with open("models/crowd_model.pkl", "rb") as f:
    model = pickle.load(f)

# Load encoders
with open("models/encoders.pkl", "rb") as f:
    encoders = pickle.load(f)

def predict_crowd(month, place, hour, day):

    month_encoded = encoders["Month"].transform([month])[0]
    place_encoded = encoders["Place"].transform([place])[0]

    input_df = pd.DataFrame({
        "Month": [month_encoded],
        "Place": [place_encoded],
        "Hour": [hour],
        "Day": [day]
    })

    prediction = model.predict(input_df)

    crowd = encoders["Crowd_level"].inverse_transform(prediction)

    return crowd[0]


# Test
result = predict_crowd(
    month="June",
    place="Library",
    hour=9,
    day=1
)

print("Predicted Crowd Level:", result)