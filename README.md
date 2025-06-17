# ai-docs-app
# AI-Powered Automated Documentation App

A full-stack web application that allows users to record voice input, transcribe it to text, generate AI summaries using Ollama, and export the results as PDF.

## Features

- 🎤 Voice recording using Web Speech API
- 📝 Real-time speech-to-text transcription
- 🤖 AI-powered summarization using local Ollama models
- ✏️ Editable transcribed text and summaries
- 📄 PDF export functionality
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with Vite + React frontend and Node.js backend

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running locally
3. **Mistral model** (or similar) downloaded in Ollama

### Setting up Ollama

1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Start Ollama service:
   ```bash
   ollama serve
   ```
3. Pull the required model:
   ```bash
   ollama pull mistral
   ```

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-documentation-app
```

### 2. Set up the Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Set up the Frontend
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Start Recording**: Click the "Start Recording" button and speak your content
2. **Stop Recording**: Click "Stop Recording" when finished
3. **Review Text**: The transcribed text will appear in the text area (editable)
4. **Generate Summary**: Click "Generate Summary" to create an AI-powered summary
5. **Edit Summary**: Modify the generated summary as needed
6. **Download PDF**: Click "Download PDF" to export the final summary

## Project Structure

```
ai-documentation-app/
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── App.css          # Styles with Tailwind
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/
│   ├── server.js            # Express server
│   ├── package.json
│   └── .env                 # Environment variables
└── README.md
```

## API Endpoints

### Backend API

- `GET /health` - Health check
- `GET /api/ollama-status` - Check Ollama connection and models
- `POST /api/summarize` - Generate summary from text

## Environment Variables

### Backend (.env)
```
PORT=3001
OLLAMA_URL=http://localhost:11434
MODEL_NAME=mistral
```

## Technologies Used

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **jsPDF** - PDF generation
- **Web Speech API** - Voice recognition

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Axios** - HTTP client for Ollama communication
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

## Troubleshooting

### Common Issues

1. **Speech Recognition Not Working**
   - Ensure you're using a supported browser (Chrome, Edge, Safari)
   - Allow microphone permissions when prompted

2. **Ollama Connection Failed**
   - Make sure Ollama is running: `ollama serve`
   - Check if the required model is available: `ollama list`
   - Verify the Ollama URL in the backend .env file

3. **CORS Issues**
   - Ensure both frontend and backend servers are running
   - Check that the backend CORS configuration allows the frontend origin

4. **PDF Generation Issues**
   - Check browser console for errors
   - Ensure there's content in the summary before downloading

## Development

### Running in Development Mode

1. Start Ollama service
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Open `http://localhost:3000` in your browser

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend