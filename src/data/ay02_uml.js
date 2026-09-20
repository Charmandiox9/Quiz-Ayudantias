export const ay02Uml = {
  id: "ay02",
  code: "AYUDANTIA2",
  number: 2,
  title: "Ayudantía N°2: Procesos, Requisitos y Diagramas UML",
  subtitle: "Waterfall vs Ágil, RF/RNF, HU e INVEST, Casos de Uso, Clases, Actividad, Secuencia y Paquetes",
  course: "Ingeniería de Software",
  semester: "2026-02",
  description: "Evaluación formativa sobre procesos de desarrollo, especificación de requisitos e historias de usuario, y modelado estructural y dinámico con diagramas UML.",
  defaultTimerSeconds: 60,
  pointsPerQuestion: 1000,
  questions: [
    {
      id: 1,
      topic: "Procesos de Software",
      q: "En el modelo Waterfall (Cascada), ¿cuál es el principal problema o riesgo al compararlo con un enfoque Ágil?",
      opts: [
        "Exige automatizar la totalidad de las pruebas de integración desde el primer día de trabajo.",
        "Impide utilizar lenguajes orientados a objetos durante la etapa de construcción.",
        "El cliente solo ve el resultado al final, haciendo muy costosos los cambios tardíos.",
        "Obliga a realizar sprints de dos semanas con incrementos funcionales validados."
      ],
      ans: 2,
      exp: "En Cascada las fases son secuenciales (Requisitos, Diseño, Implementación, Pruebas, Mantenimiento). El cliente ve el software al final, por lo que cualquier cambio resulta muy costoso."
    },
    {
      id: 2,
      topic: "Manifiesto Ágil",
      q: "Según los cuatro valores del Manifiesto Ágil (2001) revisados en la sesión, ¿qué se valora POR SOBRE la documentación exhaustiva?",
      opts: [
        "El software funcionando.",
        "El seguimiento estricto del plan.",
        "La negociación de los contratos.",
        "Los procesos y las herramientas."
      ],
      ans: 0,
      exp: "El Manifiesto Ágil establece: Individuos sobre procesos, Software funcionando sobre documentación extensiva, Colaboración sobre contratos y Respuesta al cambio sobre seguir un plan."
    },
    {
      id: 3,
      topic: "Requisitos No Funcionales (RNF)",
      q: "En la sesión se recalcó que un RNF debe formularse siempre con una métrica verificable. ¿Cuál de los siguientes cumple esta regla?",
      opts: [
        "El sistema debe poseer una interfaz moderna, atractiva y completamente cómoda para el usuario.",
        "La plataforma web tiene que responder a todas las consultas de manera muy veloz y eficiente.",
        "La base de datos debe ser completamente robusta y segura ante fallas imprevistas de red.",
        "El 99% de las búsquedas de salas deben responder en un tiempo menor a 1 segundo."
      ],
      ans: 3,
      exp: "Un Requisito No Funcional (el CÓMO) no debe ser ambiguo como \"debe ser rápido\" o \"seguro\", sino verificable objetivamente con una métrica cuantificable (ejemplo: 99% en < 1 segundo)."
    },
    {
      id: 4,
      topic: "Requisitos Funcionales (RF)",
      q: "Considerando los ejemplos analizados en la presentación, ¿cuál de las siguientes opciones corresponde a un Requisito Funcional (RF)?",
      opts: [
        "Garantizar una disponibilidad mensual del 99,9% en los servidores de la institución.",
        "Bloquear el acceso al usuario que registre una deuda pendiente por entrega tardía.",
        "Cifrar la totalidad de las comunicaciones utilizando certificados TLS de 256 bits.",
        "Mantener el consumo de memoria del backend por debajo del límite de 512 megabytes."
      ],
      ans: 1,
      exp: "Los Requisitos Funcionales definen el QUÉ del sistema (acciones y servicios concretos: consultar disponibilidad, bloquear por deuda, calcular totales, etc.)."
    },
    {
      id: 5,
      topic: "Historias de Usuario (HU)",
      q: "Una Historia de Usuario ágil se compone de las 3C: Tarjeta, Conversaciones y Confirmación. ¿Qué representa la Confirmación?",
      opts: [
        "La firma legal del contrato acordado entre el cliente y los directores del proyecto general.",
        "La estimación del esfuerzo en puntos de historia durante la planificación del sprint actual.",
        "Los criterios de aceptación objetivos expresados bajo el formato Given / When / Then.",
        "El diagrama de arquitectura de paquetes antes de comenzar la codificación del código fuente."
      ],
      ans: 2,
      exp: "La Confirmación corresponde a los criterios de aceptación que permiten validar si la historia está completada (habitualmente redactados en formato BDD: Dado que / Cuando / Entonces)."
    },
    {
      id: 6,
      topic: "Criterio INVEST",
      q: "Dentro del criterio INVEST para redactar buenas Historias de Usuario, ¿qué significa que una historia sea \"Negotiable\" (Negociable)?",
      opts: [
        "Que su alcance es ajustable mediante la conversación continua entre el equipo y el cliente.",
        "Que carece de dependencias técnicas con respecto a otras historias del product backlog.",
        "Que aporta un retorno económico o valor de negocio demostrable para los usuarios finales.",
        "Que el equipo de desarrollo puede estimar su complejidad técnica sin ninguna incertidumbre."
      ],
      ans: 0,
      exp: "Negotiable (Negociable) implica que la historia no es un contrato rígido e inmutable, sino una invitación a conversar y pactar detalles entre el cliente y el equipo de desarrollo."
    },
    {
      id: 7,
      topic: "Casos de Uso (Estructura)",
      q: "En la estructura formal de un Caso de Uso, ¿a qué corresponde el \"flujo normal\" o \"camino feliz\"?",
      opts: [
        "Al catálogo completo de fallas y excepciones registrado con códigos como 2a y 3b.",
        "A la secuencia principal de pasos exitosos cuando todo funciona según lo esperado.",
        "Al conjunto de permisos y precondiciones de red que habilitan iniciar la sesión de usuario.",
        "A las tablas relacionales que el motor de base de datos actualiza en la transacción."
      ],
      ans: 1,
      exp: "El flujo normal documenta la sucesión lineal ideal de pasos (máximo 9 según el estándar visto en la sesión) donde el actor alcanza su objetivo sin interferencias ni errores."
    },
    {
      id: 8,
      topic: "Diagrama de Casos de Uso",
      q: "En el Diagrama de Casos de Uso (UML) del sistema de reservas, ¿cuál es el rol formal de un \"Actor\"?",
      opts: [
        "Una función o servicio interno programado dentro de la frontera del sistema de software.",
        "Una clase abstracta de datos encargada de validar la autenticación de los usuarios.",
        "Un servidor físico o base de datos que procesa peticiones en segundo plano continuo.",
        "Una entidad externa (humana o sistema externo) que interactúa de forma activa con el CU."
      ],
      ans: 3,
      exp: "Un Actor (representado gráficamente como una figura de palo o stick figure) es cualquier ente externo a la frontera del sistema que interactúa con los casos de uso."
    },
    {
      id: 9,
      topic: "Relaciones en Casos de Uso",
      q: "En el caso de reservas analizado, ¿por qué \"Crear Reserva\" se conecta mediante «include» hacia \"Enviar Notificación\"?",
      opts: [
        "Porque enviar la notificación es un subproceso obligatorio que siempre se debe ejecutar.",
        "Porque enviar el mensaje es una opción facultativa que el usuario puede desmarcar si desea.",
        "Porque Notificación representa una clase padre abstracta de la cual hereda la reserva.",
        "Porque la notificación solo se envía si ocurre una falla inesperada al guardar la reserva."
      ],
      ans: 0,
      exp: "La relación «include» es incondicional y obligatoria: la ejecución del caso de uso base (Crear Reserva) necesariamente desencadena e incorpora el caso incluido (Enviar Notificación)."
    },
    {
      id: 10,
      topic: "Diagrama de Clases UML",
      q: "¿Cómo se representa gráficamente la relación de Herencia (generalización) en un Diagrama de Clases según el estándar UML?",
      opts: [
        "Línea continua con un rombo sólido relleno de color negro en el extremo de la clase padre.",
        "Línea discontinua que finaliza en una flecha abierta apuntando hacia la subclase derivada.",
        "Línea continua con un triángulo cerrado hueco en el extremo que apunta a la superclase.",
        "Línea sólida simple con multiplicidad cardinal 1 a muchos indicada en ambos extremos."
      ],
      ans: 2,
      exp: "La generalización o herencia se modela con una línea continua y un triángulo hueco (sin relleno) apuntando siempre hacia la superclase o clase padre (ejemplo: Administrador hereda de Usuario)."
    },
    {
      id: 11,
      topic: "Diagrama de Clases UML",
      q: "En el modelado de clases, ¿cuál es la diferencia esencial entre Composición (rombo negro) y Agregación (rombo hueco)?",
      opts: [
        "En la composición los componentes subordinados pueden existir si se destruye el contenedor.",
        "En la composición la parte no existe sin el todo: su ciclo de vida depende del contenedor.",
        "La agregación utiliza exclusivamente líneas punteadas con flechas abiertas direccionales.",
        "La agregación impide que múltiples clases compartan referencias a una misma instancia."
      ],
      ans: 1,
      exp: "La Composición (rombo relleno) representa una relación todo-parte fuerte donde la destrucción del contenedor implica la destrucción de sus partes. La Agregación (rombo vacío) es una unión débil."
    },
    {
      id: 12,
      topic: "Diagrama de Clases UML",
      q: "En el diagrama del Sistema de Reservas, la asociación entre Usuario y Reserva muestra multiplicidad 1 a *. ¿Qué significa?",
      opts: [
        "Cada reserva del sistema puede ser compartida en paralelo por múltiples usuarios simultáneos.",
        "El sistema exige que todo usuario registrado mantenga exactamente una reserva obligatoria.",
        "Las reservas son objetos inmutables que no admiten cancelaciones ni cambios de estado en BD.",
        "Un usuario puede poseer cero o muchas reservas, pero cada reserva pertenece a un solo usuario."
      ],
      ans: 3,
      exp: "La cardinalidad 1 a * señala que un usuario puede tener asociadas múltiples reservas (0 o más), mientras que cada instancia de Reserva queda vinculada unívocamente a 1 usuario creador."
    },
    {
      id: 13,
      topic: "Diagrama de Actividad",
      q: "En el Diagrama de Actividad de \"Crear Reserva\", ¿cuál es la finalidad técnica de los carriles o Swimlanes (Estudiante y Sistema)?",
      opts: [
        "Medir la tasa de fallos de red y el consumo de memoria RAM durante cada etapa del proceso.",
        "Dividir los archivos fuente en módulos de frontend y controladores backend de la aplicación.",
        "Delimitar claramente qué rol o subsistema es responsable de llevar a cabo cada actividad.",
        "Definir los permisos criptográficos requeridos para modificar las tablas de base de datos."
      ],
      ans: 2,
      exp: "Los Swimlanes organizan visualmente las actividades asignando responsabilidades: en el ejemplo, \"Seleccionar fecha\" compete a Estudiante, mientras \"Verificar disponibilidad\" compete a Sistema."
    },
    {
      id: 14,
      topic: "Diagrama de Actividad",
      q: "¿Qué regla formal deben cumplir las transiciones salientes desde un rombo de decisión en un Diagrama de Actividad UML?",
      opts: [
        "Llevar guardas booleanas entre corchetes ([Sí], [No]) que resulten mutuamente excluyentes.",
        "Ejecutarse simultáneamente en paralelo mediante hilos concurrentes hasta una barra de unión.",
        "Conectarse directamente con el círculo negro de inicio para reiniciar el flujo del proceso.",
        "Terminar obligatoriamente en un nodo diana de fin de actividad para detener la ejecución."
      ],
      ans: 0,
      exp: "Un rombo de decisión representa una bifurcación condicional disyuntiva: cada camino saliente debe contener una guarda entre corchetes (ej: [Sí] y [No]) que determine qué rama transitar."
    },
    {
      id: 15,
      topic: "Diagrama de Secuencia",
      q: "En el Diagrama de Secuencia de \"Crear Reserva\", ¿cómo se distinguen los mensajes síncronos de los mensajes de retorno?",
      opts: [
        "Mensaje síncrono con línea punteada abierta y retorno con rombo sólido en el participante.",
        "Ambos tipos se grafican de forma idéntica sin emplear ningún tipo de punta direccional.",
        "Mensaje síncrono con flecha bidireccional continua y retorno con barra vertical activa.",
        "Mensaje síncrono con línea sólida y flecha triangular; retorno con línea discontinua de vuelta."
      ],
      ans: 3,
      exp: "Un mensaje síncrono (llamada bloqueante hacia :UI, :ReservaService o :Database) usa línea continua y punta sólida (->). El mensaje de respuesta o confirmación usa línea discontinua (- - ->)."
    },
    {
      id: 16,
      topic: "Diagrama de Paquetes",
      q: "En la arquitectura por capas analizada (Presentación, Servicio, Repositorio, Modelo), ¿cuál es la regla cardinal de dependencias?",
      opts: [
        "Las capas inferiores deben importar a las superiores para emitir eventos y notificaciones reactivas.",
        "Las dependencias siempre van hacia abajo: una capa no debe importar de la capa que está sobre ella.",
        "La capa de Presentación debe comunicarse directamente con la Base de Datos sin pasar por Servicio.",
        "Todas las capas pueden relacionarse bidireccionalmente siempre que sus clases sean públicas."
      ],
      ans: 1,
      exp: "La regla de oro de la arquitectura por capas estipula que las dependencias fluyen estrictamente hacia abajo: Presentación -> Servicio -> Repositorio -> Modelo. Ninguna capa importa hacia arriba."
    }
  ]
};
