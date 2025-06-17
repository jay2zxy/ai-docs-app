import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './App.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [recognition, setRecognition] = useState(null);

  // Check Ollama status on component mount
  useEffect(() => {
    checkOllamaStatus();
    initializeSpeechRecognition();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ollama-status`);
      setOllamaStatus(response.data);
    } catch (error) {
      console.error('Failed to check Ollama status:', error);
      setOllamaStatus({ connected: false, error: 'Failed to connect to backend' });
    }
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscribedText(prev => prev + finalTranscript);
        }

        setInterimText(interimTranscript);
      };

      recognitionInstance.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition not supported in this browser');
    }
  };

  const startRecording = () => {
    if (recognition) {
      setError('');
      setTranscribedText('');
      setSummary('');
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const generateSummary = async () => {
    if (!transcribedText.trim()) {
      setError('Please record some text first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/summarize`, {
        text: transcribedText
      });

      if (response.data.success) {
        setSummary(response.data.summary);
      } else {
        setError('Failed to generate summary');
      }
    } catch (error) {
      console.error('Summary error:', error);
      setError(error.response?.data?.error || 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!summary.trim()) {
      setError('No summary to download');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-Generated Summary', margin, 30);

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 45);

    // Original text section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Original Text:', margin, 65);

    doc.setFont('helvetica', 'normal');
    const originalTextLines = doc.splitTextToSize(transcribedText, maxWidth);
    doc.text(originalTextLines, margin, 75);

    // Summary section
    const summaryStartY = 75 + originalTextLines.length * 5 + 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', margin, summaryStartY);

    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(summary, maxWidth);
    doc.text(summaryLines, margin, summaryStartY + 10);

    doc.save('summary.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI-Powered Documentation App
        </h1>

        {/* Ollama Status */}
        <div className="mb-6 p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">System Status</h2>
          {ollamaStatus ? (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${ollamaStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${ollamaStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Ollama: {ollamaStatus.connected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {ollamaStatus.connected && (
                <div className={`flex items-center gap-2 ${ollamaStatus.hasRequiredModel ? 'text-green-600' : 'text-yellow-600'}`}>
                  <div className={`w-3 h-3 rounded-full ${ollamaStatus.hasRequiredModel ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>Model ({ollamaStatus.requiredModel}): {ollamaStatus.hasRequiredModel ? 'Available' : 'Not found'}</span>
                </div>
              )}
              {!ollamaStatus.connected && (
                <p className="text-sm text-gray-600 mt-2">
                  Make sure Ollama is running: <code className="bg-gray-200 px-2 py-1 rounded">ollama serve</code>
                </p>
              )}
            </div>
          ) : (
            <p>Checking status...</p>
          )}
        </div>

        {/* Recording Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Voice Recording</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-lg font-medium ${isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
                } transition-colors`}
              disabled={!recognition}
            >
              {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
            </button>
            {transcribedText && (
              <button
                onClick={generateSummary}
                disabled={isLoading || !ollamaStatus?.connected}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Generating...' : '✨ Generate Summary'}
              </button>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording in progress...</span>
            </div>
          )}
        </div>

        {isRecording && interimText && (
          <div className="bg-gray-100 p-4 rounded-lg text-gray-700 mb-4">
            <h3 className="font-medium mb-2">🗣️ Currently Speaking...</h3>
            <p className="italic">{interimText}</p>
          </div>
        )}

        {/* Transcribed Text */}
        {transcribedText && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Transcribed Text</h2>
            <textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your transcribed text will appear here..."
            />
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">AI-Generated Summary</h2>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="AI-generated summary will appear here..."
            />
            <button
              onClick={downloadPDF}
              className="mt-4 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              📄 Download PDF
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Ensure Ollama is running locally with the mistral model</li>
            <li>Click "Start Recording" and speak your content</li>
            <li>Click "Stop Recording" when finished</li>
            <li>Review and edit the transcribed text if needed</li>
            <li>Click "Generate Summary" to create an AI summary</li>
            <li>Edit the summary as needed and download as PDF</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;