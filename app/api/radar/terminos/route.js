import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/radar/terminos — devuelve todos los códigos UNSPSC y palabras clave guardados
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM radar_terminos
      ORDER BY tipo ASC, valor ASC, id ASC
    `;
    return NextResponse.json({ terminos: rows });
  } catch (error) {
    console.error('Error leyendo radar_terminos:', error);
    return NextResponse.json(
      { error: 'No se pudo leer la lista de términos.' },
      { status: 500 }
    );
  }
}

// POST /api/radar/terminos — crea un término nuevo ({ tipo, valor })
export async function POST(request) {
  try {
    const body = await request.json();
    const tipo = body.tipo === 'unspsc' ? 'unspsc' : 'palabra_clave';
    const valor = (body.valor ?? '').toString().trim();

    if (!valor) {
      return NextResponse.json({ error: 'El valor no puede estar vacío.' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO radar_terminos (tipo, valor)
      VALUES (${tipo}, ${valor})
      RETURNING *
    `;
    return NextResponse.json({ termino: rows[0] });
  } catch (error) {
    console.error('Error guardando radar_terminos:', error);
    return NextResponse.json({ error: 'No se pudo guardar el término.' }, { status: 500 });
  }
}

// DELETE /api/radar/terminos?id=123 — elimina un término
export async function DELETE(request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Falta el id a eliminar.' }, { status: 400 });
    }
    await sql`DELETE FROM radar_terminos WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando radar_terminos:', error);
    return NextResponse.json({ error: 'No se pudo eliminar el término.' }, { status: 500 });
  }
}
