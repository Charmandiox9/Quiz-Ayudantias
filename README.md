# Quiz Ayudantía Ingeniería de Software

Plataforma web interactiva para la ejecución de quizzes formativos, talleres prácticos y dinámicas de evaluación en tiempo real durante las sesiones de ayudantía de **Ingeniería de Software (Semestre 2026-02)**.

El sistema fue diseñado bajo principios rigurosos de **Clean Code**, **SOLID**, **DevSecOps** y en estricto cumplimiento con la **Ley N° 21.719 sobre Protección de Datos Personales de Chile**.

---

## Tecnologías Utilizadas

### Frontend y Renderizado
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5_Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/API/Canvas_API)
[![CSS3](https://img.shields.io/badge/CSS3_Vanilla-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F56565?style=for-the-badge&logo=feather&logoColor=white)](https://lucide.dev/)

### Backend, Red y Tiempo Real
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![WebSockets](https://img.shields.io/badge/WebSockets-Realtime_Broadcast-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/es/docs/Web/API/WebSockets_API)
[![QR Code](https://img.shields.io/badge/QRCode_Generator-2563EB?style=for-the-badge&logo=qrcode&logoColor=white)](https://github.com/soldair/node-qrcode)

### Audio y Síntesis Procedural
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural_Synthesis-4F46E5?style=for-the-badge&logo=soundcharts&logoColor=white)](https://developer.mozilla.org/es/docs/Web/API/Web_Audio_API)

### Calidad, Seguridad y Normativa
[![Oxlint](https://img.shields.io/badge/Oxlint-0_Warnings_/_0_Errors-0EA5E9?style=for-the-badge&logo=oxc&logoColor=white)](https://oxc.rs/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Ley N° 21.719](https://img.shields.io/badge/Ley_N°_21.719-Chile_Data_Privacy-B91C1C?style=for-the-badge&logo=shield&logoColor=white)](https://www.bcn.cl/)
[![GitHub](https://img.shields.io/badge/GitHub-Marton1123-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Marton1123)

---

## 1. Características Principales

* **3 Modos de Operación Integrados**:
  * **Modo Docente / Proyector**: Pantalla principal para proyección en aula con temporizador circular animado, gráfico de barras de votación en tiempo real (estilo Kahoot/Mentimeter), revelación de respuesta con fundamento técnico y podio con medallas.
  * **Unirse desde el Celular**: Interfaz móvil táctil y accesible para que los estudiantes voten las alternativas (A, B, C, D) mediante WebSockets en tiempo real sin requerir instalación previa ni cuentas de usuario.
  * **Modo Práctica Individual (Solo)**: Permite a los estudiantes responder las preguntas a su propio ritmo con retroalimentación inmediata, justificación teórica, carrusel de diagnóstico de errores y control de precisión/puntaje.
* **Sistema de Recompensas y Certificación de Dominio**:
  * **Sobre de Cera 3D Auténtico**: Animación de apertura de sobre con solapa triangular en perspectiva 3D y sello de cera oficial en alta resolución (`seal_logo.png`).
  * **Tarjeta Holográfica 3D**: Física de inclinación proporcional a la relación de aspecto (máximo 11° vertical, 13° horizontal), amortiguación suave (`cubic-bezier`), aceleración por hardware (`will-change: transform`) y shader reactivo de foil arcoíris con bisel especular.
  * **Síntesis de Audio Procedural (Web Audio API)**: Motor de audio sin dependencias externas pesadas con eventos táctiles discretos:
    * Ruptura de cera al presionar el sello (`playTear`).
    * Acorde celestial de revelación y destello dorado (`playReveal`).
    * Succión y absorción física hacia el botón (`playSuction`).
    * Llegada y retorno táctil de la carta al centro (`playCardReturn`).
    * Silencio durante el desplazamiento del cursor para garantizar una interacción visual limpia y sin fatiga auditiva.
  * **Exportación en Canvas de Ultra Alta Definición (1792 x 2400)**: Renderizado de la carta completa en formato PNG sin pérdida, estampando de forma discreta dentro del marco inferior el número de serie criptográfico (`#SOLID-XXXX-XXXX` / `#UML-XXXX-XXXX`), el curso, el semestre y el isotipo vectorial oficial de GitHub junto a `@Marton1123`.
  * **Servicio de Auditoría y Persistencia de Certificados (`certificateService.js`)**: Registro de descargas en almacenamiento local y en tabla remota de Supabase (`card_downloads`) sin recolectar ningún dato personal sensible.
* **Catálogo Modular de Ayudantías**:
  * **Ayudantía N°2**: Modelamiento Conceptual y Diagramas UML (Casos de Uso, Clases, Actividades, Secuencia, Detección de Antipatrones).
  * **Ayudantía N°3**: Principios SOLID de Diseño Orientado a Objetos (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion).
* **Cumplimiento Legal (Ley N° 21.719 - Chile)**: Privacidad desde el diseño y por defecto, minimización de datos mediante alias efímeros, sin persistencia de datos sensibles y sin cookies de rastreo comercial.

---

## 2. Arquitectura de Software

El proyecto aplica una separación estricta de responsabilidades (SoC) y principios SOLID para garantizar mantenibilidad y extensibilidad:

```text
src/
|-- config/              # Parámetros globales y definición legal de privacidad
|   |-- constants.js     # Tiempos, colores de alto contraste y fases del juego
|   |-- privacyPolicy.js # Marco normativo Ley 21.719 de Chile
|-- services/            # Capa de integración, audio y persistencia (DIP)
|   |-- supabaseClient.js# Conexión segura con tolerancia a modo offline
|   |-- realtimeService.js# Abstracción de canales broadcast WebSockets
|   |-- audioService.js  # Motor procedural de audio Web Audio API
|   |-- certificateService.js# Auditoría seudónima de descargas (Ley 21.719)
|-- utils/               # Sanitización y utilidades de seguridad (DevSecOps)
|   |-- sanitizers.js    # Prevención XSS y generación de alias anónimos
|   |-- session.js       # Manejo de sesiones locales temporales
|-- data/                # Módulos de contenido desacoplados (Open/Closed)
|   |-- index.js         # Catálogo maestro extensible de ayudantías
|   |-- ay02_uml.js      # Banco de 16 preguntas de Modelamiento UML
|   |-- ay03_solid.js    # Banco de 16 preguntas de Principios SOLID
|-- components/          # Componentes visuales genéricos y reutilizables
|   |-- common/          # Button, Card, Badge, PrivacyNotice, QRCodeDisplay, RewardCard
|   |-- quiz/            # TimerRing, VoteBars, Leaderboard, QuestionCard, MistakesCarousel
|-- modes/               # Orquestadores de vistas según rol
|   |-- HubScreen.jsx    # Menú principal y selector de ayudantía
|   |-- HostScreen.jsx   # Panel de control para el proyector
|   |-- PlayerScreen.jsx # Interfaz para el celular del alumno
|   |-- SoloScreen.jsx   # Práctica autónoma individual
|   |-- FastJoinScreen.jsx# Acceso directo mediante escaneo de código QR
|-- App.jsx              # Enrutador principal de la aplicación
|-- index.css            # Sistema de diseño y tokens visuales (Navy / Slate / Amber)
public/
|-- assets/              # Ilustraciones de alta resolución y sellos oficiales
|   |-- ay02_uml.png     # Ilustración de recompensa Ayudantía 2
|   |-- ay03_solid.png   # Ilustración de recompensa Ayudantía 3
|   |-- seal_logo.png    # Sello de cera oficial 3D (2048x2048)
|   |-- favicon_hi_res.png# Ícono de aplicación en alta resolución
supabase/
|-- schema_card_downloads.sql # Esquema SQL seguro con RLS para auditoría
```

### Principios SOLID Aplicados:
* **Single Responsibility (SRP)**: Cada componente resuelve una sola necesidad visual o lógica (`TimerRing` calcula y anima el tiempo; `VoteBars` proyecta la distribución de votos; `RewardCard` gestiona la experiencia física de certificación; `audioService` encapsula la síntesis Web Audio).
* **Open/Closed (OCP)**: Para incorporar una nueva ayudantía (ejemplo: Ayudantía 4 de Patrones de Diseño GoF), se añade el archivo en `src/data/` y se enlaza en `src/data/index.js` sin modificar el motor de evaluación ni las vistas.
* **Liskov Substitution (LSP)**: Todos los módulos de contenido en `src/data/` cumplen la misma firma estructural (`id`, `title`, `badge`, `questions`), permitiendo que el Hub y los modos de juego operen polimórficamente sobre cualquiera de ellos.
* **Interface Segregation (ISP)**: Los componentes genéricos exponen props especializadas y opcionales, evitando que componentes de presentación dependan de estructuras complejas no requeridas.
* **Dependency Inversion (DIP)**: Los componentes de interfaz interactúan con servicios abstractos (`RealtimeQuizService`, `certificateService`), desacoplados del cliente de base de datos o de APIs externas directas.

---

## 3. Seguridad y DevSecOps

* **Protección contra XSS y Sanitización**: La función `sanitizeNickname` limpia etiquetas HTML, caracteres de inyección y restringe la longitud a 15 caracteres como máximo.
* **Gestión Segura de Credenciales**: Las variables de entorno (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`) están configuradas para consumir claves anónimas públicas protegidas por políticas de seguridad a nivel de fila (RLS). No existen tokens de servicio ni credenciales maestras en el cliente.
* **Auditoría de Dependencias y Linting**:
  * 0 vulnerabilidades conocidas en análisis de dependencias (`npm audit`).
  * 0 errores y 0 advertencias en análisis estático continuo (`npx oxlint`).
* **Higiene de Código Profesional**: Código limpio sin emojis, comentarios técnicos explicativos estrictamente necesarios y control de tipos implícito mediante validaciones robustas.

---

## 4. Protección de Datos Personales (Ley N° 21.719 - Chile)

Esta plataforma implementa técnicamente los principios fundamentales de la nueva ley de protección de datos chilena:

1. **Minimización de Datos**: No se solicita, procesa ni almacena RUT, nombre completo, correo institucional, número telefónico ni identificadores biométricos.
2. **Uso Exclusivo de Alias Efímeros**: Los estudiantes participan mediante un apodo de libre elección o un alias aleatorio generado localmente (ej: `Estudiante-4821`).
3. **Limitación de Conservación**: La información de la sesión en tiempo real existe únicamente en la memoria volátil del canal de comunicación y se destruye al cerrar la sala.
4. **Seudonimización Criptográfica de Certificados**: Las descargas de tarjetas de recompensa registran únicamente un número de serie aleatorio generado criptográficamente (`#SOLID-XXXX-XXXX`) junto con el puntaje y la precisión porcentual obtenida, garantizando que ningún registro pueda asociarse a una persona natural identificable.
5. **Sin Rastreos Invasivos**: No se emplean cookies publicitarias ni herramientas de telemetría externa.

---

## 5. Instalación y Ejecución Local

### Prerrequisitos:
* Node.js v18 o superior.
* Gestor de paquetes npm.

### Pasos:
```bash
# 1. Clonar el repositorio
git clone https://github.com/Marton1123/Quiz-Ayudantia-Ingenieria-Software.git
cd Quiz-Ayudantia-Ingenieria-Software

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional para sincronización en la nube Supabase)
cp .env.example .env
# Editar .env con tus credenciales de Supabase si deseas sincronización en línea

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173/**

---

## 6. Verificación de Calidad y Construcción

Para ejecutar las verificaciones de código y compilar el paquete de producción:

```bash
# Análisis estático de código (0 advertencias, 0 errores)
npx oxlint

# Compilación optimizada para producción
npm run build
```

---

## 7. Despliegue en la Nube (Vercel / Netlify)

1. Conectar el repositorio de GitHub en Vercel o Netlify.
2. Configurar las variables de entorno en el panel del proyecto:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
3. Comando de construcción: `npm run build`
4. Directorio de salida: `dist`

Con este único despliegue, la URL será permanente y válida para todas las ayudantías del semestre.

---

## 8. Cómo Agregar una Nueva Ayudantía

1. Crear el archivo `src/data/ay04_patrones.js` definiendo la estructura estándar:
```javascript
export const ay04Patrones = {
  id: "ay04",
  code: "PATRONES",
  title: "Ayudantía N°4: Patrones de Diseño GoF",
  badge: "Patrones GoF",
  course: "Ingeniería de Software",
  cardImage: "/assets/ay04_patrones.png",
  questions: [
    {
      id: 1,
      topic: "Creacionales",
      q: "¿Cuál es el propósito principal del patrón Factory Method?",
      opts: [
        "Definir una interfaz para crear un objeto delegando la instanciación a las subclases.",
        "Garantizar que una clase tenga solo una instancia en memoria.",
        "Convertir la interfaz de una clase en otra interfaz esperada por los clientes.",
        "Separar la construcción de un objeto complejo de su representación final."
      ],
      ans: 0,
      exp: "Factory Method define una interfaz para la creación de objetos, permitiendo que las subclases decidan qué clase instanciar."
    }
  ]
};
```

2. Registrar la ayudantía en `src/data/index.js`:
```javascript
import { ay04Patrones } from "./ay04_patrones.js";

export const AYUDANTIAS = [
  ay02Uml,
  ay03Solid,
  ay04Patrones,
];
```

3. La nueva ayudantía aparecerá automáticamente en el Hub principal, completamente funcional para el modo proyector, unirse desde celular y práctica individual, incluyendo su propia carta de recompensa certificada.
