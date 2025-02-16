from flask import Flask, request, jsonify
import cv2
import numpy as np
import onnxruntime as ort
import requests

app = Flask(__name__)

# Load the ONNX model (ensure model.onnx is in your working directory)
model_path = "model.onnx"
session = ort.InferenceSession(model_path)

def process_image_from_url(url: str) -> np.ndarray:
    """
    Download an image from the given URL, decode it with OpenCV,
    convert it from BGR to RGB, and add a batch dimension for model input.
    """
    response = requests.get(url)
    if response.status_code != 200:
        raise ValueError(f"Failed to download image from URL: {url} (status code {response.status_code})")
    
    # Convert the downloaded bytes to a NumPy array
    np_arr = np.frombuffer(response.content, np.uint8)
    
    # Decode the image using OpenCV
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image. Ensure the URL points to a valid image.")
    
    # Convert image from BGR (OpenCV default) to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Add an extra dimension (batch size = 1)
    return np.array([img])

@app.route('/predict', methods=['GET'])
def predict_endpoint():
    """
    Endpoint to handle image URL. Expects a query parameter 'img_url'
    containing the image URL. Downloads the image, processes it, and returns
    the prediction result in JSON format.
    """
    img_url = request.args.get('img_url')
    if not img_url:
        return jsonify({"error": "Parameter 'img_url' is required."}), 400

    try:
        # Process the image from the URL
        input_tensor = process_image_from_url(img_url)
        
        # Run the prediction using ONNX Runtime
        # Adjust "inputs" key if your model expects a different input name
        prediction = session.run(None, {"inputs": input_tensor})[0][0]
        
        # Convert prediction to string.
        # This assumes prediction is an iterable; adjust if necessary.
        if isinstance(prediction, (list, np.ndarray)):
            img_text = "".join(map(str, prediction)).strip()
        else:
            img_text = str(prediction).strip()
        
        return jsonify({"img_text": img_text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
