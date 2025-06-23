'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevAudioUrl = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    // Revoke the previous object URL if it exists
    if (prevAudioUrl.current && prevAudioUrl.current !== audioUrl) {
      URL.revokeObjectURL(prevAudioUrl.current);
    }
    prevAudioUrl.current = audioUrl;

    // Cleanup on unmount
    return () => {
      if (prevAudioUrl.current) {
        URL.revokeObjectURL(prevAudioUrl.current);
      }
    };
  }, [audioUrl]);


  const isAudio = (file: File) =>
    file.type === 'audio/mpeg' || file.type === 'audio/wav';

  const handleFile = (selected: File) => {
    if (isAudio(selected)) {
      setFile(selected);
      setAudioUrl(URL.createObjectURL(selected));
    } else {
      alert('Please upload an .mp3 or .wav audio file.');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('https://feedback-ai-backend-zhkk.onrender.com', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to process audio');
      const data = await res.json();
      setFeedback(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Upload or Drag-and-Drop Audio File</h1>
      <div
        className={`${styles.dropZone} ${dragActive ? styles.active : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        aria-label="Audio file drop zone"
      >
        <p>Drag & drop your <b>.mp3</b> or <b>.wav</b> file here</p>
        <span>or</span>
        <button
          type="button"
          className={styles.browseBtn}
          onClick={() => inputRef.current?.click()}
        >
          Browse Files
        </button>
        
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>
      
      {audioUrl && (
        <div className={styles.audioPreview}>
          <p>Preview:</p>
          <audio controls src={audioUrl} />
          <button
            type="button"
            className={styles.browseBtn}
            onClick={handleProcess}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Process'}
          </button>
        </div>
      )}
      {error && (
        <div style={{ color: 'red', marginTop: 12 }}>{error}</div>
      )}
      {feedback && (
        <div style={{ marginTop: 20, textAlign: 'left', background: '#f3f4f6', borderRadius: 8, padding: 16 }}>
          <h3>Feedback</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(feedback, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
