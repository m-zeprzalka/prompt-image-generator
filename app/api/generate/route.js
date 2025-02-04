// app/api/generate/route.js
import { NextResponse } from "next/server";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 sekund timeout

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
          await delay(Math.min(data.estimated_time * 1000, 45000)); // Maksymalnie 45 sekund czekania
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
        throw new Error(
          "Generation timeout - please try again with a simpler prompt"
        );
      }

      if (attempt < maxRetries - 1) {
        await delay(initialDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
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

    // Dodajemy timeout dla całej operacji
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Generation timeout")), 55000)
    );

    const generationPromise = fetchWithRetry(
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

    // Używamy Promise.race aby obsłużyć timeout
    const response = await Promise.race([generationPromise, timeoutPromise]);

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
    console.error("Error in API route:", error);
    return NextResponse.json(
      {
        error: error.message || "Generation failed",
        details: error.name === "AbortError" ? "Timeout" : error.message,
      },
      { status: error.name === "AbortError" ? 504 : 500 }
    );
  }
}
