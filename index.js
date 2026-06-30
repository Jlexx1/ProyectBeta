/*
  Archivo: index.js
  Descripción: Lógica del lado del cliente para el sitio web ALDIA (menú móvil, simulador de dashboard, control de formulario y planes).
  Fecha de última modificación: 2026-06-27
  Autor: Antigravity
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // Menú de Navegación Móvil
    // ----------------------------------------------------
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }

    // ----------------------------------------------------
    // Simulador del Dashboard Interactivo
    // ----------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabExplanations = document.querySelectorAll('.tab-explanation');
    const dynamicDisplay = document.getElementById('dynamic-display');

    // Datos simulados para el Dashboard
    const dashboardData = {
        ventas: `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="font-family: 'Outfit'; font-size: 16px;">Ventas Recientes</h4>
                    <span class="text-success" style="font-weight: 600; font-size: 13px;">+18% vs mes anterior</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                        <div>
                            <span style="font-size: 13px; font-weight: 500; display: block;">Factura #1084 - Acma Corp</span>
                            <span style="font-size: 10px; color: var(--text-muted);">Hace 2 horas</span>
                        </div>
                        <span class="text-success" style="font-weight: 700; font-size: 14px;">$2,450.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                        <div>
                            <span style="font-size: 13px; font-weight: 500; display: block;">Factura #1083 - Globex Inc</span>
                            <span style="font-size: 10px; color: var(--text-muted);">Hace 1 día</span>
                        </div>
                        <span class="text-success" style="font-weight: 700; font-size: 14px;">$1,890.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                        <div>
                            <span style="font-size: 13px; font-weight: 500; display: block;">Factura #1082 - Initech</span>
                            <span style="font-size: 10px; color: var(--text-muted);">Hace 3 días</span>
                        </div>
                        <span class="text-warning" style="font-weight: 700; font-size: 14px; background: rgba(245,158,11,0.1); padding: 2px 6px; border-radius: 4px;">Pendiente</span>
                    </div>
                </div>
            </div>
        `,
        gastos: `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="font-family: 'Outfit'; font-size: 16px;">Egresos por Categoría</h4>
                    <span class="text-danger" style="font-weight: 600; font-size: 13px;">Presupuesto: 72% usado</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                            <span>Servicios Cloud (AWS, Google)</span>
                            <span style="font-weight: 600;">$1,200.00</span>
                        </div>
                        <div style="background: var(--border-color); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: var(--primary); width: 80%; height: 100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                            <span>Marketing & Pauta Digital</span>
                            <span style="font-weight: 600;">$850.00</span>
                        </div>
                        <div style="background: var(--border-color); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: var(--accent); width: 55%; height: 100%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                            <span>Oficinas / Coworking</span>
                            <span style="font-weight: 600;">$450.00</span>
                        </div>
                        <div style="background: var(--border-color); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: var(--warning); width: 30%; height: 100%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        impuestos: `
            <div class="animate-fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="font-family: 'Outfit'; font-size: 16px;">Borrador Fiscal (Trimestre Actual)</h4>
                    <span style="font-size: 11px; background: rgba(6,182,212,0.1); color: var(--accent); padding: 2px 8px; border-radius: 10px;">Pre-Cálculo</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; text-align: center;">
                        <span style="font-size: 10px; color: var(--text-muted); display: block;">IVA Cobrado (Débito)</span>
                        <span class="text-success" style="font-size: 16px; font-weight: 700;">$3,410.00</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; text-align: center;">
                        <span style="font-size: 10px; color: var(--text-muted); display: block;">IVA Pagado (Crédito)</span>
                        <span class="text-danger" style="font-size: 16px; font-weight: 700;">$1,890.00</span>
                    </div>
                </div>
                <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99,102,241,0.2); padding: 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 12px; font-weight: 600; display: block;">Estimación Neto a Pagar</span>
                        <span style="font-size: 10px; color: var(--text-muted);">Vence en 18 días</span>
                    </div>
                    <span style="font-size: 18px; font-weight: 800; color: var(--text-primary);">$1,520.00</span>
                </div>
            </div>
        `
    };

    // Estado de sesión del administrador
    let isLoggedAdmin = false;
    let productsList = [];

    // URL base de la API
    const API_BASE_URL = 'http://localhost:3000/api';

    // Función para cambiar de tab
    function switchTab(tabId) {
        // Actualizar botones de pestaña
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Actualizar descripciones
        tabExplanations.forEach(exp => {
            if (exp.getAttribute('id-exp') === tabId) {
                exp.classList.add('active');
            } else {
                exp.classList.remove('active');
            }
        });

        // Actualizar contenido dinámico
        if (tabId === 'inventario') {
            renderInventoryTab();
        } else if (dynamicDisplay && dashboardData[tabId]) {
            dynamicDisplay.innerHTML = dashboardData[tabId];
        }
    }

    // Renderizar la pestaña de inventario (Login o Panel)
    function renderInventoryTab() {
        if (!isLoggedAdmin) {
            dynamicDisplay.innerHTML = `
                <div class="animate-fade-in admin-login-box">
                    <h4>Iniciar Sesión Administrador</h4>
                    <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 5px;">Usa admin / admin123 para ingresar</p>
                    <input type="text" id="admin-user" placeholder="Usuario (admin)">
                    <input type="password" id="admin-pass" placeholder="Contraseña (admin123)">
                    <button class="btn btn-primary btn-mini" id="admin-login-btn">Ingresar</button>
                    <div id="login-error" style="color: var(--danger); font-size: 11px; min-height: 15px;"></div>
                </div>
            `;

            // Evento de login
            document.getElementById('admin-login-btn').addEventListener('click', handleAdminLogin);
        } else {
            renderInventoryPanel();
        }
    }

    // Gestionar login administrador
    async function handleAdminLogin() {
        const username = document.getElementById('admin-user').value;
        const password = document.getElementById('admin-pass').value;
        const errorDiv = document.getElementById('login-error');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                isLoggedAdmin = true;
                await loadProducts();
                renderInventoryPanel();
            } else {
                const data = await response.json();
                errorDiv.textContent = data.error || 'Credenciales incorrectas';
            }
        } catch (e) {
            console.warn('Backend desconectado. Usando modo de simulación local (LocalStorage)');
            // Fallback a simulación sin backend
            if (username === 'admin' && password === 'admin123') {
                isLoggedAdmin = true;
                loadProductsFromLocal();
                renderInventoryPanel();
            } else {
                errorDiv.textContent = 'Usuario o contraseña incorrectos (Simulación)';
            }
        }
    }

    // Cargar productos desde base de datos SQLite
    async function loadProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (response.ok) {
                productsList = await response.json();
            } else {
                loadProductsFromLocal();
            }
        } catch (e) {
            loadProductsFromLocal();
        }
    }

    function loadProductsFromLocal() {
        const local = localStorage.getItem('aldia_products');
        productsList = local ? JSON.parse(local) : [
            { id: 1, name: 'Suscripción Básica', sku: 'SUB-BAS-01', price: 19, stock: 150 },
            { id: 2, name: 'Servicio Auditoría', sku: 'SRV-AUD-02', price: 99, stock: 45 }
        ];
    }

    function saveProductsLocal() {
        localStorage.setItem('aldia_products', JSON.stringify(productsList));
    }

    // Renderizar panel de inventario y formulario
    function renderInventoryPanel() {
        dynamicDisplay.innerHTML = `
            <div class="animate-fade-in inventory-box">
                <div class="inventory-header-action">
                    <h4>Gestión de Inventario</h4>
                    <button class="btn-danger-mini" id="admin-logout-btn">Salir</button>
                </div>
                
                <form id="inventory-form" class="inventory-form-row">
                    <input type="text" id="prod-name" placeholder="Producto" required>
                    <input type="text" id="prod-sku" placeholder="SKU" required>
                    <input type="number" id="prod-price" placeholder="Precio" step="0.01" required>
                    <input type="number" id="prod-stock" placeholder="Stock" required>
                    <button type="submit" class="btn btn-primary btn-mini">Añadir</button>
                </form>

                <div class="inventory-table-wrapper">
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>SKU</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-tbody">
                            ${productsList.map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td>${p.sku}</td>
                                    <td>$${p.price.toFixed(2)}</td>
                                    <td>${p.stock}</td>
                                    <td>
                                        <button class="btn-danger-mini delete-prod-btn" data-id="${p.id}">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                            ${productsList.length === 0 ? '<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Sin productos en inventario</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Eventos
        document.getElementById('admin-logout-btn').addEventListener('click', () => {
            isLoggedAdmin = false;
            renderInventoryTab();
        });

        document.getElementById('inventory-form').addEventListener('submit', handleAddProduct);
        
        document.querySelectorAll('.delete-prod-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prodId = parseInt(e.target.getAttribute('data-id'));
                handleDeleteProduct(prodId);
            });
        });
    }

    // Agregar producto
    async function handleAddProduct(e) {
        e.preventDefault();
        const name = document.getElementById('prod-name').value;
        const sku = document.getElementById('prod-sku').value;
        const price = parseFloat(document.getElementById('prod-price').value);
        const stock = parseInt(document.getElementById('prod-stock').value);

        const newProd = { name, sku, price, stock };

        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProd)
            });

            if (response.ok) {
                await loadProducts();
                renderInventoryPanel();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al agregar producto');
            }
        } catch (err) {
            // Fallback local
            if (productsList.some(p => p.sku === sku)) {
                alert('El SKU ya existe (Simulación Local)');
                return;
            }
            newProd.id = Date.now();
            productsList.unshift(newProd);
            saveProductsLocal();
            renderInventoryPanel();
        }
    }

    // Eliminar producto
    async function handleDeleteProduct(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            // O si la ruta de eliminación en server es /api/products/:id:
            const deleteResponse = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });

            if (deleteResponse.ok) {
                await loadProducts();
                renderInventoryPanel();
            } else {
                // Fallback local
                deleteProductLocal(id);
            }
        } catch (e) {
            deleteProductLocal(id);
        }
    }

    function deleteProductLocal(id) {
        productsList = productsList.filter(p => p.id !== id);
        saveProductsLocal();
        renderInventoryPanel();
    }

    // Inicializar simulador
    switchTab('ventas');

    // Añadir eventos a botones de pestañas
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // ----------------------------------------------------
    // Lógica del Formulario y Selección de Planes
    // ----------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const planSelect = document.getElementById('plan-select');
    const formFeedback = document.getElementById('form-feedback');
    const planButtons = document.querySelectorAll('.plan-btn');

    // Rellenar automáticamente el formulario de contacto al elegir un plan
    planButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const planName = btn.getAttribute('data-plan');
            if (planSelect && planName) {
                planSelect.value = planName;
            }
        });
    });

    // Enviar el formulario de contacto simulado
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('form-submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            // Simular estado de carga
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando registro...';
            
            setTimeout(() => {
                const name = document.getElementById('name').value;
                const company = document.getElementById('company').value;
                
                // Mostrar éxito
                formFeedback.innerHTML = `
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); color: var(--success); padding: 12px; border-radius: 6px; margin-top: 15px;" class="animate-fade-in">
                        🎉 ¡Excelente, ${name}! Tu cuenta demo para <strong>${company}</strong> ha sido creada. Te enviamos los accesos por correo.
                    </div>
                `;
                
                // Limpiar campos
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }, 1500);
        });
    }

    // ----------------------------------------------------
    // Efecto de Navegación Activa en el Scroll
    // ----------------------------------------------------
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
});
