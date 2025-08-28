🔐 Cybersecurity Tools Hub - SecGuide
Una aplicación web para explorar, aprender y evaluar herramientas de ciberseguridad, con sistema de autenticación, valoraciones y panel de administración.

🚀 Características
Catálogo de herramientas: Organizadas por categorías (OSINT, Explotación, Forense, etc.)

Sistema de valoraciones: Califica herramientas con estrellas (1-5)

Autenticación de usuarios: Registro e inicio de sesión

Panel de administración: Gestiona categorías y herramientas

Sugerencias de usuarios: Los usuarios pueden proponer nuevas herramientas

Base de datos en tiempo real: Usando Firebase Firestore

🛠️ Tecnologías utilizadas
Frontend: HTML5, CSS3, JavaScript (ES6+)

Backend: Firebase (Firestore, Authentication)

Estilos: CSS personalizado con gradientes y animaciones

🎯 Cómo contribuir
¡Agradecemos las contribuciones! Puedes ayudar de varias formas:

1. Reportar errores o sugerir mejoras
Abre un issue

Describe el problema o sugerencia con detalle

Incluye capturas de pantalla si es posible

2. Añadir nuevas herramientas
Haz fork del proyecto

Agrega la herramienta en el formato correcto:

javascript
{
  name: "Nombre de la herramienta",
  brief: "Descripción breve",
  cats: [id_categoria], // Array con IDs de categorías
  func: "Funcionalidades principales",
  platform: "Plataformas compatibles",
  license: "Tipo de licencia",
  link: "URL oficial",
  article: "Descripción detallada..."
}
Envía un Pull Request

3. Mejorar la interfaz o funcionalidades
Implementa nuevas características

Mejora el diseño responsive

Optimiza el rendimiento

Añade tests

4. Traducciones
¿Hablas otro idioma? ¡Ayuda a traducir la aplicación!

📋 Estructura del proyecto
text
secguide/
│
├── index.html          # Versión inicial (sin Firebase)

🐛 Problemas comunes y soluciones
Error de configuración de Firebase
Verifica que los datos de configuración en el código coincidan con tu proyecto Firebase

Asegúrate de que Firestore y Authentication estén habilitados

Las valoraciones no se guardan
Verifica las reglas de seguridad de Firestore (deben permitir escritura para usuarios autenticados)

Problemas de autenticación
Revisa que el proveedor Email/Contraseña esté habilitado en Firebase Authentication

📝 Reglas de seguridad de Firestore
Asegúrate de configurar estas reglas en Firestore:

javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Herramientas: lectura pública, escritura para admins
    match /tools/{tool} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Categorías: lectura pública, escritura para admins
    match /categories/{category} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Usuarios: solo lectura/escritura del propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
👥 Autores
[Deimian Rojas M] - Desarrollo inicial - [dmrj]

📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.md para detalles.

🙏 Agradecimientos
Equipo de Firebase por la excelente plataforma

Comunidad de ciberseguridad por las contribuciones

