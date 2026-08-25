from flask import Flask, request, jsonify
from flask_cors import CORS
from model_utils import (
    get_sample_data, predict_queries, predict_queries_with_model,
    train_all_models, get_models, get_results, get_training_progress
)
import os
import tempfile
import pandas as pd

app = Flask(__name__)
CORS(app)

# ============ EXISTING ENDPOINTS ============

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'DNS Tunneling Detector API'
    })

@app.route('/api/models', methods=['GET'])
def list_models():
    return jsonify(get_models())

@app.route('/api/sample-data', methods=['GET'])
def sample_data():
    return jsonify(get_sample_data())

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'queries' not in data:
        return jsonify({'error': 'Missing queries parameter'}), 400
    
    queries = data.get('queries', [])
    if not queries:
        return jsonify({'error': 'Empty queries list'}), 400
    
    # Get the selected model (optional)
    model_name = data.get('model', None)
    
    # Use the updated function with model selection
    result = predict_queries_with_model(queries, model_name)
    
    if 'error' in result:
        return jsonify(result), 500
    
    return jsonify(result)

# ============ TRAINING ENDPOINT ============

@app.route('/api/train', methods=['POST'])
def train():
    # Check if training is in progress
    progress = get_training_progress()
    if progress.get('in_progress', False):
        return jsonify({'error': 'Training already in progress'}), 409
    
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be CSV format'}), 400
    
    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        # Validate CSV content
        df = pd.read_csv(temp_path)
        if 'query' not in df.columns or 'label' not in df.columns:
            os.unlink(temp_path)
            return jsonify({'error': 'CSV must contain "query" and "label" columns'}), 400
        
        # Train models
        result = train_all_models(temp_path)
        
        # Clean up
        os.unlink(temp_path)
        
        if result.get('success'):
            return jsonify(result['results']), 200
        else:
            return jsonify({'error': result.get('error', 'Training failed')}), 500
            
    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        return jsonify({'error': str(e)}), 500

# ============ VALIDATE CSV ENDPOINT ============

@app.route('/api/validate-csv', methods=['POST'])
def validate_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'valid': False, 'error': 'File must be CSV format'}), 400
    
    try:
        # Read CSV
        df = pd.read_csv(file)
        
        # Validate columns
        if 'query' not in df.columns or 'label' not in df.columns:
            return jsonify({
                'valid': False,
                'error': 'CSV must contain "query" and "label" columns'
            }), 400
        
        # Check labels are 0 or 1
        labels = df['label'].unique()
        if not all(label in [0, 1] for label in labels):
            return jsonify({
                'valid': False,
                'error': 'Labels must be 0 (normal) or 1 (suspicious)'
            }), 400
        
        # Return validation success
        return jsonify({
            'valid': True,
            'rows': len(df),
            'columns': df.columns.tolist(),
            'sample': df.head(5).to_dict('records')
        })
        
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 400

# ============ UPLOAD CSV ENDPOINT ============

@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be CSV format'}), 400
    
    try:
        df = pd.read_csv(file)
        
        if 'query' not in df.columns or 'label' not in df.columns:
            return jsonify({'error': 'CSV must contain "query" and "label" columns'}), 400
        
        return jsonify({
            'queries': df['query'].tolist(),
            'labels': df['label'].tolist(),
            'count': len(df)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ============ TRAINING PROGRESS & RESULTS ============

@app.route('/api/training-progress', methods=['GET'])
def training_progress():
    return jsonify(get_training_progress())

@app.route('/api/results', methods=['GET'])
def results():
    return jsonify(get_results())

@app.route('/')
def root():
    return jsonify({
        'name': 'DNS Tunneling Detector API',
        'version': '1.0.0',
        'endpoints': {
            'GET /api/health': 'Health check',
            'GET /api/models': 'List trained models',
            'GET /api/sample-data': 'Get sample queries',
            'POST /api/predict': 'Predict DNS queries (supports model selection)',
            'POST /api/train': 'Train models (CSV upload)',
            'POST /api/validate-csv': 'Validate CSV format',
            'POST /api/upload-csv': 'Upload and parse CSV',
            'GET /api/training-progress': 'Get training progress',
            'GET /api/results': 'Get training results'
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5003, host='0.0.0.0')