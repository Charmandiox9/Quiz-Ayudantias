export const ay03Solid = {
  id: "ay03",
  code: "AYUDANTIA3",
  altCodes: ["AY03-SOLID", "SOLID"],
  number: 3,
  title: "Ayudantía N°3: Principios SOLID",
  subtitle: "S (Responsabilidad Única), O (Abierto/Cerrado), L (Sustitución Liskov), I (Segregación Interfaces), D (Inversión Dependencias)",
  course: "Ingeniería de Software",
  semester: "2026-02",
  description: "Evaluación formativa e interactiva sobre fundamentos teóricos, analogías prácticas, code smells y refactorización orientada a objetos con principios SOLID.",
  defaultTimerSeconds: 60,
  pointsPerQuestion: 1000,
  questions: [
    {
      id: 1,
      topic: "Fundamentos de Diseño",
      q: "Según los síntomas de código sin diseño presentados en la sesión, ¿qué define el concepto de 'Fragilidad' en el software?",
      opts: [
        "La imposibilidad total de reutilizar módulos en otros proyectos por el acoplamiento existente.",
        "Situación donde corregir un error pequeño desencadena fallas imprevistas en áreas no relacionadas.",
        "El tiempo excesivo requerido para implementar una funcionalidad simple debido al enredo técnico.",
        "La copia reiterada de bloques de código por temor a descomponer lógica legacy que ya funciona."
      ],
      ans: 1,
      exp: "La Fragilidad se manifiesta cuando un cambio o corrección puntual en una parte del sistema provoca errores y efectos secundarios en módulos totalmente ajenos."
    },
    {
      id: 2,
      topic: "S — Single Responsibility",
      q: "¿Cuál es la formulación canónica del Principio de Responsabilidad Única (SRP) según Robert C. Martin?",
      opts: [
        "Cada clase debe implementar exactamente una única interfaz con un método ejecutable.",
        "Cada módulo del sistema debe compilarse en un archivo binario estrictamente separado.",
        "Una clase debe poseer una única razón para cambiar, asumiendo un solo rol delimitado.",
        "Los métodos de una clase deben limitarse a un máximo estricto de diez líneas de código."
      ],
      ans: 2,
      exp: "Uncle Bob define SRP indicando que una clase debe tener una sola razón para cambiar, encargándose de un único trabajo bien delimitado (especialista, no hombre orquesta)."
    },
    {
      id: 3,
      topic: "S — Single Responsibility",
      q: "¿Cuál de las siguientes señales constituye un síntoma evidente (Code Smell) de violación del principio SRP?",
      opts: [
        "Clases denominadas 'Manager' o 'Helper' con cientos de líneas que mezclan negocio, SQL y correos.",
        "Clases que reciben dependencias abstractas mediante los parámetros definidos en su constructor.",
        "Métodos públicos que retornan tipos genéricos o interfaces desacopladas del motor persistente.",
        "Subclases que reutilizan el comportamiento general del padre implementando métodos protegidos."
      ],
      ans: 0,
      exp: "Las clases gigantescas ('God Classes') con nombres vagos como Manager o Helper que mezclan reglas de cálculo, sentencias SQL y comunicaciones son la señal clásica de violación de SRP."
    },
    {
      id: 4,
      topic: "S — Single Responsibility",
      diagramSnippet: "class Reserva {\n  calcularCosto();\n  guardarEnBD(); // SQL\n  enviarConfirmacion(); // SMTP\n}",
      q: "En el ejemplo analizado de la clase 'Reserva', ¿cuál es la solución correcta para aplicar el principio SRP?",
      opts: [
        "Centralizar las tres operaciones en una única función estática global dentro de la clase Reserva.",
        "Separar en tres clases especialistas: Reserva (negocio), Repositorio (BD) y Notificador (email).",
        "Convertir la clase Reserva en abstracta y forzar a que el controlador web ejecute las sentencias SQL.",
        "Delegar la persistencia en el recolector de basura de la máquina virtual mediante variables locales."
      ],
      ans: 1,
      exp: "La solución SOLID separa responsabilidades en tres especialistas independientes: Reserva (cálculo), ReservaRepositorio (persistencia SQL) y NotificadorEmail (comunicación SMTP)."
    },
    {
      id: 5,
      topic: "O — Open / Closed",
      q: "De acuerdo con la analogía del 'Puerto USB' vista en la sesión, ¿qué exige formalmente el principio OCP?",
      opts: [
        "Diseñar sistemas cerrados al acceso externo para salvaguardar la integridad de los datos.",
        "Forzar que toda conexión entre clases se realice mediante puertos de red y sockets TCP/IP.",
        "Permitir incorporar nuevas variantes creando clases nuevas sin editar código ya probado.",
        "Exigir que cualquier método nuevo deba sobreescribir obligatoriamente código ya compilado."
      ],
      ans: 2,
      exp: "El principio OCP establece que el software debe estar abierto a la extensión (agregar nuevas salas conectándolas como un USB) pero cerrado a la modificación (sin desarmar el código probado)."
    },
    {
      id: 6,
      topic: "O — Open / Closed",
      diagramSnippet: "public double calcular(String tipo) {\n  if (tipo == 'estudio') return 1000;\n  else if (tipo == 'auditorio') return 5000;\n}",
      q: "Al incorporar una nueva sala 'Laboratorio', ¿por qué la estructura con if/else viola el principio OCP?",
      opts: [
        "Porque obliga a modificar código fuente que ya fue testeado, arriesgando fallas de regresión.",
        "Porque los bloques if/else impiden que el procesador ejecute instrucciones de forma secuencial.",
        "Porque la sintaxis de cadenas condicionales está prohibida en los estándares modernos de Java.",
        "Porque el costo por hora de un laboratorio debe calcularse siempre con bases de datos remotas."
      ],
      ans: 0,
      exp: "Cada nuevo if/else obliga a abrir y editar código existente y probado, lo que introduce alto riesgo de regresión (romper salas anteriores al tocar el archivo)."
    },
    {
      id: 7,
      topic: "O — Open / Closed",
      q: "En la solución SOLID para el cálculo de costos de salas, ¿cómo se logra que el cálculo esté 'cerrado a cambios'?",
      opts: [
        "Creando una tabla estática en base de datos que se consulte mediante sentencias SQL en cada ciclo.",
        "Declarando los métodos del calculador como finales para evitar que el compilador los sobreescriba.",
        "Programando contra la interfaz 'Sala', permitiendo que cada nueva clase determine su propio costo.",
        "Restringiendo el acceso a las salas mediante variables privadas y permisos a nivel de sistema web."
      ],
      ans: 2,
      exp: "Al usar polimorfismo con 'interface Sala { double costoPorHora(); }', el método calcularTotal recibe la interfaz y no necesita modificarse jamás, sin importar cuántos tipos de salas existan."
    },
    {
      id: 8,
      topic: "L — Liskov Substitution",
      q: "¿Cuál es el postulado central del Principio de Sustitución de Liskov (LSP) formulado en 1987?",
      opts: [
        "Las clases derivadas deben implementar obligatoriamente todos los constructores de la clase padre.",
        "El árbol de herencia del software no debe superar jamás una profundidad mayor a dos niveles jerárquicos.",
        "Las interfaces públicas deben poseer un único método abstracto para permitir expresiones funcionales.",
        "Una subclase debe poder sustituir a su clase base sin romper el comportamiento esperado del sistema."
      ],
      ans: 3,
      exp: "Barbara Liskov demostró que si B es subtipo de A, cualquier objeto de tipo A puede ser reemplazado por un objeto de tipo B sin que el programa sufra fallos o sorpresas inesperadas."
    },
    {
      id: 9,
      topic: "L — Liskov Substitution",
      q: "De acuerdo con la sesión, ¿por qué la analogía 'si parece un pato pero necesita pilas está roto' ilustra LSP?",
      opts: [
        "Indica que no deben crearse modelos computacionales de elementos artificiales en software comercial.",
        "Advierte que heredar por apariencia crea subclases que no pueden cumplir el contrato de la superclase.",
        "Exige que las clases hijas implementen mecanismos de persistencia energética en segundo plano móvil.",
        "Prohíbe usar interfaces web cuando el modelo del negocio no contiene entidades de persistencia SQL."
      ],
      ans: 1,
      exp: "Heredar solo por reutilizar código o por similitud superficial (como hacer que Pingüino herede de Ave) genera subclases que rompen el contrato del padre al no poder cumplir sus métodos."
    },
    {
      id: 10,
      topic: "L — Liskov Substitution",
      diagramSnippet: "class Pinguino extends Ave {\n  @Override\n  public void volar() {\n    throw new UnsupportedOperationException();\n  }\n}",
      q: "¿Por qué lanzar 'UnsupportedOperationException' en el método volar() de Pingüino viola el principio LSP?",
      opts: [
        "Porque obliga al cliente a gestionar excepciones de entrada y salida propias del sistema operativo.",
        "Porque las excepciones no verificadas en Java solo pueden propagarse a través de interfaces REST.",
        "Porque rompe la expectativa del cliente al usar ave.volar(), causando caídas en tiempo de ejecución.",
        "Porque la especificación de Java prohíbe explícitamente sobreescribir métodos dentro de una subclase."
      ],
      ans: 2,
      exp: "El cliente que recibe una referencia de tipo 'Ave' asume que puede invocar volar(). Si una subclase lanza una excepción inesperada, el contrato del padre se rompe y el sistema colapsa."
    },
    {
      id: 11,
      topic: "I — Interface Segregation",
      q: "Tomando la analogía del 'Menú a la carta', ¿cuál es el objetivo fundamental del principio ISP?",
      opts: [
        "Agrupar todas las funciones en una interfaz maestra para simplificar las firmas de los controladores.",
        "Obligar a las clases a firmar contratos integrales para garantizar compatibilidad con librerías web.",
        "Reemplazar el polimorfismo por funciones lambda que procesen colecciones de datos en memoria local.",
        "Diseñar interfaces pequeñas y específicas, evitando obligar a clases a firmar métodos que no usan."
      ],
      ans: 3,
      exp: "ISP aboga por interfaces pequeñas y cohesivas organizadas por capacidad (menú a la carta), en lugar de contratos monolíticos gigantes que forzarían a implementar métodos vacíos o inútiles."
    },
    {
      id: 12,
      topic: "I — Interface Segregation",
      diagramSnippet: "interface DispositivoOficina {\n  void imprimir();\n  void escanear();\n  void enviarFax();\n}",
      q: "¿Cómo se corrige la violación de ISP si 'ImpresoraSencilla' únicamente cuenta con capacidad de impresión?",
      opts: [
        "Implementando la interfaz y dejando escanear() y enviarFax() vacíos para no mostrar errores al usuario.",
        "Agregando librerías emuladoras en la máquina virtual que simulen un dispositivo escáner por software.",
        "Lanzando excepciones de tiempo de ejecución cada vez que se invoquen los métodos faltantes del equipo.",
        "Segregando en interfaces finas (Imprimible, Escaneable), firmando solo la capacidad que el equipo posee."
      ],
      ans: 3,
      exp: "La solución correcta consiste en segregar la interfaz inflada en interfaces independientes: Imprimible y Escaneable. La impresora sencilla firma solo Imprimible, sin código muerto ni excepciones."
    },
    {
      id: 13,
      topic: "D — Dependency Inversion",
      q: "¿Cuál es el enunciado formal del Principio de Inversión de Dependencias (DIP) presentado por Uncle Bob?",
      opts: [
        "El alto nivel no debe depender del bajo nivel; ambos deben depender siempre de abstracciones comunes.",
        "Las capas de bajo nivel deben heredar siempre de controladores web para procesar eventos del usuario.",
        "Las llamadas de servicio deben estructurarse de abajo hacia arriba para notificar cambios de estado.",
        "Las clases de negocio deben instanciar directamente sus conexiones hacia gestores de base de datos."
      ],
      ans: 0,
      exp: "DIP establece dos reglas: los módulos de alto nivel no deben depender de los de bajo nivel (ambos dependen de abstracciones), y las abstracciones no deben depender de los detalles."
    },
    {
      id: 14,
      topic: "D — Dependency Inversion",
      diagramSnippet: "class Notificador {\n  private ServicioEmail email;\n  public Notificador() {\n    this.email = new ServicioEmail(); // (?)\n  }\n}",
      q: "¿Por qué hacer 'new ServicioEmail()' dentro del constructor viola gravemente el principio DIP?",
      opts: [
        "Porque exige que el servicio implemente interfaces serializables para guardarse en memoria volátil.",
        "Porque acopla el código a una clase fija, impidiendo inyectar un Mock en pruebas unitarias con JUnit.",
        "Porque la máquina virtual de Java bloquea las llamadas sincrónicas generadas mediante la palabra new.",
        "Porque los estándares orientados a objetos prohíben instanciar clases que posean métodos públicos."
      ],
      ans: 1,
      exp: "Hacer 'new' dentro del constructor suelda rígidamente la clase a una implementación concreta, imposibilitando inyectar Mocks o Stubs para realizar pruebas unitarias aisladas con JUnit."
    },
    {
      id: 15,
      topic: "SOLID y Patrones de Diseño",
      q: "Según la tabla comparativa analizada en la sesión, ¿qué principios SOLID fundamentan al patrón de diseño 'Strategy'?",
      opts: [
        "Principios S e I, al estructurar interfaces pequeñas que aíslan la comunicación con repositorios.",
        "Principios L y S, al definir jerarquías de herencia donde las subclases sobreescriben métodos padre.",
        "Principios I y L, al convertir contratos incompatibles para reutilizar clases legacy del sistema.",
        "Principios O y D, al enchufar algoritmos sin editar código (OCP) dependiendo de una abstracción (DIP)."
      ],
      ans: 3,
      exp: "El patrón Strategy materializa OCP (permite conectar nuevos algoritmos intercambiables sin modificar la clase contexto) y DIP (el contexto depende de la abstracción de la estrategia)."
    },
    {
      id: 16,
      topic: "Revisiones de Código (Pull Requests)",
      q: "Durante la revisión de un Pull Request en el taller, ¿cuál de las siguientes preguntas evalúa correctamente el principio SRP?",
      opts: [
        "¿Debo modificar esta clase si cambia la base de datos Y también si cambia una regla del negocio?",
        "¿Cada vez que agregamos un tipo nuevo tenemos que abrir este archivo y colocar otro bloque else if?",
        "¿Existen subclases en el modelo que lanzan UnsupportedOperationException o tienen métodos vacíos?",
        "¿Mi clase hace new a servicios concretos de bajo nivel en vez de recibir la interfaz por parámetro?"
      ],
      ans: 0,
      exp: "La pregunta de oro para SRP es verificar si la clase posee más de un motivo para cambiar (por ejemplo, si mezclar cambios de persistencia en base de datos altera la lógica de negocio)."
    }
  ]
};
