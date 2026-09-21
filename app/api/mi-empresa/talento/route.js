import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/mi-empresa/talento — devuelve todas las personas guardadas
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM mi_empresa_talento
      ORDER BY nombre_completo ASC NULLS LAST, id ASC
    `;
    return NextResponse.json({ personas: rows });
  } catch (error) {
    console.error('Error leyendo mi_empresa_talento:', error);
    return NextResponse.json(
      { error: 'No se pudo leer la lista de personas.' },
      { status: 500 }
    );
  }
}

// POST /api/mi-empresa/talento — crea una persona nueva, o la actualiza si mandas "id"
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      id = null,
      nombre_completo = null,
      tipo_num_documento = null,
      cargo_actual = null,
      tipo_vinculacion = null,
      profesion_pregrado = null,
      institucion = null,
      fecha_grado = null,
      posgrados = null,
      tarjeta_profesional = null,
      anios_experiencia_general = null,
      anios_experiencia_especifica = null,
      area_especialidad = null,
      certificaciones_principales = null,
      disponibilidad_porcentaje = null,
      acepta_ser_presentado = null,
      carta_compromiso_firmada = null,
      hoja_vida_disponible = null,
      diplomas_actas_disponibles = null,
      certificados_laborales_disponibles = null,
      observaciones = null,
    } = body;

    let row;

    if (id) {
      const { rows } = await sql`
        UPDATE mi_empresa_talento SET
          nombre_completo = ${nombre_completo},
          tipo_num_documento = ${tipo_num_documento},
          cargo_actual = ${cargo_actual},
          tipo_vinculacion = ${tipo_vinculacion},
          profesion_pregrado = ${profesion_pregrado},
          institucion = ${institucion},
          fecha_grado = ${fecha_grado},
          posgrados = ${posgrados},
          tarjeta_profesional = ${tarjeta_profesional},
          anios_experiencia_general = ${anios_experiencia_general},
          anios_experiencia_especifica = ${anios_experiencia_especifica},
          area_especialidad = ${area_especialidad},
          certificaciones_principales = ${certificaciones_principales},
          disponibilidad_porcentaje = ${disponibilidad_porcentaje},
          acepta_ser_presentado = ${acepta_ser_presentado},
          carta_compromiso_firmada = ${carta_compromiso_firmada},
          hoja_vida_disponible = ${hoja_vida_disponible},
          diplomas_actas_disponibles = ${diplomas_actas_disponibles},
          certificados_laborales_disponibles = ${certificados_laborales_disponibles},
          observaciones = ${observaciones},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *;
      `;
      row = rows[0];
    } else {
      const { rows } = await sql`
        INSERT INTO mi_empresa_talento (
          nombre_completo, tipo_num_documento, cargo_actual, tipo_vinculacion,
          profesion_pregrado, institucion, fecha_grado, posgrados, tarjeta_profesional,
          anios_experiencia_general, anios_experiencia_especifica, area_especialidad,
          certificaciones_principales, disponibilidad_porcentaje, acepta_ser_presentado,
          carta_compromiso_firmada, hoja_vida_disponible, diplomas_actas_disponibles,
          certificados_laborales_disponibles, observaciones
        ) VALUES (
          ${nombre_completo}, ${tipo_num_documento}, ${cargo_actual}, ${tipo_vinculacion},
          ${profesion_pregrado}, ${institucion}, ${fecha_grado}, ${posgrados}, ${tarjeta_profesional},
          ${anios_experiencia_general}, ${anios_experiencia_especifica}, ${area_especialidad},
          ${certificaciones_principales}, ${disponibilidad_porcentaje}, ${acepta_ser_presentado},
          ${carta_compromiso_firmada}, ${hoja_vida_disponible}, ${diplomas_actas_disponibles},
          ${certificados_laborales_disponibles}, ${observaciones}
        )
        RETURNING *;
      `;
      row = rows[0];
    }

    return NextResponse.json({ persona: row });
  } catch (error) {
    console.error('Error guardando mi_empresa_talento:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar la persona.' },
      { status: 500 }
    );
  }
}

// DELETE /api/mi-empresa/talento?id=123 — elimina una persona (y sus certificaciones, en cascada)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la persona a eliminar.' }, { status: 400 });
    }
    await sql`DELETE FROM mi_empresa_talento WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando mi_empresa_talento:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar la persona.' },
      { status: 500 }
    );
  }
}
