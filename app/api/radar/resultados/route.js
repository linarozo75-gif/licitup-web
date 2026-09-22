import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/radar/resultados — devuelve los procesos encontrados en la última
// actualización del radar (solo lectura: los resultados los escribe el motor
// de actualización, no se editan a mano).
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM radar_resultados
      ORDER BY fecha_publicacion DESC NULLS LAST, id ASC
    `;
    const ultimaActualizacion = rows.length > 0 ? rows[0].actualizado_en : null;
    return NextResponse.json({ resultados: rows, ultima_actualizacion: ultimaActualizacion });
  } catch (error) {
    console.error('Error leyendo radar_resultados:', error);
    return NextResponse.json(
      { error: 'No se pudo leer los resultados del radar.' },
      { status: 500 }
    );
  }
}
