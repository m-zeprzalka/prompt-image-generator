# AI Prompt Image Generator | Generator Obrazów AI

[English](#english) | [Polski](#polish)

# <a name="english"></a>English

A modern web application that generates high-quality images from text descriptions using the FLUX.1-dev AI model. Built with Next.js and Hugging Face API.

![Project Screenshot](screenshot.png)

## 🚀 Features

- **Text-to-Image Generation**: Convert text descriptions into images using AI
- **Real-time Progress**: Monitor generation progress with a live timer
- **Image Download**: Easily download generated images
- **Error Handling**: Robust error handling with automatic retries
- **Responsive Design**: Works seamlessly on all devices
- **User-Friendly Interface**: Clean and intuitive user experience

## 🛠️ Technologies

- **Frontend**:
  - Next.js 14 (App Router)
  - React 18 (Hooks)
  - SCSS Modules
- **Backend**:
  - Next.js API Routes
  - Hugging Face API (FLUX.1-dev model)
- **Development**:
  - ESLint
  - Modern JavaScript (ES6+)
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (version 18.0 or higher)
- npm (usually comes with Node.js)
- Hugging Face API key ([Get it here](https://huggingface.co/black-forest-labs/FLUX.1-dev))

## 🔧 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/prompt-image-generator.git
cd prompt-image-generator
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

```env
HUGGINGFACE_API_KEY=your_api_key_here
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 💻 Usage Guide

1. **Entering Prompts**

   - Use the text area to describe your desired image
   - Be specific with details for better results
   - Examples of good prompts:
     - "A serene mountain landscape at sunset with snow-capped peaks"
     - "A futuristic cityscape with flying cars and neon lights"

2. **Generating Images**

   - Click the "Generate" button
   - Wait for the generation process (progress timer will show)
   - The system will automatically retry if any errors occur

3. **Downloading Images**
   - Preview the generated image
   - Click "Download Image" to save it locally
   - Images are saved in PNG format with timestamps

## ⚙️ Technical Details

### API Integration

The application uses a robust API integration system with:

- Automatic retry mechanism
- Error handling with detailed feedback
- Response validation
- Blob handling for image downloads

### Performance Optimizations

- Efficient state management
- Memory leak prevention
- Proper cleanup of resources
- Optimized image handling

## 📝 License

This project is licensed under the MIT License

## 👨‍💻 Author

Michał Zeprzałka

- Website: [zeprzalka.pl](https://zeprzalka.pl)
- GitHub: [@m-zeprzalka](https://github.com/m-zeprzalka)

---

# <a name="polish"></a>Polski

Nowoczesna aplikacja webowa generująca wysokiej jakości obrazy na podstawie opisów tekstowych przy użyciu modelu AI FLUX.1-dev. Zbudowana przy użyciu Next.js i API Hugging Face.

![Zrzut ekranu projektu](screenshot.png)

## 🚀 Funkcjonalności

- **Generowanie obrazów z tekstu**: Konwersja opisów tekstowych na obrazy przy użyciu AI
- **Postęp w czasie rzeczywistym**: Monitorowanie procesu generowania z licznikiem czasu
- **Pobieranie obrazów**: Łatwe pobieranie wygenerowanych obrazów
- **Obsługa błędów**: Zaawansowana obsługa błędów z automatycznymi ponownymi próbami
- **Responsywność**: Działa płynnie na wszystkich urządzeniach
- **Przyjazny interfejs**: Przejrzysty i intuicyjny UX

## 🛠️ Technologie

- **Frontend**:
  - Next.js 14 (App Router)
  - React 18 (Hooks)
  - SCSS Modules
- **Backend**:
  - Next.js API Routes
  - Hugging Face API (model FLUX.1-dev)
- **Development**:
  - ESLint
  - Modern JavaScript (ES6+)
- **Deployment**: Vercel

## 📋 Wymagania

Przed rozpoczęciem upewnij się, że masz:

- Node.js (wersja 18.0 lub wyższa)
- npm (zazwyczaj instalowany z Node.js)
- Klucz API Hugging Face ([Zdobądź tutaj](https://huggingface.co/black-forest-labs/FLUX.1-dev))

## 🔧 Instalacja

1. **Klonowanie repozytorium**

```bash
git clone https://github.com/yourusername/prompt-image-generator.git
cd prompt-image-generator
```

2. **Instalacja zależności**

```bash
npm install
```

3. **Konfiguracja zmiennych środowiskowych**
   Utwórz plik `.env.local` w głównym katalogu:

```env
HUGGINGFACE_API_KEY=twój_klucz_api
```

4. **Uruchomienie serwera deweloperskiego**

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## 💻 Instrukcja Użytkowania

1. **Wprowadzanie promptów**

   - Użyj pola tekstowego do opisania wybranego obrazu
   - Bądź szczegółowy w opisach dla lepszych rezultatów
   - Przykłady dobrych promptów:
     - "Górski krajobraz o zachodzie słońca ze śnieżnymi szczytami"
     - "Futurystyczne miasto z latającymi samochodami i neonowymi światłami"

2. **Generowanie obrazów**

   - Kliknij przycisk "Generate"
   - Poczekaj na proces generowania (widoczny licznik czasu)
   - System automatycznie ponowi próbę w przypadku błędów

3. **Pobieranie obrazów**
   - Zobacz podgląd wygenerowanego obrazu
   - Kliknij "Download Image" aby zapisać lokalnie
   - Obrazy są zapisywane w formacie PNG z oznaczeniem czasu

## ⚙️ Szczegóły Techniczne

### Integracja API

Aplikacja wykorzystuje zaawansowany system integracji API z:

- Mechanizmem automatycznych ponownych prób
- Szczegółową obsługą błędów
- Walidacją odpowiedzi
- Obsługą blob dla pobierania obrazów

### Optymalizacje wydajności

- Efektywne zarządzanie stanem
- Zapobieganie wyciekom pamięci
- Prawidłowe czyszczenie zasobów
- Zoptymalizowana obsługa obrazów

## 📝 Licencja

Ten projekt jest licencjonowany pod MIT License

## 👨‍💻 Autor

Michał Zeprzałka

- Website: [zeprzalka.pl](https://zeprzalka.pl)
- GitHub: [@m-zeprzalka](https://github.com/m-zeprzalka)
