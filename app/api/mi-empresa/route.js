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
      // Datos básicos / legales
      razon_social = null,
      nombre_comercial = null,
      nit = null,
      tipo_sociedad = null,
      fecha_constitucion = null,
      duracion_sociedad = null,
      domicilio_ciudad_direccion = null,
      sucursales = null,
      fecha_camara_comercio = null,
      matricula_renovada_anio = null,
      representante_legal = null,
      revisor_fiscal = null,

      // Actividad económica
      ciiu_principal = null,
      ciiu_secundarios = null,
      objeto_social = null,
      responsabilidades_tributarias = null,
      tamano_empresa = null,

      // Contacto
      correo_notificaciones = null,
      telefono_contacto = null,
      sitio_web = null,

      // Capacidad jurídica
      jur_camara_comercio_vigente = null,
      jur_antecedentes_ok = null,
      jur_formatos_propios_ok = null,
      jur_parafiscales_revisor_ok = null,
      jur_rut_vigente = null,
      jur_documentos_financieros_ok = null,

      // Indicadores financieros
      fin_regimen = null,
      fin_indice_liquidez = null,
      fin_indice_endeudamiento = null,
      fin_razon_cobertura_intereses = null,
      fin_capital_trabajo = null,
      fin_rentabilidad_patrimonio = null,
      fin_rentabilidad_activo = null,

      // Portafolio
      unspsc_codigos = null,
      descripcion_servicios = null,
    } = body;

    const { rows } = await sql`
      INSERT INTO mi_empresa (
        id,
        razon_social, nombre_comercial, nit, tipo_sociedad, fecha_constitucion,
        duracion_sociedad, domicilio_ciudad_direccion, sucursales,
        fecha_camara_comercio, matricula_renovada_anio, representante_legal, revisor_fiscal,
        ciiu_principal, ciiu_secundarios, objeto_social, responsabilidades_tributarias, tamano_empresa,
        correo_notificaciones, telefono_contacto, sitio_web,
        jur_camara_comercio_vigente, jur_antecedentes_ok, jur_formatos_propios_ok,
        jur_parafiscales_revisor_ok, jur_rut_vigente, jur_documentos_financieros_ok,
        fin_regimen, fin_indice_liquidez, fin_indice_endeudamiento,
        fin_razon_cobertura_intereses, fin_capital_trabajo,
        fin_rentabilidad_patrimonio, fin_rentabilidad_activo,
        unspsc_codigos, descripcion_servicios, updated_at
      ) VALUES (
        1,
        ${razon_social}, ${nombre_comercial}, ${nit}, ${tipo_sociedad}, ${fecha_constitucion},
        ${duracion_sociedad}, ${domicilio_ciudad_direccion}, ${sucursales},
        ${fecha_camara_comercio}, ${matricula_renovada_anio}, ${representante_legal}, ${revisor_fiscal},
        ${ciiu_principal}, ${ciiu_secundarios}, ${objeto_social}, ${responsabilidades_tributarias}, ${tamano_empresa},
        ${correo_notificaciones}, ${telefono_contacto}, ${sitio_web},
        ${jur_camara_comercio_vigente}, ${jur_antecedentes_ok}, ${jur_formatos_propios_ok},
        ${jur_parafiscales_revisor_ok}, ${jur_rut_vigente}, ${jur_documentos_financieros_ok},
        ${fin_regimen}, ${fin_indice_liquidez}, ${fin_indice_endeudamiento},
        ${fin_razon_cobertura_intereses}, ${fin_capital_trabajo},
        ${fin_rentabilidad_patrimonio}, ${fin_rentabilidad_activo},
        ${unspsc_codigos}, ${descripcion_servicios}, now()
      )
      ON CONFLICT (id) DO UPDATE SET
        razon_social = EXCLUDED.razon_social,
        nombre_comercial = EXCLUDED.nombre_comercial,
        nit = EXCLUDED.nit,
        tipo_sociedad = EXCLUDED.tipo_sociedad,
        fecha_constitucion = EXCLUDED.fecha_constitucion,
        duracion_sociedad = EXCLUDED.duracion_sociedad,
        domicilio_ciudad_direccion = EXCLUDED.domicilio_ciudad_direccion,
        sucursales = EXCLUDED.sucursales,
        fecha_camara_comercio = EXCLUDED.fecha_camara_comercio,
        matricula_renovada_anio = EXCLUDED.matricula_renovada_anio,
        representante_legal = EXCLUDED.representante_legal,
        revisor_fiscal = EXCLUDED.revisor_fiscal,
        ciiu_principal = EXCLUDED.ciiu_principal,
        ciiu_secundarios = EXCLUDED.ciiu_secundarios,
        objeto_social = EXCLUDED.objeto_social,
        responsabilidades_tributarias = EXCLUDED.responsabilidades_tributarias,
        tamano_empresa = EXCLUDED.tamano_empresa,
        correo_notificaciones = EXCLUDED.correo_notificaciones,
        telefono_contacto = EXCLUDED.telefono_contacto,
        sitio_web = EXCLUDED.sitio_web,
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
        unspsc_codigos = EXCLUDED.unspsc_codigos,
        descripcion_servicios = EXCLUDED.descripcion_servicios,
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
