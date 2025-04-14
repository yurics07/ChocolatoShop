// Variáveis globais
let currentProduct = null;
let cart = JSON.parse(localStorage.getItem('cartItems')) || []; // Mantido 'cartItems'
updateCartCount(); // Chamada inicial fora do DOMContentLoaded pode ser mantida se necessário

// Funções do Modal de Quantidade
function openModal(productId, productName, productPrice, productDescription, productImage) {
    // Preencher os detalhes do modal
    document.getElementById('modal-product-name').textContent = productName;
    document.getElementById('modal-product-description').textContent = productDescription;
    document.getElementById('modal-product-price').textContent = productPrice.toFixed(2).replace('.', ',');
    document.getElementById('modal-product-image').src = productImage;

    currentProduct = {
        id: productId,
        name: productName,
        price: productPrice,
        description: productDescription,
        image: productImage,
    };

    // Exibir o modal
    const modal = document.getElementById('quantity-modal');
    if (modal) modal.style.display = 'block'; // Verifica se o modal existe antes de tentar acessá-lo
}

function closeModal() {
    const modal = document.getElementById('quantity-modal');
    if (modal) modal.style.display = 'none'; // Verifica se o modal existe
    currentProduct = null; // Reset current product when modal is closed
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.value = 1; // Reset quantity to 1
}

function incrementQuantity() {
    const input = document.getElementById('quantity');
    if (input && input.value < 10) { // Verifica se o input existe
        input.value = parseInt(input.value) + 1;
    }
}

function decrementQuantity() {
    const input = document.getElementById('quantity');
    if (input && input.value > 1) { // Verifica se o input existe
        input.value = parseInt(input.value) - 1;
    }
}

// Funções do Carrinho
function addToCart() {
    if (!currentProduct) return; // Exit if no product is selected

    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return; // Sai se o input não for encontrado

    const quantity = parseInt(quantityInput.value);

    const existingItemIndex = cart.findIndex(item => item.id === currentProduct.id);

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ ...currentProduct, quantity });
    }

    localStorage.setItem('cartItems', JSON.stringify(cart)); // Mantido 'cartItems'
    updateCartCount();
    updateCartUI();
    closeModal();
    showToast('Produto adicionado ao carrinho!');
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) { // Verifica se o elemento existe
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Função para formatar preço (Mantida a existente)
function formatPrice(price) {
    // Verifica se price é um número antes de formatar
    if (typeof price !== 'number' || isNaN(price)) {
        console.error("formatPrice recebeu um valor inválido:", price);
        return "R$ --,--"; // Retorna um valor padrão ou lança um erro
    }
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para atualizar a UI do carrinho
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    let total = 0;

    // Verifica se o container foi encontrado (essencial para a página de cadastro)
    if (!cartItemsContainer) {
        // Não é um erro se estiver na página de cadastro, apenas retorna
        // console.log("Elemento #cart-items não encontrado (esperado na página de cadastro).");
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpa o conteúdo atual do carrinho

    // Verifica se o carrinho tem itens
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>'; // Mensagem de carrinho vazio
    } else {
        cart.forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 0); // Garante que price e quantity existam
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${item.image || 'imagens/placeholder.png'}" alt="${item.name || 'Produto sem nome'}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name || 'Produto sem nome'}</h4>
                    <p>Quantidade: ${item.quantity || 0}</p>
                    <p>Preço: R$ ${itemTotal.toFixed(2).replace('.',',')}</p>
                </div>
                <button onclick="removeFromCart(${item.id})" class="cart-item-remove">Remover</button>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += itemTotal;
        });
    }

    // Atualiza o total no carrinho
    if (cartTotalElement) {
        cartTotalElement.textContent = total.toFixed(2).replace('.', ',');
    } else {
        console.error("Elemento #cart-total não encontrado!");
    }

    // Atualiza também o total no modal de pagamento (se existir)
    const paymentModalTotalSpan = document.getElementById('payment-modal-total');
    if (paymentModalTotalSpan) {
         paymentModalTotalSpan.textContent = formatPrice(total);
    }
}


function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        const item = cart[itemIndex];
        if (item.quantity > 1) {
            item.quantity -= 1;
            showToast('Quantidade diminuída no carrinho.');
        } else {
            cart.splice(itemIndex, 1);
            showToast('Produto removido do carrinho.');
        }
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartUI();
        updateCartCount();
    }
}

// Funções do Painel do Carrinho (Lateral)
function toggleCart() {
    const cartPanel = document.getElementById('shopping-cart');
    if (!cartPanel) return; // Verifica se o painel existe
    if (cartPanel.style.display === 'block') {
        cartPanel.style.display = 'none';
    } else {
        updateCartUI();
        cartPanel.style.display = 'block';
    }
}

function openCart() {
    const cartPanel = document.getElementById('shopping-cart');
    if (!cartPanel) return; // Verifica se o painel existe
    updateCartUI();
    cartPanel.style.display = 'block';
}

function closeCart() {
    const cartPanel = document.getElementById('shopping-cart');
    if (cartPanel) cartPanel.style.display = 'none'; // Verifica se o painel existe
}

// --- FUNÇÕES DO MODAL DE PAGAMENTO ---
function openPaymentModal() {
    const paymentSelectionModal = document.getElementById('payment-modal');
    const paymentModalTotalSpan = document.getElementById('payment-modal-total');
    const paymentOptionsDiv = paymentSelectionModal ? paymentSelectionModal.querySelector('.payment-options') : null;
    const paymentDetailsArea = paymentSelectionModal ? paymentSelectionModal.querySelector('#payment-details-area') : null;

    // Verifica se os elementos do modal existem
    if (!paymentSelectionModal || !paymentModalTotalSpan || !paymentOptionsDiv || !paymentDetailsArea) {
        console.error("Elementos do modal de pagamento não encontrados.");
        return;
    }

    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    paymentModalTotalSpan.textContent = formatPrice(total);

    paymentOptionsDiv.style.display = 'flex';
    paymentDetailsArea.style.display = 'none';
    paymentDetailsArea.classList.remove('payment-success');
    paymentDetailsArea.innerHTML = '';

    paymentSelectionModal.querySelectorAll('.payment-option-btn').forEach(btn => btn.classList.remove('selected'));

    paymentSelectionModal.style.display = 'block';
    closeCart();
}

function selectPaymentMethod(buttonElement) {
    const paymentModal = buttonElement.closest('.modal'); // Encontra o modal pai
    if (!paymentModal) return;

    const paymentOptionsDiv = paymentModal.querySelector('.payment-options');
    const paymentDetailsArea = paymentModal.querySelector('#payment-details-area');
    const paymentModalTotalSpan = paymentModal.querySelector('#payment-modal-total');
    const selectedMethodName = buttonElement.querySelector('span').textContent;

    if (!paymentOptionsDiv || !paymentDetailsArea || !paymentModalTotalSpan) return;

    const totalAmountText = paymentModalTotalSpan.textContent;

    paymentOptionsDiv.style.display = 'none';

    paymentDetailsArea.innerHTML = `
        <h3>Pagamento Bem-Sucedido!</h3>
        <p>Você escolheu pagar com: <strong>${selectedMethodName}</strong></p>
        <p>Valor Total: <span class="success-amount">${totalAmountText}</span></p>
        <p>Obrigado pela sua compra!</p>
    `;
    paymentDetailsArea.classList.add('payment-success');
    paymentDetailsArea.style.display = 'block';

    paymentModal.querySelectorAll('.payment-option-btn').forEach(btn => btn.classList.remove('selected'));
    buttonElement.classList.add('selected');
}

function closePaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    if (!paymentModal) return; // Verifica se o modal existe

    const paymentDetailsArea = paymentModal.querySelector('#payment-details-area');

    paymentModal.style.display = 'none';

    if (paymentDetailsArea && paymentDetailsArea.classList.contains('payment-success')) {
        cart = [];
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartCount();
        updateCartUI();
        showToast('Compra finalizada! Seu carrinho foi esvaziado.');
    }

    const paymentOptionsDiv = paymentModal.querySelector('.payment-options');
    if (paymentOptionsDiv) {
         paymentOptionsDiv.style.display = 'flex';
    }
    if (paymentDetailsArea) {
        paymentDetailsArea.style.display = 'none';
        paymentDetailsArea.classList.remove('payment-success');
        paymentDetailsArea.innerHTML = '';
    }
}
// --- FIM DAS FUNÇÕES DO MODAL DE PAGAMENTO ---


// --- FUNÇÃO DE BUSCA ---
function performSearch() {
    const searchInput = document.getElementById('search-input');
    // Verifica se está na página correta (com barra de busca e produtos)
    if (!searchInput || !document.querySelector('.products')) {
        return;
    }
    const searchTerm = searchInput.value.trim().toLowerCase();
    const productsContainer = document.querySelector('.products');
    const products = productsContainer.querySelectorAll('.product-card');
    let foundMatch = false;

    removeNoResultsMessage(productsContainer);

    if (searchTerm === "") {
        productsContainer.classList.remove('search-active');
        products.forEach(product => {
            product.style.display = 'flex';
        });
        return;
    }

    productsContainer.classList.add('search-active');

    products.forEach(product => {
        const productNameElement = product.querySelector('h3');
        const productDescriptionElement = product.querySelector('.description');
        const productName = productNameElement ? productNameElement.textContent.toLowerCase() : '';
        const productDescription = productDescriptionElement ? productDescriptionElement.textContent.toLowerCase() : '';

        if (productName.includes(searchTerm) || productDescription.includes(searchTerm)) {
            product.style.display = 'flex';
            foundMatch = true;
        } else {
            product.style.display = 'none';
        }
    });

    if (!foundMatch) {
        displayNoResultsMessage(productsContainer, searchInput.value.trim());
    }
}
// --- FIM DA FUNÇÃO DE BUSCA ---


// --- FUNÇÕES AUXILIARES PARA MENSAGEM DE "NENHUM RESULTADO" ---
function displayNoResultsMessage(container, term) {
    removeNoResultsMessage(container); // Remove mensagens anteriores
    const noResultsMessage = document.createElement('p');
    noResultsMessage.id = 'no-results-message';
    noResultsMessage.textContent = `Nenhum produto encontrado para "${term}".`;
    noResultsMessage.style.textAlign = 'center';
    noResultsMessage.style.marginTop = '2rem';
    noResultsMessage.style.color = '#666';
    noResultsMessage.style.gridColumn = '1 / -1';
    container.appendChild(noResultsMessage);
}

function removeNoResultsMessage(container) {
    const existingMessage = container.querySelector('#no-results-message');
    if (existingMessage) {
        container.removeChild(existingMessage);
    }
}
// --- FIM DAS FUNÇÕES DE BUSCA ---


// Função Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) { // Verifica se o toast existe
        toast.textContent = message;
        toast.className = 'toast show';
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    } else {
        console.warn("Elemento #toast não encontrado para exibir a mensagem:", message);
    }
}


// Fechar modais quando clicar fora deles
window.onclick = function(event) {
    const quantityModal = document.getElementById('quantity-modal');
    const paymentModal = document.getElementById('payment-modal');

    if (quantityModal && event.target == quantityModal) {
        closeModal();
    }
    if (paymentModal && event.target == paymentModal) {
        closePaymentModal();
    }
}

// Fechar o carrinho quando clicar fora dele
document.addEventListener('click', (e) => {
    const cartPanel = document.getElementById('shopping-cart');
    const cartIcon = document.querySelector('.cart-icon');

    // Verifica se os elementos existem antes de acessá-los
    if (cartPanel && cartIcon &&
        cartPanel.style.display === 'block' &&
        !cartPanel.contains(e.target) &&
        !cartIcon.contains(e.target)) {
        closeCart();
    }
});


// --- CÓDIGO EXECUTADO QUANDO O DOM ESTÁ PRONTO ---
document.addEventListener('DOMContentLoaded', () => {

    // Inicializa UI do carrinho (se aplicável na página)
    updateCartUI();
    updateCartCount(); // Garante que a contagem esteja correta ao carregar

    // --- EVENT LISTENER PARA BUSCA COM "ENTER" ---
    const searchInputForEnter = document.getElementById('search-input');
    if (searchInputForEnter) { // Verifica se o input existe na página
        searchInputForEnter.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault();
                performSearch();
            }
        });
        // Adiciona listener para o botão também (caso o onclick falhe ou seja removido)
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.addEventListener('click', performSearch);
        }
    }
    // --- FIM DO EVENT LISTENER DE BUSCA ---

    // --- LÓGICA DO FORMULÁRIO DE CADASTRO ---
    const registrationForm = document.getElementById('registration-form');
    const registrationErrorDiv = document.getElementById('registration-error');

    if (registrationForm && registrationErrorDiv) { // Verifica se o formulário e a div de erro existem
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const nameInput = document.getElementById('reg-name');
            const emailInput = document.getElementById('reg-email');
            const passwordInput = document.getElementById('reg-password');
            const locationInput = document.getElementById('reg-location');

            // Verifica se todos os inputs foram encontrados
            if (!nameInput || !emailInput || !passwordInput || !locationInput) {
                console.error("Um ou mais campos do formulário de cadastro não foram encontrados.");
                registrationErrorDiv.textContent = 'Erro interno no formulário. Tente recarregar a página.';
                registrationErrorDiv.style.display = 'block';
                return;
            }

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const location = locationInput.value.trim();

            // Limpa erros anteriores
            registrationErrorDiv.textContent = '';
            registrationErrorDiv.style.display = 'none';
            [nameInput, emailInput, passwordInput, locationInput].forEach(input => {
                if (input) input.style.borderColor = '#ccc'; // Reset border color
            });


            // Validação Simples
            let isValid = true;
            let errorMessage = '';
            let errorInput = null; // Guarda qual input deu erro

            if (!name) {
                errorMessage = 'Por favor, preencha o nome.';
                errorInput = nameInput;
                isValid = false;
            } else if (!email) {
                errorMessage = 'Por favor, preencha o email.';
                errorInput = emailInput;
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                 errorMessage = 'Por favor, insira um email válido.';
                 errorInput = emailInput;
                 isValid = false;
            } else if (!password) {
                errorMessage = 'Por favor, preencha a senha.';
                 errorInput = passwordInput;
                isValid = false;
            } else if (password.length < 6) {
                errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
                 errorInput = passwordInput;
                isValid = false;
            } else if (!location) {
                errorMessage = 'Por favor, preencha a localização.';
                 errorInput = locationInput;
                isValid = false;
            }

            if (!isValid) {
                registrationErrorDiv.textContent = errorMessage;
                registrationErrorDiv.style.display = 'block';
                if (errorInput) {
                    errorInput.style.borderColor = '#e74c3c'; // Highlight error field
                    errorInput.focus(); // Foca no campo com erro
                }
                return;
            }

            // --- Simulação de Cadastro Bem-Sucedido ---
            console.log('Dados do Cadastro (simulado):', { name, email, password: '***', location }); // Não logar senha

            showToast('Cadastro realizado com sucesso! Redirecionando...');

            // Desabilita o botão para evitar cliques múltiplos
            const registerButton = document.getElementById('register-button');
            if(registerButton) registerButton.disabled = true;


            setTimeout(() => {
                // Assumindo que cadastro.html está em uma pasta 'pages' ou similar
                // e index.html está na raiz
                window.location.href = '../index.html'; // Ajuste o caminho se necessário
            }, 2000);
        });
    }
    // --- FIM DA LÓGICA DO FORMULÁRIO DE CADASTRO ---


    // --- LÓGICA DO FORMULÁRIO DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    const loginErrorDiv = document.getElementById('login-error');

    if (loginForm && loginErrorDiv) { // Verifica se está na página de login
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede envio padrão

            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');

            // Verifica se inputs existem
            if (!emailInput || !passwordInput) {
                console.error("Campos de email ou senha não encontrados no formulário de login.");
                loginErrorDiv.textContent = 'Erro interno no formulário.';
                loginErrorDiv.style.display = 'block';
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Limpa erros anteriores
            loginErrorDiv.textContent = '';
            loginErrorDiv.style.display = 'none';
            emailInput.style.borderColor = '#ccc';
            passwordInput.style.borderColor = '#ccc';

            // Validação Simples
            let isValid = true;
            let errorMessage = '';
            let errorInput = null;

            if (!email) {
                errorMessage = 'Por favor, preencha o email.';
                errorInput = emailInput;
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) { // Validação básica de formato
                 errorMessage = 'Por favor, insira um email válido.';
                 errorInput = emailInput;
                 isValid = false;
            } else if (!password) {
                errorMessage = 'Por favor, preencha a senha.';
                 errorInput = passwordInput;
                isValid = false;
            }
            // Adicione aqui validações mais complexas se necessário (ex: chamar API)

            if (!isValid) {
                loginErrorDiv.textContent = errorMessage;
                loginErrorDiv.style.display = 'block';
                if (errorInput) {
                    errorInput.style.borderColor = '#e74c3c';
                    errorInput.focus();
                }
                return;
            }

            // --- Simulação de Login Bem-Sucedido ---
            // Nesta versão, qualquer email/senha válidos (não vazios) funcionam
            console.log('Tentativa de Login (simulado):', { email, password: '***' });

            showToast('Login bem-sucedido! Redirecionando...');

            // Desabilita o botão para evitar cliques múltiplos
            const loginButton = document.getElementById('login-button');
            if(loginButton) loginButton.disabled = true;

            // Redireciona para a página principal após um atraso
            setTimeout(() => {
                // Como login.html está na raiz, o link é direto para index.html
                // Se login.html estivesse em /pages/, seria '../index.html'
                window.location.href = 'index.html';
            }, 2000); // Atraso de 2 segundos
        });
    }
    // --- FIM DA LÓGICA DO FORMULÁRIO DE LOGIN ---


    // ========== INICIALIZAÇÃO DO SWIPER CAROUSEL ==========
    const swiperContainer = document.querySelector(".mySwiper");
    if (swiperContainer) { // Só inicializa se estiver na página correta (index.html)
        try { // Adiciona try-catch para o caso da biblioteca Swiper não carregar
            const swiper = new Swiper(".mySwiper", {
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
            });
        } catch (error) {
            console.error("Erro ao inicializar o Swiper:", error);
            // Opcional: Mostrar uma mensagem para o usuário ou usar um layout alternativo
        }
    }
    // ========== FIM DA INICIALIZAÇÃO DO SWIPER ==========

}); // Fim do DOMContentLoaded
