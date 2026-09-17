# LicitUp — Radar SECOP (v1)

Primera versión real de la aplicación web de LicitUp. Busca procesos de
contratación pública ABIERTOS en SECOP II a partir de códigos UNSPSC y
palabras clave, y permite filtrar los resultados por modalidad,
departamento y valor base.

## Qué hay en esta carpeta

- `app/page.js` — la pantalla principal (lo que ves en el navegador): el
  formulario para configurar la búsqueda y la tabla de resultados.
- `app/api/radar/route.js` — la parte que corre en el servidor: recibe
  tu búsqueda, consulta la API pública de SECOP y devuelve los procesos
  encontrados. El navegador nunca habla directamente con SECOP, siempre
  pasa por aquí.
- `app/layout.js` y `app/globals.css` — el "marco" de la página (fuentes,
  colores, metadatos).
- `package.json` — la lista de piezas de software (dependencias) que
  necesita el proyecto para funcionar.
- `tailwind.config.js`, `postcss.config.js` — configuración del sistema
  de estilos visuales (Tailwind CSS).

## Cómo se publica

No hace falta instalar nada en tu computador. Subes esta carpeta a un
repositorio de GitHub y conectas ese repositorio con Vercel — Vercel
instala las piezas, compila el proyecto y lo publica automáticamente
cada vez que subas un cambio.

## Próximos pasos (después de esta v1)

- Conectar Supabase para guardar tu configuración de búsqueda de forma
  permanente (en vez de que viva solo en tu navegador) y para el sistema
  de usuarios, de cara a cuando esto se venda a otras personas.
- Construir el módulo "Evaluar" (cruce automático pliego vs. RUP).
- Construir el módulo "Construir" (armar la oferta).
- Construir el módulo "Gestionar contrato".
