import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/mi-empresa/accionistas — devuelve todos los accionistas guardados
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM mi_empresa_accionistas
      ORDER BY porcentaje_participacion DESC NULLS LAST, id ASC
    `;
    return NextResponse.json({ accionistas: rows });
  } catch (error) {
    console.error('Error leyendo mi_empresa_accionistas:', error);
    return NextResponse.json(
      { error: 'No se pudo leer la lista de accionistas.' },
      { status: 500 }
    );
  }
}

// POST /api/mi-empresa/accionistas — crea un accionista nuevo, o lo actualiza si mandas "id"
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      id = null,
      nombre_razon_social = null,
      tipo_documento = null,
      numero_documento = null,
      porcentaje_participacion = null,
      pais_domicilio = null,
      beneficiario_final = null,
      pep = null,
      servidor_publico_pariente = null,
      representante_legal_directivo = null,
      observaciones = null,
    } = body;

    let row;

    if (id) {
      const { rows } = await sql`
        UPDATE mi_empresa_accionistas SET
          nombre_razon_social = ${nombre_razon_social},
          tipo_documento = ${tipo_documento},
          numero_documento = ${numero_documento},
          porcentaje_participacion = ${porcentaje_participacion},
          pais_domicilio = ${pais_domicilio},
          beneficiario_final = ${beneficiario_final},
          pep = ${pep},
          servidor_publico_pariente = ${servidor_publico_pariente},
          representante_legal_directivo = ${representante_legal_directivo},
          observaciones = ${observaciones},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *;
      `;
      row = rows[0];
    } else {
      const { rows } = await sql`
        INSERT INTO mi_empresa_accionistas (
          nombre_razon_social, tipo_documento, numero_documento, porcentaje_participacion,
          pais_domicilio, beneficiario_final, pep, servidor_publico_pariente,
          representante_legal_directivo, observaciones
        ) VALUES (
          ${nombre_razon_social}, ${tipo_documento}, ${numero_documento}, ${porcentaje_participacion},
          ${pais_domicilio}, ${beneficiario_final}, ${pep}, ${servidor_publico_pariente},
          ${representante_legal_directivo}, ${observaciones}
        )
        RETURNING *;
      `;
      row = rows[0];
    }

    return NextResponse.json({ accionista: row });
  } catch (error) {
    console.error('Error guardando mi_empresa_accionistas:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar el accionista.' },
      { status: 500 }
    );
  }
}

// DELETE /api/mi-empresa/accionistas?id=123 — elimina un accionista
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Falta el id del accionista a eliminar.' }, { status: 400 });
    }
    await sql`DELETE FROM mi_empresa_accionistas WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando mi_empresa_accionistas:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar el accionista.' },
      { status: 500 }
    );
  }
}
