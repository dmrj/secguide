const firebaseConfig = {
  apiKey: "AIzaSyDYnkB7glh2xov8IkjELUWiBqXgFQ7oWew",
  authDomain: "secguide-10.firebaseapp.com",
  projectId: "secguide-10",
  storageBucket: "secguide-10.firebasestorage.app",
  messagingSenderId: "967304372442",
  appId: "1:967304372442:web:fab0d2a808d31be52ac5e3",
  measurementId: "G-F14GC9TF82"
};
// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
let currentUser = null;
let currentCategory = null;
let categories = [];
let tools = [];

// Inicializar la aplicación
function initApp() {
  // Cargar datos públicos incluso si no hay usuario autenticado
  loadPublicData();

  // Escuchar cambios de autenticación
  auth.onAuthStateChanged(user => {
    currentUser = user;
    updateUI();

    if (user) {
      // Recargar datos para usuarios autenticados
      loadPublicData();
    }
  });
}



// Cargar datos públicos (categorías y herramientas aprobadas)
function loadPublicData() {
  // Cargar categorías aprobadas
  db.collection("categories").where("approved", "==", true)
    .get()
    .then(querySnapshot => {
      categories = [];
      querySnapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });

      // Cargar herramientas aprobadas
      return db.collection("tools").where("approved", "==", true).get();
    })
    .then(querySnapshot => {
      tools = [];
      querySnapshot.forEach(doc => {
        tools.push({ id: doc.id, ...doc.data() });
      });

      // Renderizar categorías con el conteo correcto
      renderCategories();
    })
    .catch(error => {
      console.error("Error cargando datos:", error);
      // No mostrar error de permisos al usuario general
      if (!error.message.includes("permissions")) {
        showError("Error cargando datos: " + error.message);
      }
    });
}

// Actualizar la interfaz según el estado de autenticación
function updateUI() {
  const loginBtn = document.getElementById('loginButton');
  const registerBtn = document.getElementById('registerButton');
  const logoutBtn = document.getElementById('logoutButton');
  const adminBtn = document.getElementById('adminButton');
  const userPanelBtn = document.getElementById('userPanelButton');

  if (currentUser) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userPanelBtn.style.display = 'block';

    // Verificar si es administrador
    checkAdminStatus().then(isAdmin => {
      adminBtn.style.display = isAdmin ? 'block' : 'none';
    });
  } else {
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    adminBtn.style.display = 'none';
    userPanelBtn.style.display = 'none';

    // Ocultar paneles de admin/usuario si están visibles
    document.getElementById('adminPanelView').style.display = 'none';
    document.getElementById('userPanelView').style.display = 'none';
  }
}

// Función para verificar si el usuario es administrador
async function checkAdminStatus() {
  if (!currentUser) return false;

  try {
    const userDoc = await db.collection("users").doc(currentUser.uid).get();
    return userDoc.exists && userDoc.data().isAdmin === true;
  } catch (error) {
    console.error("Error verificando admin:", error);
    return false;
  }
}

// Mostrar mensajes de estado
function showMessage(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = 'status-message ' + type;
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = '';
  }, 5000);
}

function showError(message) {
  showMessage(message, 'error');
}

function showSuccess(message) {
  showMessage(message, 'success');
}

// Funciones de autenticación
function showLogin() {
  hideAllViews();
  document.getElementById('loginView').style.display = 'block';
  document.getElementById('backButton').style.display = 'none';
}

function showRegister() {
  hideAllViews();
  document.getElementById('registerView').style.display = 'block';
  document.getElementById('backButton').style.display = 'none';
}

function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showError('Por favor, completa todos los campos');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showSuccess('Sesión iniciada correctamente');
      hideAllViews();
      showHome();
    })
    .catch(error => {
      showError('Error al iniciar sesión: ' + error.message);
    });
}

function register() {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const name = document.getElementById('registerName').value;

  if (!email || !password || !name) {
    showError('Por favor, completa todos los campos');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      // Guardar información adicional del usuario
      return db.collection("users").doc(userCredential.user.uid).set({
        name: name,
        email: email,
        isAdmin: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      showSuccess('Cuenta creada correctamente');
      hideAllViews();
      showHome();
    })
    .catch(error => {
      showError('Error al crear la cuenta: ' + error.message);
    });
}

function logout() {
  auth.signOut()
    .then(() => {
      showSuccess('Sesión cerrada correctamente');
      hideAllViews();
      showHome();
    })
    .catch(error => {
      showError('Error al cerrar sesión: ' + error.message);
    });
}

// Funciones de navegación
function hideAllViews() {
  const views = [
    'categoriesView', 'toolsView', 'toolDetailView',
    'loginView', 'registerView', 'adminPanelView', 'userPanelView'
  ];

  views.forEach(view => {
    eliminarHtml(view);
  });
}

function showHome() {
  hideAllViews();
  document.getElementById('categoriesView').style.display = 'grid';
  document.getElementById('backButton').style.display = 'none';
}

function goBack() {
  if (document.getElementById('toolDetailView').style.display === 'block') {
    showTools(currentCategory);
  } else if (document.getElementById('toolsView').style.display === 'grid') {
    showHome();
  } else if (document.getElementById('adminPanelView').style.display === 'block' ||
    document.getElementById('userPanelView').style.display === 'block') {
    showHome();
  }
}

// Renderizar categorías
function renderCategories() {
  const categoriesView = document.getElementById('categoriesView');

  if (categories.length === 0) {
    categoriesView.innerHTML = '<p style="color:white; text-align:center; grid-column:1/-1;">No hay categorías disponibles</p>';
    return;
  }

  categoriesView.innerHTML = categories.map(cat => {
    // Contar herramientas en esta categoría
    const count = tools.filter(t => t.cats && t.cats.includes(cat.id)).length;
    return `
          <div class='category-card' onclick='showTools("${cat.id}")'>
            <h3>${cat.name}</h3>
            <p>${cat.desc}</p>
            <p class='count'>${count} herramienta${count !== 1 ? 's' : ''}</p>
          </div>`;
  }).join('');
}

// Mostrar herramientas de una categoría
function showTools(catId) {
  currentCategory = catId;
  const category = categories.find(c => c.id === catId);

  hideAllViews();
  document.getElementById('toolsView').style.display = 'grid';
  document.getElementById('backButton').style.display = 'block';

  const categoryTools = tools.filter(t => t.cats && t.cats.includes(catId));

  if (categoryTools.length === 0) {
    document.getElementById('toolsView').innerHTML = `
          <div style="grid-column:1/-1; text-align:center; color:white;">
            <p>No hay herramientas en la categoría "${category.name}"</p>
          </div>`;
    return;
  }

  document.getElementById('toolsView').innerHTML = categoryTools.map(tool => `
        <div class='tool-card' onclick='showTool("${tool.id}")'>
          <h4>${tool.name} ${!tool.approved ? '<span class="pending-badge">Pendiente</span>' : ''}</h4>
          <p class='brief-desc'>${tool.brief}</p>
          <span class='platform'>${tool.platform}</span>
        </div>`).join('');
}

// Mostrar detalles de una herramienta
function showTool(toolId) {
  const tool = tools.find(t => t.id === toolId);

  if (!tool) return;

  hideAllViews();
  document.getElementById('toolDetailView').style.display = 'block';
  document.getElementById('backButton').style.display = 'block';

  // Obtener rating promedio
  let averageRating = 0;
  if (tool.ratings && Object.keys(tool.ratings).length > 0) {
    const ratings = Object.values(tool.ratings);
    averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  document.getElementById('toolDetailView').innerHTML = `
        <div class='tool-detail'>
          <h2>${tool.name}</h2>
          <div class='detail-section'><h3>📋 Descripción</h3><p>${tool.brief}</p></div>
          <div class='detail-section'><h3>⚙️ Funcionalidades</h3><p>${tool.func}</p></div>
          <div class='detail-section'><h3>💻 Plataformas</h3><p>${tool.platform}</p></div>
          <div class='detail-section'><h3>📄 Licencia</h3><span class='license-badge'>${tool.license}</span></div>
          <div class='detail-section'><a href='${tool.link}' target='_blank' class='visit-link'>🌐 Visitar sitio oficial</a></div>
          <div class='detail-section'><h3>📖 Artículo</h3><p>${tool.article}</p></div>
          <div class='detail-section'>
            <h3>⭐ Puntuación</h3>
            <div class='rating-info'>
              <div class='stars'>
                <span onclick='rateTool("${tool.id}",1)' id='s${tool.id}1'>★</span>
                <span onclick='rateTool("${tool.id}",2)' id='s${tool.id}2'>★</span>
                <span onclick='rateTool("${tool.id}",3)' id='s${tool.id}3'>★</span>
                <span onclick='rateTool("${tool.id}",4)' id='s${tool.id}4'>★</span>
                <span onclick='rateTool("${tool.id}",5)' id='s${tool.id}5'>★</span>
              </div>
              <span class='avg-rating'>${averageRating.toFixed(1)}/5 (${tool.ratings ? Object.keys(tool.ratings).length : 0} votos)</span>
            </div>
          </div>
        </div>`;

  // Cargar rating del usuario actual si está autenticado
  if (currentUser && tool.ratings && tool.ratings[currentUser.uid]) {
    highlightStars(tool.id, tool.ratings[currentUser.uid]);
  }
}

// Calificar una herramienta
function rateTool(toolId, stars) {
  if (!currentUser) {
    showError('Debes iniciar sesión para calificar herramientas');
    return;
  }

  // Actualizar en Firestore
  const updateData = {};
  updateData[`ratings.${currentUser.uid}`] = stars;

  db.collection("tools").doc(toolId).update(updateData)
    .then(() => {
      // Actualizar localmente
      const toolIndex = tools.findIndex(t => t.id === toolId);
      if (toolIndex !== -1) {
        if (!tools[toolIndex].ratings) {
          tools[toolIndex].ratings = {};
        }
        tools[toolIndex].ratings[currentUser.uid] = stars;
      }

      highlightStars(toolId, stars);
      showSuccess('¡Gracias por tu calificación!');

      // Recargar la vista para actualizar el promedio
      showTool(toolId);
    })
    .catch(error => {
      showError('Error al calificar: ' + error.message);
    });
}

// Resaltar estrellas según la calificación
function highlightStars(toolId, rating) {
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`s${toolId}${i}`);
    if (star) {
      if (i <= rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    }
  }
}
// Panel de administración
async function showAdminPanel() {
  const isAdmin = await checkAdminStatus();
  if (!isAdmin) {
    showError('No tienes permisos de administrador');
    return;
  }

  hideAllViews();
  function adminPanelHtml() {
    const html = `<div id="adminContainer" class="admin-panel">
      <h2>Panel de Administración</h2>

        <div class="admin-actions">
          <button class="admin-action-btn" onclick="showAddCategoryForm()">➕ Añadir Categoría</button>
          <button class="admin-action-btn" onclick="showAddToolForm()">🛠️ Añadir Herramienta</button>
          <button class="admin-action-btn" onclick="loadPendingTools()">⏳ Herramientas Pendientes</button>
        </div>

        <div id="addCategoryForm" class="admin-form" style="display:none;">
          <h3>Añadir Nueva Categoría</h3>
          <div class="form-row">
            <input type="text" id="categoryName" placeholder="Nombre de la categoría">
          </div>
          <div class="form-row">
            <input type="text" id="categoryDesc" placeholder="Descripción de la categoría">
          </div>
          <button class="form-submit" onclick="addCategory()">Guardar Categoría</button>
        </div>

        <div id="addToolForm" class="admin-form" style="display:none;">
          <h3>Añadir Nueva Herramienta</h3>
          <div class="form-row">
            <input type="text" id="toolName" placeholder="Nombre de la herramienta">
          </div>
          <div class="form-row">
            <input type="text" id="toolBrief" placeholder="Descripción breve">
          </div>
          <div class="form-row">
            <select id="toolCategory">
              <option value="">Selecciona una categoría</option>
            </select>
          </div>
          <div class="form-row">
            <input type="text" id="toolFunc" placeholder="Funcionalidades">
          </div>
          <div class="form-row">
            <input type="text" id="toolPlatform" placeholder="Plataformas (Win/Linux/macOS)">
          </div>
          <div class="form-row">
            <input type="text" id="toolLicense" placeholder="Licencia">
          </div>
          <div class="form-row">
            <input type="text" id="toolLink" placeholder="Enlace oficial">
          </div>
          <div class=" form-row">
            <textarea id="toolArticle" placeholder="Artículo descriptivo"></textarea>
          </div>
          <button class="form-submit" onclick="addTool()">Guardar Herramienta</button>
        </div>
        <div id="adminCategoriesList" class="admin-list"></div>
        <div id="adminToolsList" class="admin-list"></div>
        <div id="pendingToolsList" class="admin-list"></div>
        </div>
`;

    const adminContainer = document.getElementById("adminContainer");
    adminContainer.insertAdjacentHTML("beforeend", `
  ${html}
  `)
  }
  adminPanelHtml();
  document.getElementById('adminPanelView').style.display = 'block';
  document.getElementById('backButton').style.display = 'block';
  loadAdminCategories();
  loadAdminTools();
}

function showAddCategoryForm() {
  document.getElementById('addCategoryForm').style.display = 'block';
  document.getElementById('addToolForm').style.display = 'none';
}

function showAddToolForm() {
  document.getElementById('addToolForm').style.display = 'block';
  document.getElementById('addCategoryForm').style.display = 'none';

  // Cargar categorías en el selector
  const categorySelect = document.getElementById('toolCategory');
  categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>' +
    categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

function addCategory() {
  const name = document.getElementById('categoryName').value;
  const desc = document.getElementById('categoryDesc').value;

  if (!name || !desc) {
    showError('Por favor, completa todos los campos');
    return;
  }

  db.collection("categories").add({
    name: name,
    desc: desc,
    approved: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
    .then(() => {
      showSuccess('Categoría añadida correctamente');
      document.getElementById('categoryName').value = '';
      document.getElementById('categoryDesc').value = '';
      loadAdminCategories();
      loadPublicData(); // Recargar datos públicos
    })
    .catch(error => {
      showError('Error al añadir categoría: ' + error.message);
    });
}

function addTool() {
  const name = document.getElementById('toolName').value;
  const brief = document.getElementById('toolBrief').value;
  const category = document.getElementById('toolCategory').value;
  const func = document.getElementById('toolFunc').value;
  const platform = document.getElementById('toolPlatform').value;
  const license = document.getElementById('toolLicense').value;
  const link = document.getElementById('toolLink').value;
  const article = document.getElementById('toolArticle').value;

  if (!name || !brief || !category || !func || !platform || !license || !link || !article) {
    showError('Por favor, completa todos los campos');
    return;
  }

  db.collection("tools").add({
    name: name,
    brief: brief,
    cats: [category],
    func: func,
    platform: platform,
    license: license,
    link: link,
    article: article,
    approved: true,
    createdBy: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
    .then(() => {
      showSuccess('Herramienta añadida correctamente');
      // Limpiar formulario
      document.getElementById('toolName').value = '';
      document.getElementById('toolBrief').value = '';
      document.getElementById('toolCategory').value = '';
      document.getElementById('toolFunc').value = '';
      document.getElementById('toolPlatform').value = '';
      document.getElementById('toolLicense').value = '';
      document.getElementById('toolLink').value = '';
      document.getElementById('toolArticle').value = '';

      loadAdminTools();
      loadPublicData(); // Recargar datos públicos
    })
    .catch(error => {
      showError('Error al añadir herramienta: ' + error.message);
    });
}

function loadAdminCategories() {
  db.collection("categories").orderBy("name").get()
    .then(querySnapshot => {
      const categoriesList = document.getElementById('adminCategoriesList');
      categoriesList.innerHTML = '<h3>Categorías Existentes</h3>';

      if (querySnapshot.empty) {
        categoriesList.innerHTML += '<p>No hay categorías</p>';
        return;
      }

      querySnapshot.forEach(doc => {
        const category = doc.data();
        categoriesList.innerHTML += `
              <div class="admin-item">
                <div>
                  <strong>${category.name}</strong> - ${category.desc}
                  ${!category.approved ? '<span class="pending-badge">Pendiente</span>' : ''}
                </div>
                <div class="admin-item-actions">
                  <button class="item-action-btn delete" onclick="deleteCategory('${doc.id}')">Eliminar</button>
                </div>
              </div>`;
      });
    })
    .catch(error => {
      console.error("Error cargando categorías:", error);
      if (!error.message.includes("permissions")) {
        showError('Error cargando categorías: ' + error.message);
      }
    });
}

function loadAdminTools() {
  db.collection("tools").orderBy("name").get()
    .then(querySnapshot => {
      const toolsList = document.getElementById('adminToolsList');
      toolsList.innerHTML = '<h3>Herramientas Existentes</h3>';

      if (querySnapshot.empty) {
        toolsList.innerHTML += '<p>No hay herramientas</p>';
        return;
      }

      querySnapshot.forEach(doc => {
        const tool = doc.data();
        toolsList.innerHTML += `
              <div class="admin-item">
                <div>
                  <strong>${tool.name}</strong> - ${tool.brief}
                  ${!tool.approved ? '<span class="pending-badge">Pendiente</span>' : ''}
                </div>
                <div class="admin-item-actions">
                  ${!tool.approved ?
            `<button class="item-action-btn" onclick="approveTool('${doc.id}')">Aprobar</button>` :
            ''}
                  <button class="item-action-btn delete" onclick="deleteTool('${doc.id}')">Eliminar</button>
                </div>
              </div>`;
      });
    })
    .catch(error => {
      console.error("Error cargando herramientas:", error);
      if (!error.message.includes("permissions")) {
        showError('Error cargando herramientas: ' + error.message);
      }
    });
}

function loadPendingTools() {
  db.collection("tools").where("approved", "==", false).get()
    .then(querySnapshot => {
      const pendingList = document.getElementById('pendingToolsList');
      pendingList.innerHTML = '<h3>Herramientas Pendientes de Aprobación</h3>';

      if (querySnapshot.empty) {
        pendingList.innerHTML += '<p>No hay herramientas pendientes</p>';
        return;
      }

      querySnapshot.forEach(doc => {
        const tool = doc.data();
        pendingList.innerHTML += `
              <div class="admin-item">
                <div>
                  <strong>${tool.name}</strong> - ${tool.brief}
                  <span class="pending-badge">Pendiente</span>
                </div>
                <div class="admin-item-actions">
                  <button class="item-action-btn" onclick="approveTool('${doc.id}')">Aprobar</button>
                  <button class="item-action-btn delete" onclick="deleteTool('${doc.id}')">Rechazar</button>
                </div>
              </div>`;
      });
    })
    .catch(error => {
      console.error("Error cargando herramientas pendientes:", error);
      if (!error.message.includes("permissions")) {
        showError('Error cargando herramientas pendientes: ' + error.message);
      }
    });
}

function approveTool(toolId) {
  db.collection("tools").doc(toolId).update({
    approved: true
  })
    .then(() => {
      showSuccess('Herramienta aprobada correctamente');
      loadAdminTools();
      loadPendingTools();
      loadPublicData();
    })
    .catch(error => {
      showError('Error al aprobar herramienta: ' + error.message);
    });
}

function deleteCategory(categoryId) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.')) return;

  db.collection("categories").doc(categoryId).delete()
    .then(() => {
      showSuccess('Categoría eliminada correctamente');
      loadAdminCategories();
      loadPublicData();
    })
    .catch(error => {
      showError('Error al eliminar categoría: ' + error.message);
    });
}

function deleteTool(toolId) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta herramienta? Esta acción no se puede deshacer.')) return;

  db.collection("tools").doc(toolId).delete()
    .then(() => {
      showSuccess('Herramienta eliminada correctamente');
      loadAdminTools();
      loadPendingTools();
      loadPublicData();
    })
    .catch(error => {
      showError('Error al eliminar herramienta: ' + error.message);
    });
}

// Panel de usuario
function showUserPanel() {
  hideAllViews();
  document.getElementById('userPanelView').style.display = 'block';
  document.getElementById('backButton').style.display = 'block';
  loadUserTools();
}

function showUserAddToolForm() {
  document.getElementById('userAddToolForm').style.display = 'block';

  // Cargar categorías en el selector
  const categorySelect = document.getElementById('userToolCategory');
  categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>' +
    categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

// Función auxiliar para obtener el nombre de la categoría
function getCategoryName(categoryId) {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : 'Sin categoría';
}

// Cargar herramientas del usuario (incluyendo rechazadas)
function loadUserTools() {
  if (!currentUser) {
    console.error("No hay usuario autenticado");
    return;
  }

  console.log("Cargando herramientas del usuario:", currentUser.uid);

  db.collection("tools")
    .where("createdBy", "==", currentUser.uid)
    .get()
    .then(querySnapshot => {
      const userToolsList = document.getElementById('userToolsList');
      userToolsList.innerHTML = '';

      if (querySnapshot.empty) {
        userToolsList.innerHTML = '<p>No has sugerido ninguna herramienta todavía.</p>';
        return;
      }

      querySnapshot.forEach(doc => {
        const tool = doc.data();
        console.log("Herramienta encontrada:", tool.name, "Aprobada:", tool.approved);

        let statusBadge = '';
        if (tool.approved === true) {
          statusBadge = '<span style="color:green; font-weight:bold;">✓ Aprobada</span>';
        } else if (tool.approved === false && tool.rejected) {
          statusBadge = '<span class="rejected-badge">❌ Rechazada</span>';
        } else {
          statusBadge = '<span class="pending-badge">Pendiente de aprobación</span>';
        }

        userToolsList.innerHTML += `
              <div class="admin-item">
                <div>
                  <strong>${tool.name}</strong> - ${tool.brief}
                  ${statusBadge}
                </div>
                <div>
                  <small>Categoría: ${getCategoryName(tool.cats ? tool.cats[0] : '')}</small>
                </div>
              </div>`;
      });
    })
    .catch(error => {
      console.error("Error detallado al cargar herramientas:", error);
      if (!error.message.includes("permissions")) {
        showError('Error cargando tus herramientas: ' + error.message);
      }
    });
}

// Función para sugerir herramienta
function suggestTool() {
  const name = document.getElementById('userToolName').value;
  const brief = document.getElementById('userToolBrief').value;
  const category = document.getElementById('userToolCategory').value;
  const func = document.getElementById('userToolFunc').value;
  const platform = document.getElementById('userToolPlatform').value;
  const license = document.getElementById('userToolLicense').value;
  const link = document.getElementById('userToolLink').value;
  const article = document.getElementById('userToolArticle').value;

  if (!name || !brief || !category || !func || !platform || !license || !link || !article) {
    showError('Por favor, completa todos los campos');
    return;
  }

  db.collection("tools").add({
    name: name,
    brief: brief,
    cats: [category],
    func: func,
    platform: platform,
    license: license,
    link: link,
    article: article,
    approved: false,
    rejected: false,
    createdBy: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
    .then(() => {
      showSuccess('Herramienta sugerida correctamente. Espera la aprobación del administrador.');
      // Limpiar formulario
      document.getElementById('userToolName').value = '';
      document.getElementById('userToolBrief').value = '';
      document.getElementById('userToolCategory').value = '';
      document.getElementById('userToolFunc').value = '';
      document.getElementById('userToolPlatform').value = '';
      document.getElementById('userToolLicense').value = '';
      document.getElementById('userToolLink').value = '';
      document.getElementById('userToolArticle').value = '';

      document.getElementById('userAddToolForm').style.display = 'none';
      // Recargar la lista de herramientas del usuario
      loadUserTools();
    })
    .catch(error => {
      console.error("Error completo:", error);
      showError('Error al sugerir herramienta: ' + error.message);
    });
}

// Inicializar la aplicación cuando se carga la página
window.onload = initApp;
