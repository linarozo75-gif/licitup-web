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

      // Módulo 2 — Representación legal y facultades
      rl_nombre_completo = null,
      rl_tipo_num_documento = null,
      rl_ciudad_expedicion = null,
      rl_correo = null,
      rl_fecha_nombramiento = null,
      rl_suplente = null,
      rl_tiene_limite_monto = null,
      rl_monto_maximo = null,
      rl_organo_autoriza = null,
      rl_facultades_ofertar = null,
      rl_restricciones_estatutarias = null,

      // Checklist general de viabilidad (preguntas del levantamiento original)
      jur_camara_comercio_vigente = null,
      jur_rup_vigente_cierre = null,
      jur_antecedentes_ok = null,
      jur_formatos_propios_ok = null,
      jur_rut_vigente = null,
      jur_documentos_financieros_ok = null,

      // Módulo 4 — Cumplimiento y antecedentes
      cump_tiene_revisor_fiscal = null,
      cump_revisor_fiscal_nombre_tp = null,
      cump_contador_nombre_tp = null,
      cump_certificado_ss_parafiscales_30d = null,
      cump_aportes_al_dia = null,
      cump_antecedentes_fiscales_empresa = null,
      cump_antecedentes_fiscales_rl = null,
      cump_antecedentes_disciplinarios_empresa = null,
      cump_antecedentes_disciplinarios_rl = null,
      cump_antecedentes_judiciales_rl = null,
      cump_medidas_correctivas_rnmc_rl = null,
      cump_redam_rl = null,
      cump_inhabilidades_delitos_menores_rl = null,
      cump_tiene_sanciones_5_anios = null,
      cump_detalle_sanciones = null,
      cump_tiene_procesos_judiciales = null,
      cump_detalle_procesos_judiciales = null,
      cump_puntaje_sgsst = null,
      cump_politica_proteccion_datos = null,
      cump_programa_etica_sarlaft = null,
      cump_secop_ii_activo = null,

      // Módulo 5 — Financiero: Registro Único de Proponentes (RUP)
      fin_estado_rup = null,
      fin_fecha_renovacion_rup = null,
      fin_fecha_corte_informacion = null,
      fin_k_residual = null,

      // Módulo 5 — Financiero: datos base en COP
      fin_activo_corriente = null,
      fin_activo_total = null,
      fin_pasivo_corriente = null,
      fin_pasivo_total = null,
      fin_patrimonio = null,
      fin_ingresos_operacionales = null,
      fin_utilidad_operacional = null,
      fin_utilidad_neta = null,
      fin_gastos_intereses = null,

      // Indicadores financieros
      fin_regimen = null,
      fin_indice_liquidez = null,
      fin_indice_endeudamiento = null,
      fin_razon_cobertura_intereses = null,
      fin_capital_trabajo = null,
      fin_rentabilidad_patrimonio = null,
      fin_rentabilidad_activo = null,

      // Módulo 5 — Financiero: documentos adicionales al RUP
      fin_doc_estados_financieros_notas = null,
      fin_doc_dictamen_revisor_fiscal = null,
      fin_doc_declaracion_renta = null,
      fin_doc_certificacion_bancaria = null,

      // Módulo 5b — Cupos y garantías
      cupos_corredor_seguros_seriedad = null,
      cupos_capacidad_polizas_cumplimiento = null,

      // Módulo 9 — Capacidades y portafolio
      cap_infraestructura_herramientas = null,
      cap_sedes_ciudades = null,
      cap_esquema_soporte = null,
      cap_metodologias = null,
      cap_servicios_principales = null,
      cap_sectores_experiencia = null,

      // Portafolio
      unspsc_codigos = null,
      descripcion_servicios = null,
    } = body;

    const { rows } = await sql`
      INSERT INTO mi_empresa (
        id,
        razon_social, nombre_comercial, nit, tipo_sociedad, fecha_constitucion,
        duracion_sociedad, domicilio_ciudad_direccion, sucursales,
        fecha_camara_comercio, matricula_renovada_anio,
        ciiu_principal, ciiu_secundarios, objeto_social, responsabilidades_tributarias, tamano_empresa,
        correo_notificaciones, telefono_contacto, sitio_web,
        rl_nombre_completo, rl_tipo_num_documento, rl_ciudad_expedicion, rl_correo,
        rl_fecha_nombramiento, rl_suplente, rl_tiene_limite_monto, rl_monto_maximo,
        rl_organo_autoriza, rl_facultades_ofertar, rl_restricciones_estatutarias,
        jur_camara_comercio_vigente, jur_rup_vigente_cierre, jur_antecedentes_ok,
        jur_formatos_propios_ok, jur_rut_vigente, jur_documentos_financieros_ok,
        cump_tiene_revisor_fiscal, cump_revisor_fiscal_nombre_tp, cump_contador_nombre_tp,
        cump_certificado_ss_parafiscales_30d, cump_aportes_al_dia,
        cump_antecedentes_fiscales_empresa, cump_antecedentes_fiscales_rl,
        cump_antecedentes_disciplinarios_empresa, cump_antecedentes_disciplinarios_rl,
        cump_antecedentes_judiciales_rl, cump_medidas_correctivas_rnmc_rl,
        cump_redam_rl, cump_inhabilidades_delitos_menores_rl,
        cump_tiene_sanciones_5_anios, cump_detalle_sanciones,
        cump_tiene_procesos_judiciales, cump_detalle_procesos_judiciales,
        cump_puntaje_sgsst, cump_politica_proteccion_datos,
        cump_programa_etica_sarlaft, cump_secop_ii_activo,
        fin_estado_rup, fin_fecha_renovacion_rup, fin_fecha_corte_informacion, fin_k_residual,
        fin_activo_corriente, fin_activo_total, fin_pasivo_corriente, fin_pasivo_total,
        fin_patrimonio, fin_ingresos_operacionales, fin_utilidad_operacional,
        fin_utilidad_neta, fin_gastos_intereses,
        fin_regimen, fin_indice_liquidez, fin_indice_endeudamiento,
        fin_razon_cobertura_intereses, fin_capital_trabajo,
        fin_rentabilidad_patrimonio, fin_rentabilidad_activo,
        fin_doc_estados_financieros_notas, fin_doc_dictamen_revisor_fiscal,
        fin_doc_declaracion_renta, fin_doc_certificacion_bancaria,
        cupos_corredor_seguros_seriedad, cupos_capacidad_polizas_cumplimiento,
        cap_infraestructura_herramientas, cap_sedes_ciudades, cap_esquema_soporte,
        cap_metodologias, cap_servicios_principales, cap_sectores_experiencia,
        unspsc_codigos, descripcion_servicios, updated_at
      ) VALUES (
        1,
        ${razon_social}, ${nombre_comercial}, ${nit}, ${tipo_sociedad}, ${fecha_constitucion},
        ${duracion_sociedad}, ${domicilio_ciudad_direccion}, ${sucursales},
        ${fecha_camara_comercio}, ${matricula_renovada_anio},
        ${ciiu_principal}, ${ciiu_secundarios}, ${objeto_social}, ${responsabilidades_tributarias}, ${tamano_empresa},
        ${correo_notificaciones}, ${telefono_contacto}, ${sitio_web},
        ${rl_nombre_completo}, ${rl_tipo_num_documento}, ${rl_ciudad_expedicion}, ${rl_correo},
        ${rl_fecha_nombramiento}, ${rl_suplente}, ${rl_tiene_limite_monto}, ${rl_monto_maximo},
        ${rl_organo_autoriza}, ${rl_facultades_ofertar}, ${rl_restricciones_estatutarias},
        ${jur_camara_comercio_vigente}, ${jur_rup_vigente_cierre}, ${jur_antecedentes_ok},
        ${jur_formatos_propios_ok}, ${jur_rut_vigente}, ${jur_documentos_financieros_ok},
        ${cump_tiene_revisor_fiscal}, ${cump_revisor_fiscal_nombre_tp}, ${cump_contador_nombre_tp},
        ${cump_certificado_ss_parafiscales_30d}, ${cump_aportes_al_dia},
        ${cump_antecedentes_fiscales_empresa}, ${cump_antecedentes_fiscales_rl},
        ${cump_antecedentes_disciplinarios_empresa}, ${cump_antecedentes_disciplinarios_rl},
        ${cump_antecedentes_judiciales_rl}, ${cump_medidas_correctivas_rnmc_rl},
        ${cump_redam_rl}, ${cump_inhabilidades_delitos_menores_rl},
        ${cump_tiene_sanciones_5_anios}, ${cump_detalle_sanciones},
        ${cump_tiene_procesos_judiciales}, ${cump_detalle_procesos_judiciales},
        ${cump_puntaje_sgsst}, ${cump_politica_proteccion_datos},
        ${cump_programa_etica_sarlaft}, ${cump_secop_ii_activo},
        ${fin_estado_rup}, ${fin_fecha_renovacion_rup}, ${fin_fecha_corte_informacion}, ${fin_k_residual},
        ${fin_activo_corriente}, ${fin_activo_total}, ${fin_pasivo_corriente}, ${fin_pasivo_total},
        ${fin_patrimonio}, ${fin_ingresos_operacionales}, ${fin_utilidad_operacional},
        ${fin_utilidad_neta}, ${fin_gastos_intereses},
        ${fin_regimen}, ${fin_indice_liquidez}, ${fin_indice_endeudamiento},
        ${fin_razon_cobertura_intereses}, ${fin_capital_trabajo},
        ${fin_rentabilidad_patrimonio}, ${fin_rentabilidad_activo},
        ${fin_doc_estados_financieros_notas}, ${fin_doc_dictamen_revisor_fiscal},
        ${fin_doc_declaracion_renta}, ${fin_doc_certificacion_bancaria},
        ${cupos_corredor_seguros_seriedad}, ${cupos_capacidad_polizas_cumplimiento},
        ${cap_infraestructura_herramientas}, ${cap_sedes_ciudades}, ${cap_esquema_soporte},
        ${cap_metodologias}, ${cap_servicios_principales}, ${cap_sectores_experiencia},
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
        ciiu_principal = EXCLUDED.ciiu_principal,
        ciiu_secundarios = EXCLUDED.ciiu_secundarios,
        objeto_social = EXCLUDED.objeto_social,
        responsabilidades_tributarias = EXCLUDED.responsabilidades_tributarias,
        tamano_empresa = EXCLUDED.tamano_empresa,
        correo_notificaciones = EXCLUDED.correo_notificaciones,
        telefono_contacto = EXCLUDED.telefono_contacto,
        sitio_web = EXCLUDED.sitio_web,
        rl_nombre_completo = EXCLUDED.rl_nombre_completo,
        rl_tipo_num_documento = EXCLUDED.rl_tipo_num_documento,
        rl_ciudad_expedicion = EXCLUDED.rl_ciudad_expedicion,
        rl_correo = EXCLUDED.rl_correo,
        rl_fecha_nombramiento = EXCLUDED.rl_fecha_nombramiento,
        rl_suplente = EXCLUDED.rl_suplente,
        rl_tiene_limite_monto = EXCLUDED.rl_tiene_limite_monto,
        rl_monto_maximo = EXCLUDED.rl_monto_maximo,
        rl_organo_autoriza = EXCLUDED.rl_organo_autoriza,
        rl_facultades_ofertar = EXCLUDED.rl_facultades_ofertar,
        rl_restricciones_estatutarias = EXCLUDED.rl_restricciones_estatutarias,
        jur_camara_comercio_vigente = EXCLUDED.jur_camara_comercio_vigente,
        jur_rup_vigente_cierre = EXCLUDED.jur_rup_vigente_cierre,
        jur_antecedentes_ok = EXCLUDED.jur_antecedentes_ok,
        jur_formatos_propios_ok = EXCLUDED.jur_formatos_propios_ok,
        jur_rut_vigente = EXCLUDED.jur_rut_vigente,
        jur_documentos_financieros_ok = EXCLUDED.jur_documentos_financieros_ok,
        cump_tiene_revisor_fiscal = EXCLUDED.cump_tiene_revisor_fiscal,
        cump_revisor_fiscal_nombre_tp = EXCLUDED.cump_revisor_fiscal_nombre_tp,
        cump_contador_nombre_tp = EXCLUDED.cump_contador_nombre_tp,
        cump_certificado_ss_parafiscales_30d = EXCLUDED.cump_certificado_ss_parafiscales_30d,
        cump_aportes_al_dia = EXCLUDED.cump_aportes_al_dia,
        cump_antecedentes_fiscales_empresa = EXCLUDED.cump_antecedentes_fiscales_empresa,
        cump_antecedentes_fiscales_rl = EXCLUDED.cump_antecedentes_fiscales_rl,
        cump_antecedentes_disciplinarios_empresa = EXCLUDED.cump_antecedentes_disciplinarios_empresa,
        cump_antecedentes_disciplinarios_rl = EXCLUDED.cump_antecedentes_disciplinarios_rl,
        cump_antecedentes_judiciales_rl = EXCLUDED.cump_antecedentes_judiciales_rl,
        cump_medidas_correctivas_rnmc_rl = EXCLUDED.cump_medidas_correctivas_rnmc_rl,
        cump_redam_rl = EXCLUDED.cump_redam_rl,
        cump_inhabilidades_delitos_menores_rl = EXCLUDED.cump_inhabilidades_delitos_menores_rl,
        cump_tiene_sanciones_5_anios = EXCLUDED.cump_tiene_sanciones_5_anios,
        cump_detalle_sanciones = EXCLUDED.cump_detalle_sanciones,
        cump_tiene_procesos_judiciales = EXCLUDED.cump_tiene_procesos_judiciales,
        cump_detalle_procesos_judiciales = EXCLUDED.cump_detalle_procesos_judiciales,
        cump_puntaje_sgsst = EXCLUDED.cump_puntaje_sgsst,
        cump_politica_proteccion_datos = EXCLUDED.cump_politica_proteccion_datos,
        cump_programa_etica_sarlaft = EXCLUDED.cump_programa_etica_sarlaft,
        cump_secop_ii_activo = EXCLUDED.cump_secop_ii_activo,
        fin_estado_rup = EXCLUDED.fin_estado_rup,
        fin_fecha_renovacion_rup = EXCLUDED.fin_fecha_renovacion_rup,
        fin_fecha_corte_informacion = EXCLUDED.fin_fecha_corte_informacion,
        fin_k_residual = EXCLUDED.fin_k_residual,
        fin_activo_corriente = EXCLUDED.fin_activo_corriente,
        fin_activo_total = EXCLUDED.fin_activo_total,
        fin_pasivo_corriente = EXCLUDED.fin_pasivo_corriente,
        fin_pasivo_total = EXCLUDED.fin_pasivo_total,
        fin_patrimonio = EXCLUDED.fin_patrimonio,
        fin_ingresos_operacionales = EXCLUDED.fin_ingresos_operacionales,
        fin_utilidad_operacional = EXCLUDED.fin_utilidad_operacional,
        fin_utilidad_neta = EXCLUDED.fin_utilidad_neta,
        fin_gastos_intereses = EXCLUDED.fin_gastos_intereses,
        fin_regimen = EXCLUDED.fin_regimen,
        fin_indice_liquidez = EXCLUDED.fin_indice_liquidez,
        fin_indice_endeudamiento = EXCLUDED.fin_indice_endeudamiento,
        fin_razon_cobertura_intereses = EXCLUDED.fin_razon_cobertura_intereses,
        fin_capital_trabajo = EXCLUDED.fin_capital_trabajo,
        fin_rentabilidad_patrimonio = EXCLUDED.fin_rentabilidad_patrimonio,
        fin_rentabilidad_activo = EXCLUDED.fin_rentabilidad_activo,
        fin_doc_estados_financieros_notas = EXCLUDED.fin_doc_estados_financieros_notas,
        fin_doc_dictamen_revisor_fiscal = EXCLUDED.fin_doc_dictamen_revisor_fiscal,
        fin_doc_declaracion_renta = EXCLUDED.fin_doc_declaracion_renta,
        fin_doc_certificacion_bancaria = EXCLUDED.fin_doc_certificacion_bancaria,
        cupos_corredor_seguros_seriedad = EXCLUDED.cupos_corredor_seguros_seriedad,
        cupos_capacidad_polizas_cumplimiento = EXCLUDED.cupos_capacidad_polizas_cumplimiento,
        cap_infraestructura_herramientas = EXCLUDED.cap_infraestructura_herramientas,
        cap_sedes_ciudades = EXCLUDED.cap_sedes_ciudades,
        cap_esquema_soporte = EXCLUDED.cap_esquema_soporte,
        cap_metodologias = EXCLUDED.cap_metodologias,
        cap_servicios_principales = EXCLUDED.cap_servicios_principales,
        cap_sectores_experiencia = EXCLUDED.cap_sectores_experiencia,
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
