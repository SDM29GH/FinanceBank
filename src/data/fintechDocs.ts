import { FintechDocument, DocumentChunk } from '../types';

export const INITIAL_FINTECH_DOCS: FintechDocument[] = [
  {
    id: 'doc-terms',
    title: 'Términos y Condiciones de Uso del Banco Digital',
    category: 'terms',
    filename: 'Terminos_y_Condiciones_Fintech.pdf',
    pagesCount: 3,
    description: 'Condiciones contractuales para apertura, uso y cancelación de cuenta digital de fondos de pago.',
    pages: [
      {
        pageNumber: 1,
        content: `
CONTRATO DE ADHESIÓN Y TÉRMINOS DE USO - FINANCEBANK FINTECH S.A. DE C.V.
Sección 1: Objeto y Definiciones.
El presente contrato regula la apertura y mantenimiento de la Cuenta Digital de Depósito a la Vista y Tarjeta de Débito Virtual/Física operada por FinanceBANK Fintech. La contratación se realiza de forma 100% digital a través de la aplicación móvil oficial.
Requisitos de Apertura:
1. Ser persona física mayor de 18 años con residencia legal en el país.
2. Identificación oficial vigente con fotografía (INE o Pasaporte) y comprobante de domicilio no mayor a 3 meses.
3. Número de teléfono celular propio verificado vía SMS y correo electrónico válido.
4. Registro biométrico facial durante el proceso de Onboarding Digital.
        `.trim()
      },
      {
        pageNumber: 2,
        content: `
Sección 2: Uso de la Cuenta y Obligaciones del Usuario.
El titular es el único responsable de la custodia de sus credenciales de acceso, NIP (Número de Identificación Personal), clave dinámica (OTP) y llaves de autenticación biométrica.
Prohibición de Transferencia: La cuenta es personal e intransferible. Queda estrictamente prohibido ceder el uso a terceros, alquilar la cuenta o utilizarla para transacciones con fondos de procedencia ilícita.
Suspensión Temporal y Bloqueo Operativo: FinanceBANK se reserva el derecho de suspender preventivamente la cuenta en caso de:
a) Detección de patrones inusuales o sospechosos de fraude.
b) Falta de actualización de expediente de identificación del cliente (KYC).
c) Mandato judicial o requerimiento de la autoridad financiera reguladora.
        `.trim()
      },
      {
        pageNumber: 3,
        content: `
Sección 3: Cancelación del Servicio y Cláusulas Finales.
El usuario podrá cancelar su contrato en cualquier momento sin penalización alguna, siempre que la cuenta presente un saldo igual a cero ($0.00 USD) y no tenga pagos pendientes o aclaraciones en proceso.
Para iniciar el trámite de cancelación, el titular debe ingresar a la sección "Ajustes de Cuenta > Cancelar Servicio" dentro de la App o solicitarlo al canal oficial de atención al cliente.
Modificaciones al Contrato: Cualquier modificación a los presentes términos será notificada con al menos 30 días naturales de anticipación mediante la aplicación y correo registrado.
        `.trim()
      }
    ]
  },
  {
    id: 'doc-security',
    title: 'Política de Seguridad y Prevención de Fraudes',
    category: 'security',
    filename: 'Politica_Seguridad_y_Fraudes.pdf',
    pagesCount: 3,
    description: 'Protocolos de ciberseguridad, monitoreo transaccional 24/7 y procedimientos de reporte por robo o fraude.',
    pages: [
      {
        pageNumber: 1,
        content: `
POLÍTICA INTEGRAL DE CIBERSEGURIDAD Y PREVENCIÓN DE FRAUDES
Sección 1: Arquitectura de Seguridad y Cifrado.
FinanceBANK implementa controles de seguridad bancaria de nivel internacional. Todas las transmisiones de datos entre la App móvil y nuestros servidores están cifradas mediante TLS 1.3 con certificados de 2048 bits. La información confidencial almacenada en bases de datos utiliza cifrado AES-256 en reposo.
Autenticación Multi-Factor (MFA):
Toda transacción superior a $50.00 USD requiere re-autenticación obligatoria mediante Biometría Facial/Dactilar o clave OTP enviada a la App.
        `.trim()
      },
      {
        pageNumber: 2,
        content: `
Sección 2: Monitoreo Transaccional 24/7 y Reglas de Bloqueo Automático.
Un sistema motorizado de Inteligencia Artificial analiza en tiempo real el comportamiento transaccional del usuario (ubicación geográfica, tipo de comercio, hora y dispositivo).
Regla de Horario Nocturno (23:00 hrs a 05:00 hrs):
Para mitigar riesgos de robo o extorsión, las transferencias salientes realizadas en horario nocturno se limitan automáticamente a un máximo acumulado de $5,000 USD por noche. Si el usuario requiere realizar un pago superior durante este horario, deberá autorizarlo previamente con 2 horas de anticipación mediante reconocimiento facial reforzado en la App.
        `.trim()
      },
      {
        pageNumber: 3,
        content: `
Sección 3: Protocolo ante Extravío, Robo de Dispositivo o Transacción Desconocida.
En caso de pérdida de teléfono celular o detección de un cargo no reconocido:
1. Apagado Instantáneo de Tarjetas: Desde la web oficial o llamando al teléfono de emergencia (+1-800-FINANCE-SEC), el cliente puede apagar sus tarjetas en menos de 10 segundos.
2. Reporte de Aclaración: Las aclaraciones por cargos no reconocidos deben presentarse dentro de un plazo máximo de 90 días naturales posteriores a la fecha de corte.
3. Reembolso Provisorio: Para casos de fraude comprobado con tarjeta digital dinámica, FinanceBANK abonará el saldo reembolsable en un plazo máximo de 48 horas hábiles mientras concluye la investigación.
        `.trim()
      }
    ]
  },
  {
    id: 'doc-fees',
    title: 'Tarifas, Comisiones y Rendimientos del Servicio',
    category: 'fees',
    filename: 'Tarifas_y_Comisiones_2026.pdf',
    pagesCount: 2,
    description: 'Estructura transparente de costos, comisiones por operaciones nacionales e internacionales y rendimientos anuales.',
    pages: [
      {
        pageNumber: 1,
        content: `
CUADRO OFICIAL DE TARIFAS Y COMISIONES VIGENTES - FINANCEBANK (2026)
Conceptos de Operación Nacional:
- Apertura de Cuenta Digital: $0.00 USD (Gratis)
- Mantenimiento o Cuota Mensual: $0.00 USD (Sin saldo mínimo requerido)
- Transferencias Instantáneas (SPEI / ACH / PIX): $0.00 USD (Ilimitadas y sin costo)
- Emisión de Tarjeta Virtual de Débito: $0.00 USD
- Envío de Primera Tarjeta Física a Domicilio: $0.00 USD
- Reemplazo de Tarjeta Física por Robo o Extravío: $5.00 USD (Gastos de envío e impresión)
        `.trim()
      },
      {
        pageNumber: 2,
        content: `
Conceptos de Operación Internacional y Cajeros Automáticos:
- Consulta de Saldo en Cajeros Automáticos (ATM) de Red Aliada: $0.00 USD
- Retiro de Efectivo en Cajeros Internacionales: Común $2.50 USD por evento + comisión fijada por la red propietaria del cajero.
- Transacciones de Compra en Moneda Extranjera (FX): Tipo de cambio oficial con margen de conversión preferencial del 1.2% sobre la tasa interbancaria.
Rendimiento Anual por Saldo a la Vista:
La Bóveda de Ahorro Digital genera un rendimiento anual garantizado del 8.5% TNA (Tasa Nominal Anual) con liquidación diaria de intereses y disponibilidad inmediata de fondos 24/7.
        `.trim()
      }
    ]
  },
  {
    id: 'doc-privacy',
    title: 'Política de Privacidad y Protección de Datos Personales',
    category: 'privacy',
    filename: 'Politica_Privacidad_y_Proteccion_Datos.pdf',
    pagesCount: 2,
    description: 'Lineamientos de recopilación, almacenamiento, derechos ARCO y confidencialidad conforme a regulaciones vigentes.',
    pages: [
      {
        pageNumber: 1,
        content: `
AVISO DE PRIVACIDAD INTEGRAL Y DERECHOS SOBRE DATOS PERSONALES
Sección 1: Datos Recopilados y Finalidades Primarias.
FinanceBANK recolecta los siguientes datos para la prestación del servicio financiero:
- Datos de Identificación: Nombre completo, CURP/SSN, fecha de nacimiento, nacionalidad.
- Datos Biométricos: Patrón facial para autenticación segura en Onboarding y transacciones.
- Datos Financieros: Historial de transacciones, saldos, datos de cuentas bancarias asociadas.
Finalidades Primarias: Verificación de identidad conforme a normas Anti-Lavado de Dinero (AML/CFT), prevención de fraudes y ejecución de transferencias solicitadas por el cliente.
        `.trim()
      },
      {
        pageNumber: 2,
        content: `
Sección 2: Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición).
El titular de los datos personales tiene derecho en todo momento a acceder, rectificar, cancelar u oponerse al tratamiento de su información personal.
Procedimiento para Ejercer Derechos ARCO:
1. Enviar una solicitud firmada al correo electrónico privacidad@financebank.com.
2. Adjuntar copia de identificación oficial y especificar en el asunto "Solicitud ARCO".
3. El departamento de Protección de Datos dará respuesta en un plazo no mayor a 15 días hábiles.
No Transferencia a Terceros con Fines Comerciales: FinanceBANK NO vende ni comercializa bases de datos personales a empresas de marketing o terceros sin consentimiento explícito.
        `.trim()
      }
    ]
  },
  {
    id: 'doc-limits',
    title: 'Preguntas Frecuentes, Transacciones y Límites Operativos',
    category: 'limits',
    filename: 'Preguntas_Frecuentes_y_Limites.pdf',
    pagesCount: 2,
    description: 'Límites diarios de depósitos y envíos, horarios de atención y preguntas frecuentes resueltas.',
    pages: [
      {
        pageNumber: 1,
        content: `
GUÍA DE LÍMITES OPERATIVOS Y PREGUNTAS FRECUENTES (FAQ)
Límites Operativos por Nivel de Cuenta:
Nivel 1 (Básico - Validación Simple):
- Depósito máximo mensual: $1,500.00 USD
- Retiro/Transferencia máxima diaria: $500.00 USD

Nivel 2 (Avanzado - Verificación Biométrica Completa):
- Límite Máximo de Transferencia Diaria: $10,000.00 USD por día natural.
- Depósito máximo acumulado mensual: $30,000.00 USD
- Para elevar tu cuenta a Nivel 2, ingresa a "Perfil > Aumentar Límites" en la App y sube tu comprobante de ingresos o declaración anual de impuestos.
        `.trim()
      },
      {
        pageNumber: 2,
        content: `
Preguntas Frecuentes Más Consultadas:
Q1: ¿Cuánto tarda en reflejarse una transferencia SPEI / ACH?
R: Las transferencias a cuentas de otros bancos son instantáneas y operan los 365 días del año, las 24 horas del día. Si presenta un retraso mayor a 5 minutos, puedes verificar el estado de la clave de rastreo en el módulo "Rastreador de Pagos" en la App.

Q2: ¿Cuál es el costo por consultar mi saldo en la App?
R: La consulta de saldo en la App es 100% gratuita e ilimitada.

Q3: ¿Qué canales de atención al cliente existen?
R: Contamos con Chat de IA 24/7 en la App, correo soporte@financebank.com y atención telefónica de Lunes a Domingo de 08:00 a 22:00 hrs al +1-800-FINANCE-HELP.
        `.trim()
      }
    ]
  }
];

// Helper to chunk documents into uniform size pieces for the RAG retriever
export function chunkDocuments(documents: FintechDocument[]): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkCounter = 1;

  for (const doc of documents) {
    for (const page of doc.pages) {
      const paragraphs = page.content.split('\n\n');
      let currentSection = 'Sección General';

      for (const paragraph of paragraphs) {
        const cleanPara = paragraph.trim();
        if (!cleanPara) continue;

        if (cleanPara.startsWith('Sección') || cleanPara.startsWith('POLÍTICA') || cleanPara.startsWith('CONTRATO') || cleanPara.startsWith('CUADRO') || cleanPara.startsWith('GUÍA') || cleanPara.startsWith('AVISO')) {
          currentSection = cleanPara.split('\n')[0].substring(0, 60);
        }

        const words = cleanPara.split(/\s+/);
        const tokenEstimate = Math.ceil(words.length * 1.3);

        chunks.push({
          id: `chunk-${chunkCounter++}`,
          docId: doc.id,
          docTitle: doc.title,
          pageNumber: page.pageNumber,
          section: currentSection,
          content: cleanPara,
          tokenCount: tokenEstimate
        });
      }
    }
  }

  return chunks;
}
