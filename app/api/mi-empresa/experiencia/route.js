import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/mi-empresa/experiencia — devuelve todos los contratos guardados
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM mi_empresa_experiencia
      ORDER BY fecha_terminacion DESC NULLS LAST, id DESC
    `;
    return NextResponse.json({ experiencia: rows });
  } catch (error) {
    console.error('Error leyendo mi_empresa_experiencia:', error);
    return NextResponse.json(
      { error: 'No se pudo leer la lista de experiencia.' },
      { status: 500 }
    );
  }
}

// POST /api/mi-empresa/experiencia — crea un contrato nuevo, o lo actualiza si mandas "id"
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      id = null,
      numero_consecutivo_rup = null,
      cliente_entidad = null,
      tipo_cliente = null,
      numero_referencia_contrato = null,
      objeto_exacto = null,
      actividades_alcance = null,
      valor_inicial = null,
      adiciones = null,
      valor_final = null,
      valor_smmlv = null,
      fecha_inicio = null,
      fecha_terminacion = null,
      estado_contrato = null,
      unspsc_codigos = null,
      ejecutado_ut_consorcio = null,
      porcentaje_participacion = null,
      valor_final_ponderado = null,
      cantidades_ejecutadas = null,
      persona_certifica = null,
      certificacion_firmada = null,
      etiquetas_tematicas = null,
    } = body;

    let row;

    if (id) {
      const { rows } = await sql`
        UPDATE mi_empresa_experiencia SET
          numero_consecutivo_rup = ${numero_consecutivo_rup},
          cliente_entidad = ${cliente_entidad},
          tipo_cliente = ${tipo_cliente},
          numero_referencia_contrato = ${numero_referencia_contrato},
          objeto_exacto = ${objeto_exacto},
          actividades_alcance = ${actividades_alcance},
          valor_inicial = ${valor_inicial},
          adiciones = ${adiciones},
          valor_final = ${valor_final},
          valor_smmlv = ${valor_smmlv},
          fecha_inicio = ${fecha_inicio},
          fecha_terminacion = ${fecha_terminacion},
          estado_contrato = ${estado_contrato},
          unspsc_codigos = ${unspsc_codigos},
          ejecutado_ut_consorcio = ${ejecutado_ut_consorcio},
          porcentaje_participacion = ${porcentaje_participacion},
          valor_final_ponderado = ${valor_final_ponderado},
          cantidades_ejecutadas = ${cantidades_ejecutadas},
          persona_certifica = ${persona_certifica},
          certificacion_firmada = ${certificacion_firmada},
          etiquetas_tematicas = ${etiquetas_tematicas},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *;
      `;
      row = rows[0];
    } else {
      const { rows } = await sql`
        INSERT INTO mi_empresa_experiencia (
          numero_consecutivo_rup, cliente_entidad, tipo_cliente, numero_referencia_contrato,
          objeto_exacto, actividades_alcance, valor_inicial, adiciones, valor_final, valor_smmlv,
          fecha_inicio, fecha_terminacion, estado_contrato, unspsc_codigos,
          ejecutado_ut_consorcio, porcentaje_participacion, valor_final_ponderado,
          cantidades_ejecutadas, persona_certifica, certificacion_firmada, etiquetas_tematicas
        ) VALUES (
          ${numero_consecutivo_rup}, ${cliente_entidad}, ${tipo_cliente}, ${numero_referencia_contrato},
          ${objeto_exacto}, ${actividades_alcance}, ${valor_inicial}, ${adiciones}, ${valor_final}, ${valor_smmlv},
          ${fecha_inicio}, ${fecha_terminacion}, ${estado_contrato}, ${unspsc_codigos},
          ${ejecutado_ut_consorcio}, ${porcentaje_participacion}, ${valor_final_ponderado},
          ${cantidades_ejecutadas}, ${persona_certifica}, ${certificacion_firmada}, ${etiquetas_tematicas}
        )
        RETURNING *;
      `;
      row = rows[0];
    }

    return NextResponse.json({ contrato: row });
  } catch (error) {
    console.error('Error guardando mi_empresa_experiencia:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar el contrato.' },
      { status: 500 }
    );
  }
}

// DELETE /api/mi-empresa/experiencia?id=123 — elimina un contrato
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Falta el id del contrato a eliminar.' }, { status: 400 });
    }
    await sql`DELETE FROM mi_empresa_experiencia WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando mi_empresa_experiencia:', error);
    return NextResponse.json(
      { error: 'No se pudo eliminar el contrato.' },
      { status: 500 }
    );
  }
}
