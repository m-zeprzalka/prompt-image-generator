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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 7; // Maksymalna liczba prób (350 sekund)
  const RETRY_INTERVAL = 50000; // 50 sekund między próbami

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setGenerationTime((prev) => {
          const newTime = prev + 1;
          // Jeśli przekroczymy limit czasu (250 sekund), przerywamy
          if (newTime > 250) {
            setLoading(false);
            setErrorMessage(
              "Generation timeout - model is taking too long to respond"
            );
            return prev;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading]);

  const startGeneration = async () => {
    if (retryCount >= MAX_RETRIES) {
      setLoading(false);
      setErrorMessage("Maximum retry attempts reached. Please try again.");
      return;
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      // Sprawdzamy typ odpowiedzi
      const contentType = response.headers.get("content-type");

      // Jeśli otrzymamy błąd 504, próbujemy ponownie
      if (response.status === 504) {
        console.log(
          `Attempt ${
            retryCount + 1
          }/${MAX_RETRIES}: Server timeout, retrying...`
        );
        setRetryCount((prev) => prev + 1);
        setTimeout(startGeneration, RETRY_INTERVAL);
        return;
      }

      // Jeśli otrzymamy JSON, sprawdzamy czy to błąd
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        if (response.status === 503) {
          setRetryCount((prev) => prev + 1);
          setTimeout(startGeneration, RETRY_INTERVAL);
          return;
        }
        throw new Error(errorData.error || "Failed to generate image");
      }

      // Jeśli odpowiedź nie jest OK i nie jest to JSON
      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      // Jeśli wszystko OK, przetwarzamy obraz
      const blob = await response.blob();
      if (blob.size > 0) {
        setImageBlob(blob);
        setImageUrl(URL.createObjectURL(blob));
        setTotalGenerationTime(generationTime);
        setLoading(false);
      } else {
        // Pusty blob, próbujemy ponownie
        setRetryCount((prev) => prev + 1);
        setTimeout(startGeneration, RETRY_INTERVAL);
      }
    } catch (error) {
      if (loading && retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        setTimeout(startGeneration, RETRY_INTERVAL);
      } else {
        setLoading(false);
        setErrorMessage(error.message || "An unexpected error occurred");
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
    setRetryCount(0);

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
