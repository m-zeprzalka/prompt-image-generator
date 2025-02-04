"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generationTime, setGenerationTime] = useState(0);
  const [totalGenerationTime, setTotalGenerationTime] = useState(null);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setGenerationTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading]);

  const startGeneration = async () => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        // Jeśli model się ładuje, spróbujemy ponownie za 50 sekund
        if (response.status === 503) {
          setTimeout(startGeneration, 50000);
          return;
        }
        throw new Error(errorData.error || "Failed to generate image");
      }

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const blob = await response.blob();
      if (blob.size > 0) {
        setImageBlob(blob);
        setImageUrl(URL.createObjectURL(blob));
        setTotalGenerationTime(generationTime);
        setLoading(false);
      } else {
        // Jeśli otrzymaliśmy pusty blob, spróbujemy ponownie
        setTimeout(startGeneration, 50000);
      }
    } catch (error) {
      if (loading) {
        // Jeśli wciąż jesteśmy w trybie ładowania, spróbujemy ponownie
        setTimeout(startGeneration, 50000);
      }
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setErrorMessage("Please enter a valid prompt.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setImageUrl(null);
    setImageBlob(null);
    setTotalGenerationTime(null);
    setGenerationTime(0);

    startGeneration();
  };

  const handleDownload = () => {
    if (imageBlob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(imageBlob);
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <main>
      <div className="container">
        <h1>Prompt Image Generator</h1>
        <p>
          A simple image generator from prompts based on the{" "}
          <a
            href="https://huggingface.co/black-forest-labs/FLUX.1-dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            FLUX.1-dev
          </a>{" "}
          library, built with{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>{" "}
          by{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel
          </a>
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {loading && (
          <p className="status-message pulse">
            Generating image... ({generationTime}s)
          </p>
        )}

        {!loading && totalGenerationTime !== null && (
          <p className="success-message">
            Image generated in {totalGenerationTime} seconds!
          </p>
        )}

        {imageUrl && (
          <div className="image-container">
            <img
              src={imageUrl}
              alt="Generated result"
              className="generated-image"
            />
            <button onClick={handleDownload} className="download-button">
              Download Image
            </button>
          </div>
        )}

        <textarea
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="prompt-input"
          disabled={loading}
        />

        <button
          onClick={handleGenerateImage}
          disabled={loading}
          className="generate-button"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </div>
      <div className="bar">
        <p className="author">
          <a
            href="https://zeprzalka.pl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Michał Zeprzałka - 2025
          </a>
        </p>
      </div>
    </main>
  );
}
