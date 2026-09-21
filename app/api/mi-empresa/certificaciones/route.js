import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/mi-empresa/certificaciones — devuelve todas las certificaciones de la empresa guardadas
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM mi_empresa_certificaciones
      ORDER BY fecha_vencimiento ASC NULLS LAST, id ASC
    `;
    return NextResponse.json({ certificaciones: rows });
  } catch (error) {
    console.error('Error leyendo mi_empresa_certificaciones:', error);
    return NextResponse.json(
      { error: 'No se pudo leer la lista de certificaciones.' },
      { status: 500 }
    );
  }
}

// POST /api/mi-empresa/certificaciones — crea una certificación nueva, o la actualiza si mandas "id"
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      id = null,
      tipo = null,
      norma_programa_nombre = null,
      entidad_certificadora = null,
      alcance_nivel = null,
      fecha_emision = null,
      fecha_vencimiento = null,
      observaciones = null,
    } = body;

    let row;

    if (id) {
      const { rows } = await sql`
        UPDATE mi_empresa_certificaciones SET
          tipo = ${tipo},
          norma_programa_nombre = ${norma_programa_nombre},
          entidad_certificadora = ${entidad_certificadora},
          alcance_nivel = ${alcance_nivel},
          fecha_emision = ${fecha_emision},
          fecha_vencimiento = ${fecha_vencimiento},
          observaciones = ${observaciones},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *;
      `;
      row = rows[0];
    } else {
      const { rows } = await sql`
        INSERT INTO mi_empresa_certificaciones (
          tipo, norma_programa_nombre, entidad_certificadora, alcance_nivel,
          fecha_emision, fecha_vencimiento, observaciones
        ) VALUES (
          ${tipo}, ${norma_programa_nombre}, ${entidad_certificadora}, ${alcance_nivel},
          ${fecha_emision}, ${fecha_vencimiento}, ${observaciones}
        )
        RETURNING *;
      `;
      row = rows[0];
    }

    return NextResponse.json({ certificacion: row });
  } catch (error) {
    console.error('Error guardando mi_empresa_certificaciones:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar la certificación.' },
      { status: 500 }
    );
  }
}

// DELETE /api/mi-empresa/certificaciones?id=123 — elimina una certificación
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la certificación a eliminar.' }, { status: 400 });
    }
    await sql`DELETE FROM mi_empresa_certificaciones WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando mi_empresa_certificaciones:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar la certificación.' },
      { status: 500 }
    );
  }
}
