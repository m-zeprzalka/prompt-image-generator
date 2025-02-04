// app/api/generate/route.js
import { NextResponse } from "next/server";

// Funkcja pomocnicza do opóźnienia - używana w mechanizmie retry
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Funkcja do obsługi zapytań do API z mechanizmem ponownych prób
async function fetchWithRetry(
  url,
  options,
  maxRetries = 3,
  initialDelay = 2000
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Sprawdzamy, czy otrzymaliśmy odpowiedź
      if (!response.ok) {
        let errorText = await response.text();
        console.log(
          `Attempt ${attempt + 1} failed with status: ${response.status}`
        );
        console.log("Error response:", errorText);

        // Próbujemy sparsować tekst błędu jako JSON
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error || errorText;
        } catch (e) {
          // Jeśli nie możemy sparsować JSON, używamy tekstu jako jest
          console.log("Could not parse error as JSON");
        }

        if (response.status === 500 || response.status === 503) {
          if (attempt < maxRetries - 1) {
            const waitTime = initialDelay * Math.pow(2, attempt);
            console.log(`Waiting ${waitTime}ms before next attempt...`);
            await delay(waitTime);
            continue;
          }
        }

        throw new Error(errorText);
      }

      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed with error:`, error);
      lastError = error;

      if (attempt < maxRetries - 1) {
        const waitTime = initialDelay * Math.pow(2, attempt);
        await delay(waitTime);
      }
    }
  }

  throw lastError;
}

export async function POST(req) {
  try {
    // Sprawdzamy klucz API
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("API Key is missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Pobieramy i walidujemy prompt
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Starting image generation with prompt:", prompt);

    // Wywołujemy API z obsługą retry
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

    // Sprawdzamy typ zawartości odpowiedzi
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("image")) {
      console.error("Unexpected content type:", contentType);
      return NextResponse.json(
        { error: "Invalid response from image generation service" },
        { status: 500 }
      );
    }

    const imageData = await response.blob();
    if (!imageData || imageData.size === 0) {
      throw new Error("Empty image response received");
    }

    return new NextResponse(imageData, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
