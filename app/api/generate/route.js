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
      const response = await fetch(url, options);

      // Jeśli otrzymamy 500 lub 503, próbujemy ponownie
      if (response.status === 500 || response.status === 503) {
        const errorData = await response.text();
        console.log(
          `Próba ${attempt + 1}/${maxRetries}: Status ${
            response.status
          }. Oczekiwanie...`
        );

        if (attempt < maxRetries - 1) {
          await delay(initialDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }
        throw new Error(errorData);
      }

      return response;
    } catch (error) {
      console.error(
        `Próba ${attempt + 1}/${maxRetries} nie powiodła się:`,
        error
      );
      lastError = error;

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
      throw new Error("Empty API Key");
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { message: "Please provide a prompt" },
        { status: 400 }
      );
    }

    console.log("Sending prompt to Hugging Face...");

    // Używamy funkcji fetchWithRetry zamiast zwykłego fetch
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Hugging Face API error:", errorData);

      // Szczegółowa informacja o błędzie
      let errorMessage = "Error connecting to Hugging Face API";
      try {
        const parsedError = JSON.parse(errorData);
        errorMessage = parsedError.error || errorMessage;
      } catch (e) {
        // Jeśli nie możemy sparsować JSON, używamy oryginalnego tekstu
        errorMessage = errorData;
      }

      return NextResponse.json(
        {
          message: "API Error",
          details: errorMessage,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const imageData = await response.blob();
    if (!imageData || imageData.size === 0) {
      throw new Error("Empty image response from API");
    }

    return new NextResponse(imageData, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        message: "Generation failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
