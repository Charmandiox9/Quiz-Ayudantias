import type { QuizDefinition } from "../types";

export const ay03Solid: QuizDefinition = {
  id: "ay03",
  code: "AYUDANTIA3",
  altCodes: ["AY03-SOLID", "SOLID"],
  number: 3,
  title: "Ayudantía N°3: Principios SOLID",
  subtitle: "S (Responsabilidad Única), O (Abierto/Cerrado), L (Sustitución Liskov), I (Segregación Interfaces), D (Inversión Dependencias)",
  course: "Ingeniería de Software",
  semester: "2026-02",
  cardImage: "/assets/ay03_solid.png",
  description: "Evaluación formativa sobre fundamentos prácticos, analogías cotidianas, code smells y refactorización orientada a objetos con principios SOLID.",
  defaultTimerSeconds: 60,
  pointsPerQuestion: 1000,
  questions: [
    {
      id: 1,
      topic: "Fundamentos de Diseño",
      q: "Según los síntomas de código sin diseño explicados en la sesión, ¿qué es la \"Fragilidad\" en el software?",
      opts: [
        "La necesidad de modificar decenas de clases vinculadas al intentar hacer un cambio pequeño.",
        "Corregir un error en una parte del sistema provoca fallas imprevistas en módulos no relacionados.",
        "El sistema se cae frecuentemente en producción por falta de pruebas de carga y rendimiento.",
        "El software responde con lentitud debido al consumo excesivo de memoria del procesador local."
      ],
      ans: 1,
      exp: "Fragilidad ocurre cuando arreglas algo en un módulo y se rompe otra parte que nada que ver. Rigidez es cuando un cambio pequeño te obliga a editar muchos archivos a la vez."
    },
    {
      id: 2,
      topic: "S — Single Responsibility",
      q: "¿Cuál es el objetivo principal del Principio de Responsabilidad Única (SRP) según lo visto en clase?",
      opts: [
        "Obligar a que cada clase del proyecto tenga como máximo un único método público ejecutable.",
        "Escribir métodos breves y con pocos parámetros para facilitar la lectura del código fuente.",
        "Que cada clase tenga una sola razón para cambiar, asumiendo un único rol o trabajo delimitado.",
        "Organizar los archivos en carpetas separadas según si contienen lógica o diseño de interfaz."
      ],
      ans: 2,
      exp: "SRP no exige clases de un solo método, sino que la clase sea especialista: debe tener una sola razón para ser modificada (un solo rol bien delimitado)."
    },
    {
      id: 3,
      topic: "S — Single Responsibility",
      q: "¿Cuál de las siguientes situaciones es un ejemplo evidente de violación del principio SRP?",
      opts: [
        "Una clase \"Manager\" que calcula cobros, escribe directo en la base de datos y manda correos.",
        "Una clase que declara variables privadas y expone métodos públicos con nombres claros.",
        "Una clase de negocio que define constructores sobrecargados con distintos argumentos.",
        "Un archivo de configuración que almacena credenciales de acceso para conectarse al servidor."
      ],
      ans: 0,
      exp: "La típica \"God Class\" o \"Manager\" que mezcla reglas de negocio, persistencia SQL y envío de emails tiene múltiples motivos para cambiar, violando directamente SRP."
    },
    {
      id: 4,
      topic: "S — Single Responsibility",
      diagramSnippet: "class Reserva {\n  calcularCosto();\n  guardarEnBD(); // SQL\n  enviarConfirmacion(); // SMTP\n}",
      q: "En el ejemplo de la clase Reserva que calcula costos, guarda en SQL y envía emails, ¿cómo se aplica SRP?",
      opts: [
        "Unificar todas las funciones dentro de un método estático global para no instanciar objetos.",
        "Dividir en tres especialistas: una para el cálculo, otra para la BD y otra para los correos.",
        "Hacer que Reserva herede de una clase general de base de datos para no duplicar sentencias SQL.",
        "Reducir las líneas de código de cada método delegando la validación en funciones auxiliares."
      ],
      ans: 1,
      exp: "Se separa en tres especialistas independientes: Reserva (cálculo), ReservaRepositorio (base de datos) y NotificadorEmail (correo). Si cambia la BD, no tocas el cálculo."
    },
    {
      id: 5,
      topic: "O — Open / Closed",
      q: "¿Qué busca el Principio Abierto/Cerrado (OCP) usando la analogía del puerto USB explicada en la sesión?",
      opts: [
        "Hacer los métodos privados para que ningún otro programador pueda modificar su funcionamiento.",
        "Utilizar librerías y componentes de terceros para no tener que escribir algoritmos nuevos.",
        "Poder incorporar nuevas opciones creando clases nuevas sin necesidad de editar código probado.",
        "Evitar el uso de clases y funciones para que el programa consuma menos memoria en el equipo."
      ],
      ans: 2,
      exp: "OCP establece que el código debe estar abierto a la extensión (enchufar clases nuevas como un USB) pero cerrado a la modificación (sin desarmar ni arriesgar lo probado)."
    },
    {
      id: 6,
      topic: "O — Open / Closed",
      diagramSnippet: "public double calcular(String tipo) {\n  if (tipo == \"estudio\") return 1000;\n  else if (tipo == \"auditorio\") return 5000;\n}",
      q: "Al querer agregar una sala \"Laboratorio\", ¿por qué la solución con if/else rígido viola el principio OCP?",
      opts: [
        "Porque obliga a editar código ya probado, arriesgando introducir errores en las otras salas.",
        "Porque las instrucciones condicionales if/else están prohibidas en aplicaciones profesionales.",
        "Porque sería preferible usar una sentencia switch para que las condiciones queden ordenadas.",
        "Porque el código funciona más lento cada vez que se evalúa una condición lógica en ejecución."
      ],
      ans: 0,
      exp: "Cada nuevo requerimiento obliga a abrir y modificar el archivo que ya funcionaba, introduciendo el riesgo de regresión (arruinar salas probadas por tocar el mismo código)."
    },
    {
      id: 7,
      topic: "O — Open / Closed",
      q: "¿Cómo se resuelve correctamente el cálculo de costos de salas aplicando OCP sin usar bloques if/else?",
      opts: [
        "Almacenando los nombres de las salas en un archivo de texto para leerlos con un ciclo repetitivo.",
        "Haciendo que todas las salas hereden de una clase genérica que defina el precio por defecto.",
        "Definiendo una interfaz Sala para que cada sala calcule su costo mediante polimorfismo.",
        "Escribiendo funciones independientes en un mismo archivo para separar el cálculo de cada sala."
      ],
      ans: 2,
      exp: "Con la interfaz Sala, la función de cálculo solo pide sala.costoPorHora(). Si mañana agregas SalaLaboratorio, simplemente creas la clase sin tocar la función existente."
    },
    {
      id: 8,
      topic: "L — Liskov Substitution",
      q: "¿Cuál es la regla fundamental del Principio de Sustitución de Liskov (LSP)?",
      opts: [
        "Toda clase hija debe declarar exactamente los mismos atributos privados que su clase padre.",
        "Las clases hijas deben evitar sobreescribir métodos para mantener intacta la clase original.",
        "Las clases deben heredar de múltiples padres para reutilizar la mayor cantidad de código.",
        "Una subclase debe poder reemplazar a su clase base sin romper el comportamiento del programa."
      ],
      ans: 3,
      exp: "LSP exige que si usas una subclase en lugar de la clase base, el programa funcione normalmente sin sorpresas, caídas ni excepciones inesperadas para el cliente."
    },
    {
      id: 9,
      topic: "L — Liskov Substitution",
      q: "¿Qué nos enseña la analogía del \"pato a pilas\" sobre la herencia en programación orientada a objetos?",
      opts: [
        "Que no es recomendable modelar objetos del mundo real dentro de aplicaciones informáticas.",
        "Que heredar solo por parecido visual rompe el diseño si la hija no puede cumplir el contrato.",
        "Que los objetos creados mediante herencia consumen más memoria que los creados con composición.",
        "Que las funciones que requieren energía o baterías deben ejecutarse siempre en segundo plano."
      ],
      ans: 1,
      exp: "No heredes solo por \"parecido\" o por reutilizar código. Si la clase hija no puede cumplir lo que el padre promete (como un pingüino volando), la herencia está rota."
    },
    {
      id: 10,
      topic: "L — Liskov Substitution",
      diagramSnippet: "class Pinguino extends Ave {\n  @Override\n  public void volar() {\n    throw new UnsupportedOperationException();\n  }\n}",
      q: "Si Pinguino hereda de Ave y en volar() lanza UnsupportedOperationException, ¿por qué viola LSP?",
      opts: [
        "Porque las excepciones en programación solo deben emplearse para alertar problemas de red.",
        "Porque el método volar() debería renombrarse a nadar() para que no coincida con el padre.",
        "Porque rompe la expectativa: el cliente espera que toda Ave vuele y la excepción bota el sistema.",
        "Porque el compilador de Java no admite que una subclase modifique el comportamiento del padre."
      ],
      ans: 2,
      exp: "El cliente que recibe un Ave asume que puede llamar a volar(). Si un pingüino lanza una excepción en tiempo de ejecución, el contrato se rompió y el sistema colapsa."
    },
    {
      id: 11,
      topic: "I — Interface Segregation",
      q: "¿Qué promueve el Principio de Segregación de Interfaces (ISP) usando la analogía del menú a la carta?",
      opts: [
        "Diseñar una interfaz única y completa con todos los métodos posibles para todo el sistema.",
        "Evitar el uso de interfaces y usar solo clases concretas para escribir menos líneas de código.",
        "Obligar al usuario a completar todas las acciones disponibles dentro de una misma pantalla.",
        "Crear interfaces pequeñas y específicas, para que nadie deba firmar métodos que no necesita."
      ],
      ans: 3,
      exp: "En lugar de obligar a pedir un combo gigante de 5 platos (interfaz inflada), diseña contratos pequeños. Cada clase implementa solo las capacidades que realmente posee."
    },
    {
      id: 12,
      topic: "I — Interface Segregation",
      diagramSnippet: "interface DispositivoOficina {\n  void imprimir();\n  void escanear();\n  void enviarFax();\n}",
      q: "Si tienes una ImpresoraSencilla que solo imprime, ¿cómo resuelves la violación de ISP sin dejar métodos vacíos?",
      opts: [
        "Dejar los métodos vacíos o retornando null para que el programa no muestre errores en pantalla.",
        "Instalar controladores adicionales en la computadora para emular las funciones que faltan.",
        "Hacer que la impresora lance mensajes de advertencia en la consola cuando intenten usar el fax.",
        "Dividir en interfaces Imprimible y Escaneable, firmando solo la capacidad que el equipo posee."
      ],
      ans: 3,
      exp: "Se segregan los contratos: la impresora sencilla firma solo Imprimible. La multifuncional firma Imprimible y Escaneable. Cero código muerto, cero métodos vacíos."
    },
    {
      id: 13,
      topic: "D — Dependency Inversion",
      q: "¿Qué establece el Principio de Inversión de Dependencias (DIP) con la analogía del enchufe de pared?",
      opts: [
        "Que el alto nivel no debe depender del bajo nivel; ambos deben depender de abstracciones.",
        "Que las clases de bajo nivel deben tener mayor jerarquía de ejecución que las de alto nivel.",
        "Que las clases deben crear directamente sus objetos para tener control total de los datos.",
        "Que los artefactos de hardware deben reiniciarse automáticamente ante cortes de electricidad."
      ],
      ans: 0,
      exp: "Tu lámpara (alto nivel) no suelda cables a la pared (bajo nivel); se conecta a un enchufe estándar (abstracción). Ambos lados dependen de esa interfaz común."
    },
    {
      id: 14,
      topic: "D — Dependency Inversion",
      diagramSnippet: "class Notificador {\n  private ServicioEmail email;\n  public Notificador() {\n    this.email = new ServicioEmail(); // (?)\n  }\n}",
      q: "En la clase Notificador, ¿cuál es el gran problema práctico de hacer \"new ServicioEmail()\" dentro del constructor?",
      opts: [
        "Que instanciar objetos con la palabra new consume demasiada memoria en el servidor web.",
        "Que suelda la clase rígidamente, impidiendo inyectar un Mock para hacer pruebas con JUnit.",
        "Que obliga a declarar el servicio como público para que otras clases puedan acceder a él.",
        "Que el constructor tardará más tiempo en ejecutarse si la computadora no tiene internet."
      ],
      ans: 1,
      exp: "Hacer new adentro suelda la clase a una implementación fija. En tests unitarios con JUnit necesitas inyectar un Mock para no enviar correos reales ni depender de internet."
    },
    {
      id: 15,
      topic: "SOLID y Patrones de Diseño",
      q: "¿Qué principios SOLID fundamentan principalmente al patrón de diseño \"Strategy\" (Estrategia) visto en clase?",
      opts: [
        "Los principios S e I, porque organizan métodos pequeños dentro de paquetes independientes.",
        "El principio L únicamente, porque se limita a sobreescribir el comportamiento del padre.",
        "Ninguno de ellos, ya que los patrones de diseño no se relacionan con los principios SOLID.",
        "Los principios O y D, al enchufar algoritmos nuevos (OCP) dependiendo de una interfaz (DIP)."
      ],
      ans: 3,
      exp: "Strategy cumple OCP (puedes agregar nuevas estrategias sin modificar la clase contexto) y DIP (el contexto depende de la abstracción de la estrategia, no de clases fijas)."
    },
    {
      id: 16,
      topic: "Revisiones de Código (Pull Requests)",
      q: "Al revisar el código de un compañero en un Pull Request del taller, ¿qué pregunta te ayuda a detectar si viola SRP?",
      opts: [
        "¿Tengo que modificar esta clase si cambia la base de datos Y también si cambia una regla de negocio?",
        "¿Esta clase tiene más de cinco métodos públicos implementados dentro de su archivo principal?",
        "¿El compañero incluyó suficientes comentarios explicando lo que hace cada variable del archivo?",
        "¿El código compila correctamente sin mostrar advertencias sobre el uso de memoria en consola?"
      ],
      ans: 0,
      exp: "La pregunta de oro para SRP es identificar los motivos de cambio. Si un cambio en la persistencia de datos te obliga a alterar la lógica de negocio, la clase viola SRP."
    }
  ]
};
