# 🔐 Cybersecurity Tools Hub - SecGuide  

![GitHub repo size](https://img.shields.io/github/repo-size/dmrj/secguide?color=blue&style=flat-square)  
![GitHub license](https://img.shields.io/github/license/dmrj/secguide?color=green&style=flat-square)  
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?logo=firebase&logoColor=black&style=flat-square)  
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)  

**Una aplicación web para explorar, aprender y evaluar herramientas de ciberseguridad.**  
Incluye sistema de autenticación, valoraciones de usuarios y panel de administración para gestión de categorías y herramientas.  

---

## 🚀 Características  

- 📚 **Catálogo de herramientas**: Organizadas por categorías (OSINT, Explotación, Forense, etc.).  
- ⭐ **Sistema de valoraciones**: Califica herramientas con estrellas (1-5).  
- 👤 **Autenticación de usuarios**: Registro e inicio de sesión con Firebase Authentication.  
- 🛠️ **Panel de administración**: Gestión de categorías y herramientas para usuarios administradores.  
- 💡 **Sugerencias de usuarios**: Los usuarios pueden proponer nuevas herramientas.  
- 🔄 **Base de datos en tiempo real**: Implementada con Firebase Firestore.  

---

## 🛠️ Tecnologías utilizadas  

- **Frontend:** HTML5, CSS3, JavaScript (ES6+).  
- **Backend:** Firebase (Firestore + Authentication).  
- **Estilos:** CSS personalizado con gradientes y animaciones.  

---

## 🎯 Cómo contribuir  

¡Tu ayuda es bienvenida! Puedes contribuir de varias formas:  

### 1. Reportar errores o sugerir mejoras  
- Abre un **Issue** describiendo el problema o la sugerencia.  
- Incluye capturas de pantalla si es posible.  

### 2. Añadir nuevas herramientas  
1. Haz un **Fork** del repositorio.  
2. Agrega la nueva herramienta siguiendo este formato:  

```javascript
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
