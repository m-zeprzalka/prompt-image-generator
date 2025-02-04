"use client";

import { useState, useEffect } from "react";

export default function Home() {
  // Podstawowe stany aplikacji
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBlob, setImageBlob] = useState(null); // Nowy stan dla przechowywania blob'a
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generationTime, setGenerationTime] = useState(0);
  const [totalGenerationTime, setTotalGenerationTime] = useState(null);

  // Efekt licznika czasu
  useEffect(() => {
    let timer;
    if (loading) {
      setGenerationTime(0);
      timer = setInterval(() => {
        setGenerationTime((prev) => prev + 1);
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading]);

  // Funkcja do pobierania obrazu
  const handleDownload = () => {
    if (imageBlob) {
      // Tworzymy tymczasowy link do pobrania
      const link = document.createElement("a");
      link.href = URL.createObjectURL(imageBlob);
      link.download = `generated-image-${Date.now()}.png`; // Unikalna nazwa pliku
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Czyszczenie URL
    }
  };

  // Główna funkcja generowania obrazu
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setErrorMessage("Please enter a valid prompt.");
      return;
    }

    // Reset stanów
    setLoading(true);
    setErrorMessage("");
    setImageUrl(null);
    setImageBlob(null);
    setTotalGenerationTime(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image.");
      }

      const blob = await response.blob();
      // Zapisujemy blob do pobrania
      setImageBlob(blob);
      // Tworzymy URL dla wyświetlenia
      setImageUrl(URL.createObjectURL(blob));
      setTotalGenerationTime(Math.floor((Date.now() - startTime) / 1000));
    } catch (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
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

        {/* Status generowania z licznikiem czasu */}
        {loading && (
          <p className="status-message pulse">
            Generating image... ({generationTime}s)
          </p>
        )}

        {/* Informacja o czasie wygenerowania */}
        {!loading && totalGenerationTime !== null && (
          <p className="success-message">
            Image generated in {totalGenerationTime} seconds!
          </p>
        )}

        {/* Wygenerowany obraz i przycisk pobierania */}
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

        {/* Przycisk generowania bez licznika */}
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
