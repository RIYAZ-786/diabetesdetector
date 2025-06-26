from flask import Flask, request, jsonify, render_template
import pandas as pd
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import VotingClassifier, RandomForestClassifier
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load dataset
data = pd.read_csv("DiabComplete.csv")
data.columns = data.columns.str.strip()

X = data.drop("Diabetic", axis=1)
y = data["Diabetic"]

# Define and fit individual models
naive_model = GaussianNB()
knn_model = KNeighborsClassifier(n_neighbors=5)
svm_model = SVC(kernel='linear', probability=True)
ann_model = MLPClassifier(hidden_layer_sizes=(10, 5), max_iter=1000)
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)

naive_model.fit(X, y)
knn_model.fit(X, y)
svm_model.fit(X, y)
ann_model.fit(X, y)
rf_model.fit(X, y)

# Define and fit ensemble model
ensemble_model = VotingClassifier(
    estimators=[
        ('naive', naive_model),
        ('knn', knn_model),
        ('svm', svm_model)
        # ANN excluded from soft voting
    ],
    voting='hard'
)
ensemble_model.fit(X, y)

# Register all models
models = {
    "naive": naive_model,
    "knn": knn_model,
    "svm": svm_model,
    "ann": ann_model,
    "randomforest": rf_model,  # <-- Added here
    "ensemble": ensemble_model
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        input_data = request.json
        model_type = input_data.get("model", "naive").lower()

        if model_type not in models:
            return jsonify({"result": f"Model '{model_type}' not supported."}), 400

        # Ensure all inputs are present
        expected_keys = [
            'age', 'sex', 'family', 'smoking', 'drinking',
            'thirst', 'urination', 'height', 'weight', 'fatuge'
        ]
        if not all(key in input_data for key in expected_keys):
            return jsonify({"result": "Missing input fields."}), 400

        values = [input_data[key] for key in expected_keys]

        prediction = models[model_type].predict([values])[0]
        result = (
            "unfortunately your report is Positive"
            if prediction == 1 else
            "congratulations your report is Negative"
        )

        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"result": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
