import numpy as np
import pandas as pd
import os
import sys
import pickle
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

# Path to the dataset
dataset_path = './services/generated_dataset.csv'
model_path = './services/water_pump_model.pkl'

# Function to train and save model
def train_and_save_model(data, model_path):
    """Train a linear regression model and save it to disk"""
    # Identify the target variable
    target_column = 'Water Required (ml)'
    
    # Prepare features and target
    X = data[['Air Temperature (°C)', 'Air Humidity (%)', 'Light Intensity (lux)']]
    y = data[target_column]
    
    # Train the model on all data
    model = LinearRegression()
    model.fit(X, y)
    
    # Save the model
    with open(model_path, 'wb') as f:
        pickle.dump((model, X.columns), f)
    
    return model, X.columns

# Function to load the trained model
def load_model(model_path):
    """Load the trained model from disk"""
    if os.path.exists(model_path):
        with open(model_path, 'rb') as f:
            return pickle.load(f)
    return None, None

# Function to predict water required based on sensor data
def predict_water_required(model, features, sensor_data):
    """
    Predict water required based on sensor data
    
    Parameters:
    model: trained LinearRegression model
    features: list of feature names the model was trained on
    sensor_data: dict - Dictionary with sensor readings
    
    Returns:
    float - Predicted water required in ml
    """
    # Create a DataFrame with the input features, ensuring column names match training data
    input_data = {}
    
    # Ensure each feature from the training data is present
    for feature_name in features:
        if feature_name in sensor_data:
            input_data[feature_name] = [sensor_data[feature_name]]
        else:
            # If a required feature is missing, use a reasonable default
            print(f"Warning: Missing feature {feature_name}, using default value", file=sys.stderr)
            if 'Temperature' in feature_name:
                input_data[feature_name] = [25.0]  # Default room temperature
            elif 'Humidity' in feature_name:
                input_data[feature_name] = [60.0]  # Default medium humidity
            else:
                input_data[feature_name] = [50.0]  # Default for other features
    
    # Create DataFrame with exact same column structure as training data
    input_df = pd.DataFrame(input_data)
    
    # Ensure columns are in the same order as training
    input_df = input_df[features]
    
    # Make prediction
    prediction = model.predict(input_df)[0]
    
    # Round to the nearest integer (ml)
    return max(0, round(prediction))

# Check if being run with command-line arguments for prediction
if len(sys.argv) > 1:
    # Load the trained model
    model, features = load_model(model_path)
    
    if model is None:
        # Load dataset and train model if it doesn't exist
        if os.path.exists(dataset_path):
            data = pd.read_csv(dataset_path)
        else:
            print("Error: Dataset not found", file=sys.stderr)
            sys.exit(1)
        
        # Train and save the model
        model, features = train_and_save_model(data, model_path)
    
    # Parse command line arguments as sensor readings
    try:
        temperature = float(sys.argv[1])
        humidity = float(sys.argv[2])
        
        # Add light intensity if provided, otherwise use a default
        light = float(sys.argv[3]) if len(sys.argv) > 3 else 50
        
        # Create a dictionary with the expected column names
        sensor_data = {
            'Air Temperature (°C)': temperature,
            'Air Humidity (%)': humidity,
            'Light Intensity (lux)': light
        }
        
        # Make prediction
        prediction = predict_water_required(model, features, sensor_data)
        
        # Print the prediction to stdout (will be captured by Node.js)
        print(prediction)
        sys.exit(0)
    
    except (ValueError, IndexError) as e:
        print(f"Error processing command line arguments: {e}", file=sys.stderr)
        sys.exit(1)

# When run directly (not via command line arguments)
if __name__ == "__main__":
    # Load or create dataset and train model
    if os.path.exists(dataset_path):
        data = pd.read_csv(dataset_path)
        print(f"Loaded dataset with {len(data)} records")
    else:
        print("Dataset not found, please ensure generated_dataset.csv exists")
        sys.exit(1)
    
    # Train model
    model, features = train_and_save_model(data, model_path)
    
    # Evaluate model
    X = data[['Air Temperature (°C)', 'Air Humidity (%)', 'Light Intensity (lux)']]
    y = data['Water Required (ml)']
    
    y_pred = model.predict(X)
    
    # Calculate metrics
    mse = mean_squared_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    
    print(f"Model performance:")
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"R² Score: {r2:.2f}")
    print(f"Model coefficients:")
    
    for feature, coef in zip(features, model.coef_):
        print(f"- {feature}: {coef:.4f}")
    
    print(f"Intercept: {model.intercept_:.4f}")
    print("Model trained and saved as water_pump_model.pkl")
