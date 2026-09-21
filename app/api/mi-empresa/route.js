import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/mi-empresa — devuelve el perfil guardado (o null si aún no se ha creado)
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM mi_empresa WHERE id = 1`;
    return NextResponse.json({ empresa: rows[0] ?? null });
  } catch (error) {
    console.error('Error leyendo mi_empresa:', error);
    return NextResponse.json(
      { error: 'No se pudo leer el perfil de la empresa.' },
      { status: 500 }
    );
  }
}

// POST /api/mi-empresa — crea o actualiza el perfil (upsert sobre la fila única id=1)
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      razon_social = null,
      nit = null,
      representante_legal = null,
      revisor_fiscal = null,
      jur_camara_comercio_vigente = null,
      jur_antecedentes_ok = null,
      jur_formatos_propios_ok = null,
      jur_parafiscales_revisor_ok = null,
      jur_rut_vigente = null,
      jur_documentos_financieros_ok = null,
      fin_regimen = null,
      fin_indice_liquidez = null,
      fin_indice_endeudamiento = null,
      fin_razon_cobertura_intereses = null,
      fin_capital_trabajo = null,
      fin_rentabilidad_patrimonio = null,
      fin_rentabilidad_activo = null,
    } = body;

    const { rows } = await sql`
      INSERT INTO mi_empresa (
        id, razon_social, nit, representante_legal, revisor_fiscal,
        jur_camara_comercio_vigente, jur_antecedentes_ok, jur_formatos_propios_ok,
        jur_parafiscales_revisor_ok, jur_rut_vigente, jur_documentos_financieros_ok,
        fin_regimen, fin_indice_liquidez, fin_indice_endeudamiento,
        fin_razon_cobertura_intereses, fin_capital_trabajo,
        fin_rentabilidad_patrimonio, fin_rentabilidad_activo, updated_at
      ) VALUES (
        1, ${razon_social}, ${nit}, ${representante_legal}, ${revisor_fiscal},
        ${jur_camara_comercio_vigente}, ${jur_antecedentes_ok}, ${jur_formatos_propios_ok},
        ${jur_parafiscales_revisor_ok}, ${jur_rut_vigente}, ${jur_documentos_financieros_ok},
        ${fin_regimen}, ${fin_indice_liquidez}, ${fin_indice_endeudamiento},
        ${fin_razon_cobertura_intereses}, ${fin_capital_trabajo},
        ${fin_rentabilidad_patrimonio}, ${fin_rentabilidad_activo}, now()
      )
      ON CONFLICT (id) DO UPDATE SET
        razon_social = EXCLUDED.razon_social,
        nit = EXCLUDED.nit,
        representante_legal = EXCLUDED.representante_legal,
        revisor_fiscal = EXCLUDED.revisor_fiscal,
        jur_camara_comercio_vigente = EXCLUDED.jur_camara_comercio_vigente,
        jur_antecedentes_ok = EXCLUDED.jur_antecedentes_ok,
        jur_formatos_propios_ok = EXCLUDED.jur_formatos_propios_ok,
        jur_parafiscales_revisor_ok = EXCLUDED.jur_parafiscales_revisor_ok,
        jur_rut_vigente = EXCLUDED.jur_rut_vigente,
        jur_documentos_financieros_ok = EXCLUDED.jur_documentos_financieros_ok,
        fin_regimen = EXCLUDED.fin_regimen,
        fin_indice_liquidez = EXCLUDED.fin_indice_liquidez,
        fin_indice_endeudamiento = EXCLUDED.fin_indice_endeudamiento,
        fin_razon_cobertura_intereses = EXCLUDED.fin_razon_cobertura_intereses,
        fin_capital_trabajo = EXCLUDED.fin_capital_trabajo,
        fin_rentabilidad_patrimonio = EXCLUDED.fin_rentabilidad_patrimonio,
        fin_rentabilidad_activo = EXCLUDED.fin_rentabilidad_activo,
        updated_at = now()
      RETURNING *;
    `;

    return NextResponse.json({ empresa: rows[0] });
  } catch (error) {
    console.error('Error guardando mi_empresa:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar el perfil de la empresa.' },
      { status: 500 }
    );
  }
}
