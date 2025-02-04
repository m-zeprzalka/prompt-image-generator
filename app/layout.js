import "./globals.scss";

export const metadata = {
  title: "AI Prompt Image Generator",
  description:
    "Generate high-quality images from text prompts using artificial intelligence.",
  keywords:
    "AI image generator, text to image, AI-powered art, Next.js, FLUX.1-dev, AI creativity, image creation",
  author: "Michał Zeprzałka",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
