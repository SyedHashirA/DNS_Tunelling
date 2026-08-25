import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Detection = () => {
  const [queries, setQueries] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  // Fetch available models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/models');
      console.log('Models response:', response.data);
      
      // Handle different response formats
      let models = [];
      let modelAccuracies = {};
      
      if (response.data) {
        if (response.data.models) {
          // Format: { models: { model_name: { accuracy: 0.95 } } }
          models = Object.keys(response.data.models);
          modelAccuracies = response.data.models;
        } else if (Array.isArray(response.data)) {
          models = response.data;
        } else {
          models = Object.keys(response.data);
          modelAccuracies = response.data;
        }
      }
      
      setAvailableModels(models);
      setModelInfo(modelAccuracies);
      
      // Set default selection to best model or first available
      if (models.length > 0) {
        // Check if there's a best model indicated
        const resultsResponse = await axios.get('http://localhost:5003/api/results');
        if (resultsResponse.data && resultsResponse.data.best_model) {
          setSelectedModel(resultsResponse.data.best_model);
        } else {
          setSelectedModel(models[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('Failed to load models');
    }
  };

  const handlePredict = async () => {
    if (!queries.trim()) {
      setError('Please enter at least one DNS query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Split queries by newline or comma
      const queryList = queries.split(/[\n,]+/).filter(q => q.trim());
      
      // Send request with selected model
      const response = await axios.post('http://localhost:5003/api/predict', {
        queries: queryList,
        model: selectedModel || undefined  // Send model if selected
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResults(response.data);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.error || 'Failed to get predictions');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleQueries = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/sample-data');
      const sampleData = response.data;
      const allQueries = [
        ...(sampleData.normal || []),
        ...(sampleData.suspicious || [])
      ];
      setQueries(allQueries.join('\n'));
    } catch (err) {
      console.error('Error loading sample queries:', err);
      setError('Failed to load sample queries');
    }
  };

  // Helper to format model name for display
  const formatModelName = (name) => {
    return name.replace(/_/g, ' ').toUpperCase();
  };

  // Helper to get model accuracy
  const getModelAccuracy = (name) => {
    if (modelInfo && modelInfo[name] && modelInfo[name].accuracy) {
      return `${(modelInfo[name].accuracy * 100).toFixed(1)}%`;
    }
    return 'N/A';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">DNS Query Detection</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-gray-400">Available Models</p>
          <p className="text-xl font-bold text-cyan-450">{availableModels.length}</p>
          <p className="text-xs text-gray-500">{availableModels.map(formatModelName).join(', ') || 'None'}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-gray-400">Total Queries</p>
          <p className="text-xl font-bold text-white">{queries.split(/[\n,]+/).filter(q => q.trim()).length}</p>
          <p className="text-xs text-gray-500">Ready for detection</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-gray-400">Status</p>
          <p className="text-xl font-bold text-white">{loading ? 'Processing...' : 'Ready'}</p>
          <p className="text-xs text-gray-500">{loading ? 'Please wait' : 'Select a model below'}</p>
        </div>
      </div>

      {/* Model Selection Dropdown - FIXED WIDTH */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-450 focus:border-transparent"
              style={{ 
                minWidth: '280px',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {availableModels.length === 0 ? (
                <option value="">No models available — please train first</option>
              ) : (
                availableModels.map((model) => (
                  <option key={model} value={model}>
                    {formatModelName(model)} — Accuracy: {getModelAccuracy(model)}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="text-sm text-gray-400 flex-shrink-0">
            {selectedModel && (
              <span>
                Using: <span className="text-cyan-450 font-semibold">{formatModelName(selectedModel)}</span>
                {modelInfo && modelInfo[selectedModel] && (
                  <span className="ml-2 text-green-400">
                    (Accuracy: {getModelAccuracy(selectedModel)})
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Enter DNS Queries</h2>
          <button
            onClick={loadSampleQueries}
            className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition text-sm flex-shrink-0"
          >
            Load Sample Queries
          </button>
        </div>

        <textarea
          value={queries}
          onChange={(e) => setQueries(e.target.value)}
          placeholder="Enter DNS queries (one per line or comma separated)"
          className="w-full h-40 p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-450 focus:border-transparent"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handlePredict}
            disabled={loading || !queries.trim() || availableModels.length === 0}
            className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
              loading || !queries.trim() || availableModels.length === 0
                ? 'bg-slate-700 cursor-not-allowed text-gray-400'
                : 'bg-cyan-450 hover:bg-cyan-600 text-slate-900'
            }`}
          >
            {loading ? 'Detecting...' : 'Detect Tunneling'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results && results.predictions && (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Detection Results</h2>
            <span className="text-sm text-gray-400">
              Model: <span className="text-cyan-450">{formatModelName(selectedModel)}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Query</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Confidence</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Prediction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {results.predictions.map((result, index) => (
                  <tr key={index} className="hover:bg-slate-700/30">
                    <td className="px-4 py-2 text-sm font-mono text-gray-300">{result.query}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.prediction === 1
                          ? 'bg-red-900/50 text-red-400 border border-red-700'
                          : 'bg-green-900/50 text-green-400 border border-green-700'
                      }`}>
                        {result.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-300">
                      {(result.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-300">
                      {result.prediction === 1 ? '🚨 Suspicious' : '✅ Normal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detection;