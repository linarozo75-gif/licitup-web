import "./globals.css";

export const metadata = {
  title: "LicitUp — Radar SECOP",
  description: "Identificación automática de procesos de contratación pública abiertos en SECOP II.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}
