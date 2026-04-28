// platform-data.js — Data layer + localStorage helpers

const DEFAULT_CONTENT = {
  all_year: {
    modules: [
      {
        id: 'm0', title: 'Módulo 0', subtitle: 'Introducción', color: '#7C3AED',
        description: 'Bienvenida, valores corporativos y código de conducta del equipo de ventas.',
        blocks: [{
          id: 'm0-b1', title: 'Bienvenida y Valores', type: 'reading',
          content: `<h3>Bienvenido al Equipo</h3>
<p>Nos alegra que formes parte de nuestro equipo de ventas. Esta capacitación te dará todas las herramientas para desempeñarte con excelencia.</p>
<h3>Nuestra Misión</h3>
<p>Ofrecer experiencias únicas e inolvidables a cada cliente, superando sus expectativas y construyendo relaciones de largo plazo basadas en la confianza y la calidad.</p>
<h3>Nuestros Valores</h3>
<ul>
<li><strong>Excelencia:</strong> Cada interacción es una oportunidad para brillar.</li>
<li><strong>Integridad:</strong> Actuamos con honestidad y transparencia siempre.</li>
<li><strong>Pasión:</strong> Amamos lo que hacemos y eso se nota.</li>
<li><strong>Trabajo en equipo:</strong> Los mejores resultados se logran juntos.</li>
<li><strong>Orientación al cliente:</strong> El cliente es el centro de todo lo que hacemos.</li>
</ul>
<h3>Código de Conducta</h3>
<p>Como vendedor, eres la cara de la empresa. Mantén siempre una actitud profesional, puntual y respetuosa con clientes y compañeros.</p>
<h3>Estructura del Equipo</h3>
<p>El equipo comercial está organizado en sectores. Cada vendedor cuenta con el respaldo de coordinadores y supervisores. Las dudas operativas se canalizan por Slack (#ventas).</p>`
        }]
      },
      {
        id: 'm1', title: 'Módulo 1', subtitle: 'Excursiones', color: '#0284C7',
        description: 'Protocolos de atención al cliente, manual de productos y sistemas de la empresa.',
        blocks: [
          {
            id: 'm1-b1', title: 'Bloque 1 — Protocolos de Atención', type: 'protocols',
            subtitle: '7 protocolos esenciales para la atención al cliente',
            items: [
              { id: 'p1', title: '1. Protocolo de Bienvenida al Cliente', content: `<p>El primer contacto es determinante. Este protocolo garantiza una bienvenida cálida y profesional.</p><ol><li>Saludar por nombre si es posible, con una sonrisa genuina.</li><li>Presentarse con nombre y cargo.</li><li>Ofrecer asiento y agua si aplica.</li><li>Preguntar el motivo de la visita.</li><li>Escuchar activamente sin interrumpir.</li><li>Confirmar la comprensión antes de proceder.</li></ol><p><strong>Tip:</strong> El lenguaje corporal cuenta. El contacto visual y la postura abierta generan confianza.</p>` },
              { id: 'p2', title: '2. Protocolo de Presentación de Excursión', content: `<p>El orden y la claridad de la información son clave para despertar el interés del cliente.</p><ol><li>Comenzar con los aspectos más llamativos y únicos.</li><li>Describir el itinerario de forma clara y ordenada.</li><li>Destacar los puntos de diferenciación respecto a la competencia.</li><li>Mencionar inclusiones y exclusiones con precisión.</li><li>Adaptar el discurso al perfil del cliente (familia, pareja, grupo).</li><li>Usar material visual disponible (folletos, tablets).</li><li>Invitar al cliente a hacer preguntas al finalizar.</li></ol>` },
              { id: 'p3', title: '3. Protocolo de Manejo de Objeciones', content: `<p>Las objeciones son oportunidades disfrazadas. Usa el modelo <strong>ACRA</strong>:</p><ul><li><strong>A</strong>cuse: Reconoce la objeción. "Entiendo perfectamente..."</li><li><strong>C</strong>larifica: Haz preguntas. "¿Podrías contarme más?"</li><li><strong>R</strong>esponde: Ofrece información que resuelva la objeción.</li><li><strong>A</strong>vanza: Retoma el proceso hacia el cierre.</li></ul><p><strong>Objeciones frecuentes:</strong></p><ul><li>"Es muy caro" → Comparar valor vs precio, destacar inclusiones.</li><li>"Lo tengo que pensar" → Preguntar qué dudas quedan pendientes.</li><li>"Ya lo vi más barato" → Explicar diferencias en calidad.</li></ul>` },
              { id: 'p4', title: '4. Protocolo de Cierre de Venta', content: `<p>El cierre es la culminación del proceso. Técnicas efectivas:</p><ul><li><strong>Cierre directo:</strong> "¿Procedemos con la reserva para hoy?"</li><li><strong>Cierre alternativo:</strong> "¿Prefieren el turno de mañana o el de tarde?"</li><li><strong>Cierre por urgencia:</strong> "Esta oferta tiene cupos limitados."</li><li><strong>Cierre resumen:</strong> Repasar todos los beneficios acordados antes de confirmar.</li></ul><p>Confirmar siempre la decisión antes de proceder con la documentación.</p>` },
              { id: 'p5', title: '5. Protocolo de Cobro y Documentación', content: `<p>Una vez confirmada la venta, el proceso de cobro y documentación debe seguirse con precisión.</p><ol><li>Informar el monto total y formas de pago disponibles.</li><li>Procesar el pago según el método elegido.</li><li>Emitir y entregar el comprobante correspondiente.</li><li>Registrar la venta en el sistema interno.</li><li>Entregar la documentación completa (voucher, indicaciones).</li><li>Confirmar datos de contacto del cliente.</li></ol>` },
              { id: 'p6', title: '6. Protocolo de Post-venta', content: `<p>El servicio post-venta es tan importante como la venta misma.</p><ol><li>Enviar confirmación de reserva por email/WhatsApp dentro de las 24hs.</li><li>Recordar la excursión 48 horas antes con todos los detalles.</li><li>Contactar al cliente luego de la excursión para conocer su experiencia.</li><li>Registrar el feedback en el CRM.</li><li>Ofrecer próximas excursiones de forma personalizada.</li></ol><p><strong>Dato clave:</strong> Un cliente satisfecho trae 3-5 nuevos clientes.</p>` },
              { id: 'p7', title: '7. Protocolo de Resolución de Conflictos', content: `<p>Ante una queja, la actitud del vendedor puede transformar una experiencia negativa en fidelización.</p><ol><li>Escuchar sin interrumpir. Dejar que el cliente se exprese.</li><li>Pedir disculpas sinceras, independientemente de quién tenga razón.</li><li>No ponerse a la defensiva ni discutir.</li><li>Proponer una solución concreta.</li><li>Escalar a un supervisor si la situación lo requiere.</li><li>Hacer seguimiento para verificar que el cliente quedó conforme.</li></ol><p><strong>Frase clave:</strong> "Entiendo su frustración y me comprometo a resolver esto."</p>` }
            ]
          },
          {
            id: 'm1-b2', title: 'Bloque 2 — Manual de Excursiones', type: 'reading',
            subtitle: 'Guía completa de productos y políticas',
            content: `<h3>Manual de Excursiones — Guía Completa</h3>
<p>Este manual es tu referencia para conocer en profundidad el catálogo de excursiones, sus características y políticas.</p>
<h3>Catálogo Principal</h3>
<h4>City Tour Premium</h4>
<p>Duración: 4 horas. Recorrido por los principales puntos turísticos con guía bilingüe, transporte de lujo y fotografía profesional incluida. Precio: desde $85/persona. Mínimo 2 personas.</p>
<h4>Excursión Aventura Natural</h4>
<p>Duración: 8 horas. Senderismo, kayak y almuerzo incluido. Apto mayores de 12 años con buen estado físico. Precio: desde $120/persona. Equipo completo incluido.</p>
<h4>Tour Gastronómico y Cultural</h4>
<p>Duración: 5 horas. Mercados locales, talleres de cocina y degustación típica. Ideal parejas y grupos. Precio: desde $95/persona.</p>
<h4>Puesta de Sol VIP</h4>
<p>Duración: 3 horas. Experiencia privada con champaña, aperitivos y mirador exclusivo. Máximo 8 personas. Precio: desde $150/persona.</p>
<h3>Políticas de Reserva</h3>
<ul>
<li>Se requiere 50% de seña para confirmar la reserva.</li>
<li>El saldo debe abonarse 48 horas antes de la excursión.</li>
<li>La reserva se confirma únicamente por escrito (email o mensaje).</li>
</ul>
<h3>Políticas de Cancelación</h3>
<ul>
<li>Cancelación con más de 72hs: reembolso del 100%.</li>
<li>Cancelación entre 48-72hs: reembolso del 50%.</li>
<li>Cancelación con menos de 48hs: sin reembolso.</li>
<li>Suspensión por mal clima: reprogramación sin cargo.</li>
</ul>
<h3>Grupos Especiales</h3>
<p>Para grupos de más de 10 personas se aplican tarifas especiales. Consultar con el coordinador. Los grupos requieren confirmación con al menos 7 días de anticipación.</p>`
          },
          {
            id: 'm1-b3', title: 'Bloque 3 — Sistemas de la Empresa', type: 'reading',
            subtitle: 'Plataformas y herramientas operativas',
            content: `<h3>Sistemas de la Empresa — Guía Operativa</h3>
<p>El dominio de las herramientas tecnológicas es fundamental para operar con eficiencia.</p>
<h3>TourManager Pro — Sistema de Reservas</h3>
<p>Plataforma central de gestión. Acceso en: tourmanager.empresa.com (solo red interna o VPN).</p>
<h4>Operaciones Principales</h4>
<ul>
<li><strong>Nueva reserva:</strong> Módulo "Ventas" → "Nueva Reserva" → Completar formulario.</li>
<li><strong>Modificar:</strong> Buscar por número o nombre → "Editar".</li>
<li><strong>Cancelar:</strong> Requiere autorización del supervisor si la reserva supera $500.</li>
<li><strong>Emitir voucher:</strong> Desde la reserva → "Documentos" → "Voucher".</li>
</ul>
<h3>CRM — Gestión de Clientes</h3>
<p>Registrar toda interacción con el cliente, aunque no resulte en venta. Actualizar datos y programar recordatorios de seguimiento.</p>
<h3>Sistema de Cobros</h3>
<ul>
<li><strong>Tarjeta:</strong> Terminal POS. Esperar confirmación antes de entregar documentos.</li>
<li><strong>Transferencia:</strong> Verificar acreditación antes de confirmar la reserva.</li>
<li><strong>Efectivo:</strong> Entregar recibo manual y registrar en sistema el mismo día.</li>
</ul>
<h3>Comunicación Interna — Slack</h3>
<ul>
<li>#general: comunicados y novedades generales.</li>
<li>#ventas: coordinación del equipo comercial.</li>
<li>#alertas-clima: actualizaciones meteorológicas.</li>
<li>#soporte-sistemas: reportar problemas técnicos.</li>
</ul>
<h3>Reporte Diario</h3>
<p>Completar antes de las 18:00 hs en TourManager Pro → "Reportes" → "Mi Reporte Diario". Incluye: reservas, cancelaciones, cobros y observaciones.</p>`
          }
        ]
      },
      {
        id: 'm2', title: 'Módulo 2', subtitle: 'Desarrollo Comercial', color: '#059669',
        description: 'Técnicas de venta, segmentación de clientes, KPIs y plan de comisiones.',
        blocks: [{
          id: 'm2-b1', title: 'Bloque 1 — Pilares del Área Comercial', type: 'cards',
          subtitle: '7 pilares clave para el desarrollo comercial',
          items: [
            { id: 'c1', title: 'Venta Consultiva', content: `<p>Entender las necesidades del cliente antes de ofrecer una solución. El vendedor actúa como asesor.</p><p><strong>Preguntas clave:</strong></p><ul><li>¿Qué tipo de experiencias han disfrutado antes?</li><li>¿Cuál es el objetivo de este viaje?</li><li>¿Hay alguna limitación física o preferencia especial?</li></ul><p>Escuchar más de lo que se habla es la clave.</p>` },
            { id: 'c2', title: 'Conocimiento del Producto', content: `<p>Un vendedor que conoce a fondo su producto transmite confianza y autoridad.</p><p><strong>Debes conocer de cada excursión:</strong></p><ul><li>Duración y puntos de interés incluidos.</li><li>Nivel de dificultad y requisitos físicos.</li><li>Qué está incluido y qué no.</li><li>Mejores condiciones climáticas y temporadas.</li><li>Datos curiosos para enriquecer la presentación.</li></ul>` },
            { id: 'c3', title: 'Segmentación de Clientes', content: `<p>Identificar el perfil del cliente permite personalizar la oferta.</p><p><strong>Perfiles principales:</strong></p><ul><li><strong>Familia con niños:</strong> Seguridad, diversión y comodidad.</li><li><strong>Pareja joven:</strong> Romanticismo, aventura y exclusividad.</li><li><strong>Adultos mayores:</strong> Comodidad, ritmo pausado, cultura.</li><li><strong>Grupo corporativo:</strong> Team building, logística impecable.</li><li><strong>Aventurero:</strong> Precio, autenticidad, desafío.</li></ul>` },
            { id: 'c4', title: 'Upselling y Cross-selling', content: `<p><strong>Upselling:</strong> Ofrecer versión premium de lo que el cliente quiere. "Por $20 más, podés tener la versión VIP con traslado privado incluido."</p><p><strong>Cross-selling:</strong> Ofrecer productos complementarios. "Muchos que hacen el City Tour también disfrutan la Excursión Gastronómica al día siguiente."</p><p>La propuesta adicional debe aportar valor genuino.</p>` },
            { id: 'c5', title: 'Gestión del Tiempo', content: `<p>Organizar la jornada para maximizar el tiempo frente al cliente.</p><p><strong>Estructura recomendada:</strong></p><ul><li>9–11hs: Prospección y seguimientos activos.</li><li>11–13hs y 15–17hs: Atención al público.</li><li>17–18hs: Carga en sistemas y reportes.</li></ul><p>Priorizar clientes calientes antes que tibios.</p>` },
            { id: 'c6', title: 'KPIs y Métricas', content: `<p><strong>Indicadores clave:</strong></p><ul><li><strong>Tasa de conversión:</strong> % de consultas que se convierten en ventas. Meta: &gt;35%.</li><li><strong>Ticket promedio:</strong> Valor promedio por venta. Meta: &gt;$110.</li><li><strong>NPS:</strong> Puntuación de satisfacción. Meta: &gt;8/10.</li><li><strong>Ventas semanales:</strong> Revisión cada lunes.</li></ul>` },
            { id: 'c7', title: 'Plan de Comisiones', content: `<p><strong>Estructura:</strong></p><ul><li>Comisión base: 5% sobre todas las ventas.</li><li>Bonus por superar meta mensual: +2% sobre el total.</li><li>Bonus por productos premium: +1% adicional.</li><li>Incentivo por NPS &gt;9: bono especial trimestral.</li></ul><p>Las comisiones se liquidan el último día hábil de cada mes.</p>` }
          ]
        }]
      }
    ],
    additionalInfo: {
      title: 'Información Adicional',
      content: `<h3>Recursos y Materiales Complementarios</h3>
<h3>Contactos Clave</h3>
<ul>
<li><strong>Coordinación de Ventas:</strong> ventas@empresa.com | Int. 201</li>
<li><strong>Soporte de Sistemas:</strong> sistemas@empresa.com | Int. 305</li>
<li><strong>Recursos Humanos:</strong> rrhh@empresa.com | Int. 102</li>
<li><strong>Emergencias 24hs:</strong> +54 9 11 0000-0000</li>
</ul>
<h3>Calendario de Reuniones</h3>
<ul>
<li><strong>Reunión de equipo:</strong> Todos los lunes 9:00 hs</li>
<li><strong>One-on-one:</strong> Quincenal con supervisor</li>
<li><strong>Capacitación mensual:</strong> Primer viernes, 14:00 hs</li>
</ul>
<h3>Beneficios</h3>
<ul>
<li>50% de descuento en excursiones (máximo 2 por temporada).</li>
<li>Acceso a cursos de idiomas online.</li>
<li>Seguro médico complementario.</li>
<li>Subsidio de transporte.</li>
</ul>
<h3>Preguntas Frecuentes</h3>
<p><strong>¿Qué hago si un cliente se queja durante la excursión?</strong><br>Contactar al coordinador de campo vía WhatsApp al grupo de emergencias. No tomar decisiones unilaterales sobre reembolsos.</p>
<p><strong>¿Puedo ofrecer descuentos?</strong><br>Sí, dentro de los márgenes establecidos. Registrar siempre en el sistema con el código correspondiente.</p>`
    }
  }
};
DEFAULT_CONTENT.winter = JSON.parse(JSON.stringify(DEFAULT_CONTENT.all_year));
DEFAULT_CONTENT.winter.modules.forEach(m => { m.subtitle += ' — Invierno'; });

const DEFAULT_EVALUATIONS = {
  m0: { title: 'Evaluación — Módulo 0', questions: [
    { q: '¿Cuál es la misión principal de la empresa?', opts: ['Maximizar ganancias', 'Ofrecer experiencias únicas e inolvidables', 'Reducir costos operativos', 'Vender la mayor cantidad posible'], c: 1 },
    { q: '¿Qué valor hace referencia a actuar con honestidad?', opts: ['Pasión', 'Excelencia', 'Integridad', 'Trabajo en equipo'], c: 2 },
    { q: '¿Qué significa "orientación al cliente"?', opts: ['Darle indicaciones para llegar', 'Que el cliente es el centro de todo', 'Atender primero a los más importantes', 'Ofrecer siempre el producto más caro'], c: 1 },
    { q: 'El código de conducta exige que el vendedor sea:', opts: ['Solo veloz', 'Profesional, puntual y respetuoso', 'Únicamente formal en el vestuario', 'Amigable en exceso'], c: 1 },
    { q: '¿A quién representa el vendedor frente al cliente?', opts: ['Solo a sí mismo', 'Al supervisor inmediato', 'A la empresa en su totalidad', 'Al departamento de ventas'], c: 2 },
    { q: '¿Qué valor está relacionado con amar el trabajo que se hace?', opts: ['Integridad', 'Excelencia', 'Trabajo en equipo', 'Pasión'], c: 3 },
    { q: '¿Cuándo debe cambiarse la contraseña del sistema?', opts: ['Nunca', 'Cada 30 días', 'Cada 90 días', 'Cada año'], c: 2 },
    { q: '¿Cuál es la actitud correcta ante una queja?', opts: ['Ignorarla', 'Escuchar sin interrumpir y buscar solución', 'Derivar a otro compañero', 'Explicar por qué el cliente está equivocado'], c: 1 },
    { q: '¿Qué implica el valor "trabajo en equipo"?', opts: ['Hacer todo uno mismo', 'Los mejores resultados se logran juntos', 'Nunca pedir ayuda', 'Competir con compañeros'], c: 1 },
    { q: '¿Cuál es el canal de Slack para reportar problemas técnicos?', opts: ['#general', '#ventas', '#alertas-clima', '#soporte-sistemas'], c: 3 },
    { q: '¿A qué hora se debe completar el reporte diario?', opts: ['12:00 hs', '15:00 hs', '18:00 hs', 'Al día siguiente'], c: 2 },
    { q: '¿Dónde se accede al sistema de reservas?', opts: ['reservas.empresa.com', 'tourmanager.empresa.com', 'crm.empresa.com', 'ventas.empresa.com'], c: 1 },
    { q: '¿Qué porcentaje de seña se requiere para confirmar una reserva?', opts: ['25%', '30%', '50%', '100%'], c: 2 },
    { q: 'Cancelación con más de 72hs: ¿qué reembolso corresponde?', opts: ['0%', '50%', '75%', '100%'], c: 3 },
    { q: '¿Qué información incluye el reporte diario?', opts: ['Solo ventas exitosas', 'Reservas, cancelaciones, cobros y observaciones', 'Solo quejas', 'Información de competidores'], c: 1 },
    { q: 'Los cobros en efectivo deben:', opts: ['No registrarse', 'Registrarse al día siguiente', 'Llevar recibo y registrarse el mismo día', 'Ser gestionados por el supervisor'], c: 2 },
    { q: 'La cancelación entre 48-72hs tiene reembolso de:', opts: ['0%', '50%', '75%', '100%'], c: 1 },
    { q: '¿Qué requiere cancelar una reserva mayor a $500?', opts: ['Solo el vendedor', 'Autorización del cliente', 'Autorización del supervisor', 'Aprobación del sistema'], c: 2 },
    { q: '¿Cuál es el canal de Slack del equipo comercial?', opts: ['#general', '#ventas', '#soporte', '#alertas'], c: 1 },
    { q: 'La confirmación de reserva debe enviarse al cliente:', opts: ['Dentro de las 12hs', 'Dentro de las 24hs', 'Dentro de las 48hs', 'Una semana antes'], c: 1 },
  ]},
  m1: { title: 'Evaluación — Módulo 1', questions: [
    { q: '¿Qué es lo primero al recibir a un cliente?', opts: ['Mostrar el catálogo', 'Presentar promociones', 'Saludar y presentarse', 'Preguntar el presupuesto'], c: 2 },
    { q: '¿Cuál es el modelo para manejar objeciones?', opts: ['SPIN', 'ACRA', 'AIDA', 'BANT'], c: 1 },
    { q: '¿Cuánto dura la Excursión Aventura Natural?', opts: ['3 horas', '4 horas', '5 horas', '8 horas'], c: 3 },
    { q: '¿Qué técnica ofrece dos opciones al cliente?', opts: ['Cierre directo', 'Cierre alternativo', 'Cierre por urgencia', 'Cierre resumen'], c: 1 },
    { q: '¿Cuándo se envía la confirmación de reserva?', opts: ['Mismo día', 'Dentro de las 24hs', 'Dentro de las 48hs', 'Una semana antes'], c: 1 },
    { q: '¿Qué incluye la Puesta de Sol VIP?', opts: ['Senderismo y almuerzo', 'Champaña, aperitivos y mirador', 'Guía bilingüe y fotografía', 'Tour gastronómico'], c: 1 },
    { q: 'Si una excursión se suspende por mal clima:', opts: ['Sin reembolso', 'Reembolso del 50%', 'Reprogramación sin cargo', 'Reembolso completo'], c: 2 },
    { q: '¿Cuándo se abona el saldo de la reserva?', opts: ['Al reservar', '24hs antes', '48hs antes', '72hs antes'], c: 2 },
    { q: 'La "C" de ACRA significa:', opts: ['Confirmar', 'Clarificar', 'Cerrar', 'Comunicar'], c: 1 },
    { q: '¿Cuántas personas máximo tiene el tour VIP?', opts: ['4', '6', '8', '10'], c: 2 },
    { q: '¿Para qué perfil se adapta la venta consultiva?', opts: ['Solo corporativos', 'Todos los clientes', 'Solo grupos grandes', 'Solo clientes frecuentes'], c: 1 },
    { q: 'El City Tour Premium incluye:', opts: ['Almuerzo y kayak', 'Guía bilingüe, transporte de lujo y fotografía', 'Champaña y mirador', 'Degustación gastronómica'], c: 1 },
    { q: 'Antes de entregar documentos con tarjeta se debe:', opts: ['Registrar en CRM', 'Esperar confirmación POS', 'Emitir el voucher', 'Contactar al supervisor'], c: 1 },
    { q: 'Los grupos requieren confirmación con al menos:', opts: ['2 días', '3 días', '5 días', '7 días'], c: 3 },
    { q: '¿Cuándo se recuerda la excursión al cliente?', opts: ['Una semana antes', '72hs antes', '48hs antes', 'El mismo día'], c: 2 },
    { q: 'La presentación de una excursión debe incluir:', opts: ['Solo el precio', 'Itinerario, diferenciación, inclusiones y exclusiones', 'Únicamente el itinerario', 'Comparación con la competencia'], c: 1 },
    { q: '¿Cuánto vale la Excursión Gastronómica?', opts: ['Desde $85', 'Desde $95', 'Desde $120', 'Desde $150'], c: 1 },
    { q: 'La acción post-venta más importante de fidelización es:', opts: ['Enviar publicidad', 'Contactar al cliente luego de la excursión', 'Enviar encuestas escritas', 'Ofrecer más productos por WhatsApp'], c: 1 },
    { q: '¿En qué plataforma se realizan todas las reservas?', opts: ['CRM Empresarial', 'TourManager Pro', 'BookingSystem', 'SalesForce'], c: 1 },
    { q: 'El City Tour Premium tiene precio desde:', opts: ['$75', '$85', '$95', '$120'], c: 1 },
  ]},
  m2: { title: 'Evaluación — Módulo 2', questions: [
    { q: '¿Qué es el upselling?', opts: ['Vender productos de menor precio', 'Ofrecer versión premium de lo que el cliente quiere', 'Vender a nuevos clientes', 'Reducir precio para cerrar'], c: 1 },
    { q: '¿Cuál es la meta de tasa de conversión?', opts: ['Mayor al 20%', 'Mayor al 25%', 'Mayor al 35%', 'Mayor al 50%'], c: 2 },
    { q: '¿Qué es el cross-selling?', opts: ['Vender a clientes de la competencia', 'Ofrecer productos complementarios', 'Vender al mismo precio', 'Recuperar clientes perdidos'], c: 1 },
    { q: '¿Cuál es la comisión base sobre todas las ventas?', opts: ['3%', '4%', '5%', '7%'], c: 2 },
    { q: 'En venta consultiva, el vendedor actúa como:', opts: ['Presentador de catálogos', 'Asesor que entiende necesidades', 'Impulsor de productos rentables', 'Tomador de pedidos'], c: 1 },
    { q: '¿Cuándo se liquidan las comisiones?', opts: ['El 15 de cada mes', 'Primer día hábil del siguiente', 'Último día hábil de cada mes', 'Trimestralmente'], c: 2 },
    { q: 'Para parejas jóvenes se prioriza:', opts: ['Precio bajo', 'Romanticismo, aventura y exclusividad', 'Comodidad y ritmo pausado', 'Actividades grupales'], c: 1 },
    { q: '¿Cuál es la meta de ticket promedio?', opts: ['Mayor a $80', 'Mayor a $95', 'Mayor a $110', 'Mayor a $150'], c: 2 },
    { q: 'Bonus al superar la meta mensual:', opts: ['+1%', '+2%', '+3%', '+5%'], c: 1 },
    { q: '¿Qué horario se recomienda para atención al público?', opts: ['9-11 y 15-17', '11-13 y 15-17', '8-12 y 14-18', 'Sin bloques definidos'], c: 1 },
    { q: '¿Qué NPS mínimo activa el bono trimestral?', opts: ['7/10', '8/10', '9/10', '10/10'], c: 2 },
    { q: 'Para adultos mayores se prioriza:', opts: ['Aventura y precio', 'Comodidad, ritmo pausado y cultura', 'Experiencias extremas', 'Grupos grandes'], c: 1 },
    { q: '¿Cuándo se revisan las ventas semanales?', opts: ['Los viernes', 'Los lunes', 'Los miércoles', 'Último día hábil'], c: 1 },
    { q: 'Bonus por productos premium:', opts: ['+0.5%', '+1%', '+2%', '+3%'], c: 1 },
    { q: 'El vendedor consultivo se diferencia porque:', opts: ['Vende más rápido', 'Escucha más de lo que habla', 'Conoce todos los precios', 'Trabaja sin supervisión'], c: 1 },
    { q: '¿Qué descuento tiene el empleado en excursiones?', opts: ['10%', '25%', '50%', '100%'], c: 2 },
    { q: '¿Cuándo se realizan las capacitaciones mensuales?', opts: ['Último viernes 9hs', 'Primer lunes 14hs', 'Primer viernes 14hs', 'Cada quince días'], c: 2 },
    { q: 'Las reuniones de equipo son:', opts: ['Diarias 9hs', 'Lunes 9hs', 'Viernes semanales', 'Mensuales'], c: 1 },
    { q: '¿Cuántas excursiones con descuento por temporada?', opts: ['1', '2', '3', '5'], c: 1 },
    { q: 'Si un vendedor no llega a la meta:', opts: ['Sanción inmediata', 'Reunión con supervisor para identificar mejoras', 'Se reduce comisión siguiente mes', 'Se reasigna a otro rol'], c: 1 },
  ]}
};

const DEFAULT_USERS = [
  { id: 1, username: 'admin',      password: 'admin123',  role: 'admin',      name: 'Administrador' },
  { id: 2, username: 'supervisor1',password: 'super123',  role: 'supervisor', name: 'Supervisora Demo' },
  { id: 3, username: 'editor1',    password: 'editor123', role: 'editor',     name: 'Editor Demo' },
  { id: 4, username: 'vendedor1',  password: '1234',      role: 'vendedor',   name: 'Carlos García' },
  { id: 5, username: 'vendedor2',  password: '1234',      role: 'vendedor',   name: 'María López' },
];

function initStorage() {
  if (!localStorage.getItem('cp_users')) localStorage.setItem('cp_users', JSON.stringify(DEFAULT_USERS));
  if (!localStorage.getItem('cp_content')) localStorage.setItem('cp_content', JSON.stringify(DEFAULT_CONTENT));
  if (!localStorage.getItem('cp_evals')) localStorage.setItem('cp_evals', JSON.stringify(DEFAULT_EVALUATIONS));
  if (!localStorage.getItem('cp_results')) localStorage.setItem('cp_results', JSON.stringify([]));
  if (!localStorage.getItem('cp_progress')) localStorage.setItem('cp_progress', JSON.stringify({}));
}
function getUsers() { return JSON.parse(localStorage.getItem('cp_users') || '[]'); }
function saveUsers(u) { localStorage.setItem('cp_users', JSON.stringify(u)); }
function getContent() { return JSON.parse(localStorage.getItem('cp_content') || '{}'); }
function saveContent(c) { localStorage.setItem('cp_content', JSON.stringify(c)); }
function getEvals() { return JSON.parse(localStorage.getItem('cp_evals') || '{}'); }
function getResults() { return JSON.parse(localStorage.getItem('cp_results') || '[]'); }
function saveResults(r) { localStorage.setItem('cp_results', JSON.stringify(r)); }
function getProgress() { return JSON.parse(localStorage.getItem('cp_progress') || '{}'); }
function saveProgress(p) { localStorage.setItem('cp_progress', JSON.stringify(p)); }

Object.assign(window, {
  initStorage, getUsers, saveUsers, getContent, saveContent,
  getEvals, getResults, saveResults, getProgress, saveProgress
});
