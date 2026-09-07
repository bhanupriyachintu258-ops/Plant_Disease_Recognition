from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)


# Home page
@app.route("/")
def home():
    return "PlantCare AI Server is Running!"


# Load trained model
model = tf.keras.models.load_model("plant_disease_model (2).keras")


# Disease class names
class_names = [
    "Pepper__bell___Bacterial_spot",
    "Potato___healthy",
    "Tomato_Leaf_Mold",
    "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato_Bacterial_spot",
    "Tomato_Septoria_leaf_spot",
    "Tomato_healthy",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato_Early_blight",
    "Tomato__Target_Spot",
    "Pepper__bell___healthy",
    "Potato___Late_blight",
    "Tomato_Late_blight",
    "Potato___Early_blight",
    "Tomato__Tomato_mosaic_virus"
]


# Prediction route
@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    file = request.files["image"]

    try:
        # Open image
        image = Image.open(file).convert("RGB")

        # Resize image
        image = image.resize((128, 128))

        # Convert image to numpy array
        image_array = np.array(image)

        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)

        # Prediction
        prediction = model.predict(image_array, verbose=0)

        # Get highest probability
        index = np.argmax(prediction[0])

        disease = class_names[index]

        confidence = float(prediction[0][index] * 100)

        return jsonify({
            "disease": disease,
            "confidence": round(confidence, 2)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# Start Flask server
if __name__ == "__main__":
    app.run(debug=True)