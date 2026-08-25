import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Models = () => {
  const [file, setFile] = useState(null);
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch results on component mount
  useEffect(() => {
    fetchResults();
  }, []);

  // Poll training progress
  useEffect(() => {
    let interval = null;
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes max (300 * 1 second)

    if (training) {
      console.log('Starting training progress polling...');
      interval = setInterval(async () => {
        attempts++;
        try {
          const response = await axios.get('http://localhost:5003/api/training-progress');
          const data = response.data;
          console.log('Progress update:', data);
          
          setProgress(data.progress || 0);
          setStatusMessage(data.status_message || 'Training...');
          
          // Check if training is complete
          if (!data.in_progress && data.progress === 100) {
            console.log('Training complete!');
            setTraining(false);
            setIsLoading(false);
            
            // Fetch results
            await fetchResults();
            
            // Clear interval
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
          
          // Safety timeout - stop polling after max attempts
          if (attempts >= maxAttempts) {
            console.log('Max polling attempts reached, stopping...');
            setTraining(false);
            setIsLoading(false);
            setError('Training is taking too long. Please check the backend.');
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          }
        } catch (err) {
          console.error('Error fetching progress:', err);
          // Don't stop on error, keep trying
        }
      }, 1000);
    }
    
    // Cleanup interval on unmount or when training stops
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, [training]);

  const fetchResults = async () => {
    try {
      console.log('Fetching results...');
      const response = await axios.get('http://localhost:5003/api/results');
      console.log('Results response:', response.data);
      
      if (response.data && !response.data.error) {
        setResults(response.data);
      } else {
        setError('No training results found');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to fetch results');
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      console.log('File selected:', selectedFile.name);
    }
  };

  const handleTrainModels = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError(null);
    setIsLoading(true);
    setTraining(true);
    setProgress(0);
    setStatusMessage('Starting training...');
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // First validate the CSV
      console.log('Validating CSV...');
      const validateResponse = await axios.post(
        'http://localhost:5003/api/validate-csv',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('Validation response:', validateResponse.data);

      if (!validateResponse.data.valid) {
        setError(validateResponse.data.error || 'Invalid CSV format');
        setTraining(false);
        setIsLoading(false);
        return;
      }

      // Then start training
      console.log('Starting training...');
      const trainResponse = await axios.post(
        'http://localhost:5003/api/train',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('Train response:', trainResponse.data);

      if (trainResponse.data.error) {
        setError(trainResponse.data.error);
        setTraining(false);
        setIsLoading(false);
      } else {
        // Training started successfully
        setStatusMessage('Training in progress...');
        // The polling interval will handle the rest
      }
    } catch (err) {
      console.error('Training error:', err);
      setError(err.response?.data?.error || 'Failed to train models');
      setTraining(false);
      setIsLoading(false);
    }
  };

  const loadSampleDataset = async () => {
    try {
      const sampleData = [
        'query,label',
        'google.com,0',
        'youtube.com,0',
        'github.com,0',
        'stackoverflow.com,0',
        'wikipedia.org,0',
        'amazon.com,0',
        'twitter.com,0',
        'linkedin.com,0',
        '4n4l1z3r.xyz,1',
        'data-exfil.attacker.com,1',
        'c2-server.pwned.net,1',
        'malware.xyz,1',
        'dns-tunnel.proxy.com,1',
        'exfiltrate.xyz,1',
        'hacker.space,1'
      ].join('\n');
      
      const blob = new Blob([sampleData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dns_samples.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error loading sample:', err);
      setError('Failed to load sample dataset');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Model Training</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Training Progress */}
      {training && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-cyan-450">{statusMessage}</span>
            <span className="text-cyan-450">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
              className="bg-cyan-450 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upload Training Data</h2>
        <p className="text-gray-400 mb-4 text-sm">
          Upload a CSV file with <code className="bg-slate-900 px-2 py-1 rounded text-cyan-450">query</code> and <code className="bg-slate-900 px-2 py-1 rounded text-cyan-450">label</code> columns.
          <br />
          Labels: <span className="text-green-400">0 = Normal</span>, <span className="text-red-400">1 = Suspicious</span>
        </p>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-cyan-450 hover:file:bg-slate-600"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: <span className="font-medium text-white">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadSampleDataset}
              className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition text-sm"
            >
              Download Sample CSV
            </button>
            <button
              onClick={handleTrainModels}
              disabled={!file || training || isLoading}
              className={`px-6 py-2 rounded-lg font-semibold transition text-sm ${
                !file || training || isLoading
                  ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  : 'bg-cyan-450 hover:bg-cyan-600 text-slate-900'
              }`}
            >
              {isLoading ? 'Starting...' : training ? 'Training...' : 'Train Models'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && results.all_models && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Training Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
              <p className="text-sm text-gray-400">Best Model</p>
              <p className="text-xl font-bold text-green-400">
                {results.best_model ? results.best_model.replace(/_/g, ' ').toUpperCase() : 'N/A'}
              </p>
            </div>
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
              <p className="text-sm text-gray-400">Accuracy</p>
              <p className="text-xl font-bold text-blue-400">
                {results.accuracy ? `${(results.accuracy * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700">
              <p className="text-sm text-gray-400">Models Trained</p>
              <p className="text-xl font-bold text-purple-400">
                {Object.keys(results.all_models || {}).length}
              </p>
            </div>
          </div>

          <h3 className="font-semibold text-gray-300 mb-3">Model Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Model</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Accuracy</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {Object.entries(results.all_models || {}).map(([name, metrics]) => (
                  <tr key={name} className="hover:bg-slate-700/30">
                    <td className="px-4 py-2 text-sm font-medium text-gray-300">
                      {name.replace(/_/g, ' ').toUpperCase()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-300">
                      {metrics.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      {name === results.best_model ? (
                        <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-xs font-semibold border border-green-700">
                          ✅ Best
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-700 text-gray-400 rounded-full text-xs">
                          Trained
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!results && !training && !error && (
        <div className="bg-slate-800/30 rounded-lg p-12 text-center border-2 border-dashed border-slate-700">
          <p className="text-gray-400 text-lg">
            No models trained yet.
            <br />
            <span className="text-sm">Upload a CSV file and click "Train Models" to get started.</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Models;