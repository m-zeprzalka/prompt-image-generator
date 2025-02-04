// app/api/generate/route.js
import { NextResponse } from "next/server";

// Funkcja pomocnicza do opóźnienia
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Funkcja do wykonania żądania z ponownymi próbami
async function fetchWithRetry(
  url,
  options,
  maxRetries = 3,
  initialDelay = 2000
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Dodajemy timeout do fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 sekund timeout dla pojedynczej próby

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Sprawdzamy status model loading
      if (response.status === 503) {
        const data = await response.json();
        if (data.estimated_time) {
          console.log(`Model loading, estimated time: ${data.estimated_time}`);
          await delay(Math.min(data.estimated_time * 1000, 40000)); // Maksymalnie 40 sekund czekania
          continue;
        }
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.log(
          `Attempt ${attempt + 1}/${maxRetries}: Status ${response.status}`
        );

        if (attempt < maxRetries - 1) {
          await delay(initialDelay * Math.pow(2, attempt));
          continue;
        }
        throw new Error(errorData);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (error.name === "AbortError") {
        console.log("Request timeout, will retry");
        // Zamiast rzucać błąd, pozwalamy na kolejną próbę
        if (attempt < maxRetries - 1) {
          await delay(initialDelay * Math.pow(2, attempt));
          continue;
        }
      }

      if (attempt < maxRetries - 1) {
        await delay(initialDelay * Math.pow(2, attempt));
      }
    }
  }

  // Jeśli wszystkie próby nie powiodły się, zwracamy specjalny status
  throw new Error("Model still initializing");
}

export async function POST(req) {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("Server configuration error");
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Please provide a prompt" },
        { status: 400 }
      );
    }

    console.log("Starting generation attempt with prompt:", prompt);

    try {
      const response = await fetchWithRetry(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("image")) {
        console.error("Unexpected content type:", contentType);
        return NextResponse.json(
          { error: "Invalid response from model" },
          { status: 500 }
        );
      }

      const imageData = await response.blob();
      if (!imageData || imageData.size === 0) {
        throw new Error("Empty response from API");
      }

      return new NextResponse(imageData, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    } catch (error) {
      // Jeśli błąd wskazuje na inicjalizację modelu, zwracamy 503
      if (
        error.message.includes("initializing") ||
        error.message.includes("loading")
      ) {
        return NextResponse.json(
          { error: "Model loading, retry needed" },
          { status: 503 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Generation failed",
        details: error.name === "AbortError" ? "Timeout" : error.message,
      },
      { status: error.name === "AbortError" ? 504 : 500 }
    );
  }
}
