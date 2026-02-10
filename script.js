// script.js (Archivo principal con integración de PayPal y Procesamiento de Pago)

import { loadPage, toggleMobileMenu, closeMobileMenu } from './modules/router.js';
import { updateLoginButton, handleLogout, handleLogin } from './modules/auth.js';
import { updateCartBadge, addToCart, updateCartItemQuantity, removeFromCart, clearCart } from './modules/cart.js';
import { handleSearch } from './modules/pages/catalog.js';
import { cart, currentUser } from './modules/state.js';

// --- 1. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main');
    if (!main) {
        console.error("Error: Elemento 'main' no encontrado.");
        return;
    }

    document.body.addEventListener('click', handleBodyClick);
    document.body.addEventListener('submit', handleFormSubmit);
    document.body.addEventListener('change', handleBodyChange);

    document.getElementById('desktop-search-input')?.addEventListener('input', handleSearch);
    document.getElementById('mobile-search-input')?.addEventListener('input', handleSearch);

    updateCartBadge();
    updateLoginButton();
    loadPage('inicio');
});

// --- 2. MANEJADOR DE CAMBIOS (PayPal vs Tarjeta) ---
function handleBodyChange(event) {
    const target = event.target;
    if (target.name === 'paymentMethod') {
        const cardSection = document.getElementById('card-details-section');
        const paypalSection = document.getElementById('paypal-message-section');
        
        if (!cardSection || !paypalSection) return;

        if (target.value === 'paypal') {
            cardSection.style.display = 'none';
            paypalSection.style.display = 'block';
            toggleCardRequirements(cardSection, false);
        } else {
            cardSection.style.display = 'block';
            paypalSection.style.display = 'none';
            toggleCardRequirements(cardSection, true);
        }
    }
}

function toggleCardRequirements(container, isRequired) {
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.required = isRequired;
    });
}

// --- 3. MANEJADOR DE CLICS GLOBAL ---
function handleBodyClick(event) {
    const target = event.target;

    const menuButton = target.closest('.mobile-menu-button');
    if (menuButton) {
        event.preventDefault();
        toggleMobileMenu();
        return;
    }

    const pageLink = target.closest('[data-page]');
    if (pageLink) {
        event.preventDefault();
        loadPage(pageLink.getAttribute('data-page'));
        closeMobileMenu();
        return;
    }

    const addToCartButton = target.closest('.add-to-cart-btn');
    if (addToCartButton) {
        event.preventDefault();
        addToCart(addToCartButton.getAttribute('data-product-id'));
        return;
    }

    const cartButton = target.closest('.quantity-btn, .remove-item-btn');
    if (cartButton) {
        event.preventDefault();
        const productId = cartButton.getAttribute('data-product-id');
        const action = cartButton.getAttribute('data-action');
        const item = cart.find(i => i.id === productId);

        if (item) {
            if (action === 'increase') updateCartItemQuantity(productId, item.quantity + 1);
            if (action === 'decrease') updateCartItemQuantity(productId, item.quantity - 1);
            if (action === 'remove') removeFromCart(productId);
        }
        return;
    }
    
    const logoutButton = target.closest('.logout-button');
    if (logoutButton) {
        event.preventDefault();
        handleLogout();
        return;
    }
}

// --- 4. MANEJADOR DE SUBMITS GLOBAL ---
function handleFormSubmit(event) {
    const form = event.target; 

    if (form.id === 'login-form') {
        event.preventDefault();
        handleLogin(event);
        return;
    }

    if (form.id === 'contact-form') {
        event.preventDefault();
        alert('Mensaje enviado con éxito. (Simulación)');
        form.reset();
        return;
    }

    if (form.id === 'personal-info-form') {
        event.preventDefault();
        const newNameInput = form.querySelector('#acc-name');
        if (newNameInput && currentUser) {
            currentUser.name = newNameInput.value;
            alert('Información actualizada con éxito.');
            updateLoginButton();
            loadPage('cuenta');
        }
        return;
    }

    // --- CAMBIOS EN MANEJADOR DE PAGO ---
    if (form.id === 'payment-form') {
        event.preventDefault();
        
        const selectedMethod = form.querySelector('input[name="paymentMethod"]:checked').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        // Desactivar botón para evitar múltiples clics
        submitBtn.disabled = true;

        if (selectedMethod === 'paypal') {
            submitBtn.innerText = "Conectando con PayPal...";
            
            // Simulación de latencia de red de pasarela externa
            setTimeout(() => {
                finalizarCompra();
            }, 2500);
        } else {
            submitBtn.innerText = "Procesando pago seguro...";
            
            // Simulación de validación bancaria local
            setTimeout(() => {
                finalizarCompra();
            }, 1500);
        }
        return;
    }
}

// --- 5. LÓGICA DE FINALIZACIÓN DE PROCESO ---
function finalizarCompra() {
    // 1. Generar número de pedido aleatorio para la vista de éxito
    const orderNumber = "FP-" + Math.floor(Math.random() * 90000 + 10000);
    
    // 2. Limpiar el estado del carrito en la memoria y UI
    clearCart();
    updateCartBadge();
    
    // 3. Cargar la página de éxito
    loadPage('orden-completa');

    // 4. Inyectar el número de pedido en la nueva vista (esperamos un pequeño delay para que el DOM cargue)
    setTimeout(() => {
        const orderDisplay = document.getElementById('order-number');
        if (orderDisplay) orderDisplay.innerText = `#${orderNumber}`;
    }, 100);
}