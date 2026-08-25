import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.pipeline import Pipeline
import joblib
import os
import json

# Model directory
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# Available models (simple, reliable models)
MODEL_CLASSES = {
    'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
    'svm': SVC(kernel='rbf', probability=True, random_state=42),
    'logistic_regression': LogisticRegression(max_iter=1000, random_state=42)
}

# Global training state
training_status = {
    'in_progress': False,
    'progress': 0,
    'status_message': 'Idle'
}
training_results = {}

def get_sample_data():
    """Return sample DNS queries for testing"""
    return {
        'normal': [
            'google.com', 'youtube.com', 'github.com', 'stackoverflow.com',
            'wikipedia.org', 'amazon.com', 'twitter.com', 'linkedin.com'
        ],
        'suspicious': [
            '4n4l1z3r.xyz', 'data-exfil.attacker.com', 'c2-server.pwned.net',
            'malware.xyz', 'dns-tunnel.proxy.com', 'exfiltrate.xyz'
        ]
    }

def calculate_entropy(query):
    """Calculate Shannon entropy of a query"""
    if not query:
        return 0
    freq = {}
    for char in query:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0
    for count in freq.values():
        p = count / len(query)
        entropy -= p * (p.bit_length() if p > 0 else 0)
    return entropy

def simple_heuristic(query):
    """Fallback heuristic when model isn't trained"""
    entropy = calculate_entropy(query)
    length = len(query)
    num_dots = query.count('.')
    # Suspicious if: high entropy, long domain, or many subdomains
    return 1 if (entropy > 3.5 or length > 40 or num_dots > 3) else 0

def predict_queries(queries):
    """Predict if queries are normal or suspicious (uses best model)"""
    try:
        model_path = os.path.join(MODEL_DIR, 'best_model.joblib')
        predictions = []
        
        for query in queries:
            # Try to use trained model
            if os.path.exists(model_path):
                try:
                    model = joblib.load(model_path)
                    pred = model.predict([query])[0]
                    proba = model.predict_proba([query])[0]
                    
                    predictions.append({
                        'query': query,
                        'prediction': int(pred),
                        'confidence': float(max(proba)),
                        'label': 'Suspicious' if pred == 1 else 'Normal'
                    })
                    continue
                except:
                    pass  # Fall back to heuristic
            
            # Use heuristic fallback
            pred = simple_heuristic(query)
            confidence = 0.8 if pred == 1 else 0.7
            predictions.append({
                'query': query,
                'prediction': int(pred),
                'confidence': confidence,
                'label': 'Suspicious' if pred == 1 else 'Normal'
            })
        
        return {'predictions': predictions}
    except Exception as e:
        return {'error': str(e)}

def predict_queries_with_model(queries, model_name=None):
    """Predict using a specific model or the best one if not specified"""
    try:
        # If a specific model is requested, try to load it
        if model_name:
            model_path = os.path.join(MODEL_DIR, f'{model_name}.joblib')
            if not os.path.exists(model_path):
                # Try fallback to best model
                model_path = os.path.join(MODEL_DIR, 'best_model.joblib')
                if not os.path.exists(model_path):
                    return {'error': 'No model found. Please train first.'}
        else:
            # Use best model
            model_path = os.path.join(MODEL_DIR, 'best_model.joblib')
            if not os.path.exists(model_path):
                return {'error': 'No model trained yet. Please train first.'}
        
        model = joblib.load(model_path)
        predictions = []
        
        for query in queries:
            try:
                pred = model.predict([query])[0]
                proba = model.predict_proba([query])[0]
                
                predictions.append({
                    'query': query,
                    'prediction': int(pred),
                    'confidence': float(max(proba)),
                    'label': 'Suspicious' if pred == 1 else 'Normal'
                })
            except:
                # Fallback to heuristic
                pred = simple_heuristic(query)
                predictions.append({
                    'query': query,
                    'prediction': int(pred),
                    'confidence': 0.8 if pred == 1 else 0.7,
                    'label': 'Suspicious' if pred == 1 else 'Normal'
                })
        
        return {'predictions': predictions}
    except Exception as e:
        return {'error': str(e)}

def train_all_models(data_path):
    """Train all models on the provided dataset"""
    global training_status, training_results
    
    try:
        training_status = {'in_progress': True, 'progress': 0, 'status_message': 'Loading data...'}
        
        # Load data
        df = pd.read_csv(data_path)
        training_status['progress'] = 20
        training_status['status_message'] = 'Data loaded, preparing features...'
        
        # Prepare features and labels
        X = df['query'].values
        y = df['label'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        training_status['progress'] = 40
        training_status['status_message'] = 'Training models...'
        
        results = {}
        best_accuracy = 0
        best_model_name = None
        best_pipeline = None
        
        for idx, (name, clf) in enumerate(MODEL_CLASSES.items()):
            training_status['status_message'] = f'Training {name}...'
            training_status['progress'] = 40 + (idx * 15)
            
            # Create pipeline
            pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=10000, ngram_range=(1, 2))),
                ('clf', clf)
            ])
            
            # Train
            pipeline.fit(X_train, y_train)
            
            # Evaluate
            y_pred = pipeline.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Save individual model
            model_path = os.path.join(MODEL_DIR, f'{name}.joblib')
            joblib.dump(pipeline, model_path)
            
            # Store results
            results[name] = {'accuracy': accuracy}
            
            if accuracy > best_accuracy:
                best_accuracy = accuracy
                best_model_name = name
                best_pipeline = pipeline
        
        # Save best model
        if best_pipeline:
            model_path = os.path.join(MODEL_DIR, 'best_model.joblib')
            joblib.dump(best_pipeline, model_path)
            
            # Save model info
            model_info = {
                'best_model': best_model_name,
                'accuracy': best_accuracy,
                'all_models': results
            }
            with open(os.path.join(MODEL_DIR, 'model_info.json'), 'w') as f:
                json.dump(model_info, f, indent=2)
            
            training_results = model_info
        
        training_status = {
            'in_progress': False,
            'progress': 100,
            'status_message': 'Training complete!'
        }
        
        return {'success': True, 'results': training_results}
        
    except Exception as e:
        training_status = {
            'in_progress': False,
            'progress': 0,
            'status_message': f'Error: {str(e)}'
        }
        return {'success': False, 'error': str(e)}

def get_models():
    """List available trained models"""
    try:
        model_path = os.path.join(MODEL_DIR, 'model_info.json')
        if os.path.exists(model_path):
            with open(model_path, 'r') as f:
                info = json.load(f)
            return {'models': info.get('all_models', {})}
        return {'models': {}}
    except:
        return {'models': {}}

def get_results():
    """Get latest training results"""
    try:
        model_path = os.path.join(MODEL_DIR, 'model_info.json')
        if os.path.exists(model_path):
            with open(model_path, 'r') as f:
                return json.load(f)
        return {'error': 'No training results found'}
    except:
        return {'error': 'Failed to load results'}

def get_training_progress():
    """Get current training progress"""
    return training_status