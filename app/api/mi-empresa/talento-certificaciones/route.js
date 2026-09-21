import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/mi-empresa/talento-certificaciones — devuelve todas las certificaciones,
// con el nombre de la persona ya incluido (para no tener que cruzarlo en el cliente).
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT c.*, t.nombre_completo AS persona_nombre
      FROM mi_empresa_talento_certificaciones c
      LEFT JOIN mi_empresa_talento t ON t.id = c.persona_id
      ORDER BY t.nombre_completo ASC NULLS LAST, c.id ASC
    `;
    return NextResponse.json({ certificaciones: rows });
  } catch (error) {
    console.error('Error leyendo mi_empresa_talento_certificaciones:', error);
    return NextResponse.json(
      { error: 'No se pudo leer la lista de certificaciones.' },
      { status: 500 }
    );
  }
}

// POST /api/mi-empresa/talento-certificaciones — crea una certificación nueva, o la actualiza si mandas "id"
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      id = null,
      persona_id = null,
      certificacion = null,
      entidad_emisora = null,
      fecha_expedicion = null,
      fecha_vencimiento = null,
      observaciones = null,
    } = body;

    let row;

    if (id) {
      const { rows } = await sql`
        UPDATE mi_empresa_talento_certificaciones SET
          persona_id = ${persona_id},
          certificacion = ${certificacion},
          entidad_emisora = ${entidad_emisora},
          fecha_expedicion = ${fecha_expedicion},
          fecha_vencimiento = ${fecha_vencimiento},
          observaciones = ${observaciones},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *;
      `;
      row = rows[0];
    } else {
      const { rows } = await sql`
        INSERT INTO mi_empresa_talento_certificaciones (
          persona_id, certificacion, entidad_emisora, fecha_expedicion, fecha_vencimiento, observaciones
        ) VALUES (
          ${persona_id}, ${certificacion}, ${entidad_emisora}, ${fecha_expedicion}, ${fecha_vencimiento}, ${observaciones}
        )
        RETURNING *;
      `;
      row = rows[0];
    }

    return NextResponse.json({ certificacion: row });
  } catch (error) {
    console.error('Error guardando mi_empresa_talento_certificaciones:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar la certificación.' },
      { status: 500 }
    );
  }
}

// DELETE /api/mi-empresa/talento-certificaciones?id=123 — elimina una certificación
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la certificación a eliminar.' }, { status: 400 });
    }
    await sql`DELETE FROM mi_empresa_talento_certificaciones WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando mi_empresa_talento_certificaciones:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar la certificación.' },
      { status: 500 }
    );
  }
}
