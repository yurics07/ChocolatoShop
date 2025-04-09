// Variáveis globais
let currentProduct = null;
let cart = JSON.parse(localStorage.getItem('cartItems')) || []; // Mantido 'cartItems'
updateCartCount();

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
    document.getElementById('quantity-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('quantity-modal').style.display = 'none';
    currentProduct = null; // Reset current product when modal is closed
    document.getElementById('quantity').value = 1; // Reset quantity to 1
}

function incrementQuantity() {
    const input = document.getElementById('quantity');
    if (input.value < 10) {
        input.value = parseInt(input.value) + 1;
    }
}

function decrementQuantity() {
    const input = document.getElementById('quantity');
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Funções do Carrinho
function addToCart() {
    if (!currentProduct) return; // Exit if no product is selected

    const quantity = parseInt(document.getElementById('quantity').value);

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
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

// Função para formatar preço (Mantida a existente)
function formatPrice(price) {
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para atualizar a UI do carrinho (CORRIGIDA)
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    let total = 0;

    // Verifica se o container foi encontrado
    if (!cartItemsContainer) {
        console.error("Elemento #cart-items não encontrado!");
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpa o conteúdo atual do carrinho

    // Verifica se o carrinho tem itens
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>'; // Mensagem de carrinho vazio
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            // CORREÇÃO: Usar a classe "cart-item-remove" no botão (conforme CSS)
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Quantidade: ${item.quantity}</p>
                    <p>Preço: R$ ${(item.price * item.quantity).toFixed(2).replace('.',',')}</p>
                </div>
                <button onclick="removeFromCart(${item.id})" class="cart-item-remove">Remover</button>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += item.price * item.quantity;
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

    // Atualiza o total no modal de pagamento antigo (se existir) - Pode ser removido se não usar mais
    const paymentTotalSpan = document.getElementById('payment-total');
    if (paymentTotalSpan) {
        paymentTotalSpan.textContent = total.toFixed(2).replace('.', ',');
    }
}


function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        // Pega o item encontrado no carrinho
        const item = cart[itemIndex];

        // Verifica a quantidade do item
        if (item.quantity > 1) {
            // Se a quantidade for maior que 1, apenas diminui
            item.quantity -= 1;
            showToast('Quantidade diminuída no carrinho.'); // Mensagem específica
        } else {
            // Se a quantidade for 1, remove o item do array
            cart.splice(itemIndex, 1);
            showToast('Produto removido do carrinho.'); // Mensagem específica
        }

        // Atualiza o localStorage e a interface do usuário (UI) em ambos os casos
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartUI();
        updateCartCount();
    }
}



// Funções do Painel do Carrinho (Lateral)
function toggleCart() {
    const cartPanel = document.getElementById('shopping-cart');
    // Alternar a visibilidade do carrinho
    if (cartPanel.style.display === 'block') {
        cartPanel.style.display = 'none';
    } else {
        updateCartUI(); // Garante que o carrinho está atualizado ao abrir
        cartPanel.style.display = 'block';
    }
}

function openCart() {
    const cartPanel = document.getElementById('shopping-cart');
    updateCartUI(); // Garante que o carrinho está atualizado ao abrir
    cartPanel.style.display = 'block';
}

function closeCart() {
    const cartPanel = document.getElementById('shopping-cart');
    cartPanel.style.display = 'none';
}

// --- FUNÇÕES DO MODAL DE PAGAMENTO ---

// Função para abrir o modal de seleção de pagamento
function openPaymentModal() {
    const paymentSelectionModal = document.getElementById('payment-modal');
    const paymentModalTotalSpan = document.getElementById('payment-modal-total');
    const paymentOptionsDiv = paymentSelectionModal.querySelector('.payment-options');
    const paymentDetailsArea = paymentSelectionModal.querySelector('#payment-details-area');

    // Verifica se o carrinho está vazio
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!');
        return; // Não abre o modal se o carrinho estiver vazio
    }

    // Calcula e formata o total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    paymentModalTotalSpan.textContent = formatPrice(total); // Usa a função formatPrice

    // --- Resetar a visualização do modal ---
    paymentOptionsDiv.style.display = 'flex'; // Garante que as opções estejam visíveis
    paymentDetailsArea.style.display = 'none'; // Esconde a área de detalhes/sucesso
    paymentDetailsArea.classList.remove('payment-success'); // Remove a classe de sucesso
    paymentDetailsArea.innerHTML = ''; // Limpa conteúdo anterior da área de detalhes

    // Garante que botões de opção não estejam selecionados (caso tenha ficado de antes)
    paymentSelectionModal.querySelectorAll('.payment-option-btn').forEach(btn => btn.classList.remove('selected'));

    // Exibe o modal de seleção
    paymentSelectionModal.style.display = 'block';

    // Fecha o painel do carrinho se estiver aberto
    closeCart();
}

// Função chamada ao clicar em um botão de método de pagamento
function selectPaymentMethod(buttonElement) {
    const paymentOptionsDiv = document.querySelector('.payment-options');
    const paymentDetailsArea = document.getElementById('payment-details-area');
    const paymentModalTotalSpan = document.getElementById('payment-modal-total');
    const selectedMethodName = buttonElement.querySelector('span').textContent; // Pega o nome do método

    // 1. Pega o valor total já formatado
    const totalAmountText = paymentModalTotalSpan.textContent;

    // 2. Esconde as opções de pagamento
    paymentOptionsDiv.style.display = 'none';

    // 3. Mostra a mensagem de sucesso na área de detalhes
    paymentDetailsArea.innerHTML = `
        <h3>Pagamento Bem-Sucedido!</h3>
        <p>Você escolheu pagar com: <strong>${selectedMethodName}</strong></p>
        <p>Valor Total: <span class="success-amount">${totalAmountText}</span></p>
        <p>Obrigado pela sua compra!</p>
    `;
    paymentDetailsArea.classList.add('payment-success'); // Adiciona classe para estilização
    paymentDetailsArea.style.display = 'block'; // Garante que a área está visível

    // Opcional: Adiciona destaque visual breve ao botão clicado
    document.querySelectorAll('.payment-option-btn').forEach(btn => btn.classList.remove('selected'));
    buttonElement.classList.add('selected');

    // IMPORTANTE: A limpeza do carrinho agora acontece ao fechar o modal (em closePaymentModal)
}

// Função para fechar o modal de pagamento
function closePaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    const paymentDetailsArea = document.getElementById('payment-details-area');

    // Esconde o modal
    paymentModal.style.display = 'none';

    // Verifica se a classe 'payment-success' está presente na área de detalhes
    // Isso indica que um método de pagamento foi selecionado e a mensagem de sucesso foi exibida
    if (paymentDetailsArea.classList.contains('payment-success')) {
        // Limpa o carrinho APÓS fechar o modal de sucesso
        cart = [];
        localStorage.setItem('cartItems', JSON.stringify(cart)); // Atualiza o localStorage
        updateCartCount(); // Atualiza o contador na interface
        updateCartUI(); // Atualiza a exibição do carrinho
        showToast('Compra finalizada! Seu carrinho foi esvaziado.');
    }

    // Resetar a visualização interna do modal para a próxima vez que for aberto
    // (Importante para caso o usuário feche antes de selecionar um método)
    const paymentOptionsDiv = paymentModal.querySelector('.payment-options');
    if (paymentOptionsDiv) { // Verifica se o elemento existe
         paymentOptionsDiv.style.display = 'flex'; // Mostra opções novamente
    }
    if (paymentDetailsArea) { // Verifica se o elemento existe
        paymentDetailsArea.style.display = 'none'; // Esconde área de detalhes/sucesso
        paymentDetailsArea.classList.remove('payment-success'); // Remove classe de sucesso
        paymentDetailsArea.innerHTML = ''; // Limpa conteúdo
    }
}

// --- FIM DAS FUNÇÕES DO MODAL DE PAGAMENTO ---


// --- FUNÇÃO DE BUSCA (IMPLEMENTADA COM REDUÇÃO DE IMAGEM) ---
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    const productsContainer = document.querySelector('.products');
    const products = productsContainer.querySelectorAll('.product-card');
    const productImages = productsContainer.querySelectorAll('.product-card img'); // Seleciona todas as imagens dos produtos
    let foundMatch = false;

    removeNoResultsMessage(productsContainer);

    // Se o termo de busca estiver vazio, mostra todos os produtos e restaura tamanho da imagem
    if (searchTerm === "") {
        products.forEach(product => {
            product.style.display = 'flex';
        });
        // Remove a classe que diminui as imagens
        productImages.forEach(img => img.classList.remove('product-image-shrunk'));
        return; // Termina a função aqui
    }

    // --- Busca ativa ---
    // Primeiro, adiciona a classe para diminuir todas as imagens
    productImages.forEach(img => img.classList.add('product-image-shrunk'));

    // Depois, itera para mostrar/esconder os cards
    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        const productDescription = product.querySelector('.description').textContent.toLowerCase();

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

// --- FUNÇÕES AUXILIARES PARA MENSAGEM DE "NENHUM RESULTADO" ---
function displayNoResultsMessage(container, term) {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.id = 'no-results-message'; // ID para fácil remoção posterior
    noResultsMessage.textContent = `Nenhum produto encontrado para "${term}".`;
    noResultsMessage.style.textAlign = 'center';
    noResultsMessage.style.marginTop = '2rem';
    noResultsMessage.style.color = '#666';
    noResultsMessage.style.gridColumn = '1 / -1'; // Faz a mensagem ocupar toda a largura do grid
    container.appendChild(noResultsMessage);
}

function removeNoResultsMessage(container) {
    const existingMessage = container.querySelector('#no-results-message');
    if (existingMessage) {
        container.removeChild(existingMessage);
    }
}
// --- FIM DAS FUNÇÕES DE BUSCA ---


// Função Toast (Mantida)
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';

    // Remover o toast após 3 segundos
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}


// Fechar modais quando clicar fora deles
window.onclick = function(event) {
    const quantityModal = document.getElementById('quantity-modal');
    const paymentModal = document.getElementById('payment-modal');
    if (event.target == quantityModal) {
        closeModal();
    }
    // Fecha o modal de pagamento se clicar fora
    if (event.target == paymentModal) {
        closePaymentModal();
    }
}

// Fechar o carrinho quando clicar fora dele (Mantido)
document.addEventListener('click', (e) => {
    const cartPanel = document.getElementById('shopping-cart');
    const cartIcon = document.querySelector('.cart-icon');

    // Verifica se o painel está visível e se o clique foi fora dele e fora do ícone
    if (cartPanel.style.display === 'block' &&
        !cartPanel.contains(e.target) &&
        !cartIcon.contains(e.target)) {
        closeCart();
    }
});


// Inicializar o carrinho e o Swiper ao carregar a página (SUBSTITUÍDO PELO BLOCO FORNECIDO)
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    updateCartCount(); // Garante que a contagem esteja correta ao carregar

    // --- ADICIONA EVENT LISTENER PARA BUSCA COM "ENTER" ---
    const searchInputForEnter = document.getElementById('search-input');
    if (searchInputForEnter) { // Verifica se o input existe na página
        searchInputForEnter.addEventListener('keypress', function(event) {
            // Verifica se a tecla pressionada foi 'Enter' (código 13 ou chave 'Enter')
            if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault(); // Impede o comportamento padrão (ex: submeter formulário)
                performSearch(); // Chama a função de busca
            }
        });
    }
    // --- FIM DO EVENT LISTENER ---

    // ========== INICIALIZAÇÃO DO SWIPER CAROUSEL ==========
    const swiper = new Swiper(".mySwiper", { // Usa a classe definida no HTML
        loop: true, // Permite que o carrossel volte ao início
        autoplay: {
            delay: 4000, // Tempo em milissegundos entre slides
            disableOnInteraction: false, // Continua o autoplay mesmo após interação do usuário
        },
        pagination: {
            el: ".swiper-pagination", // Elemento da paginação (bolinhas)
            clickable: true, // Permite clicar nas bolinhas para navegar
        },
        navigation: {
            nextEl: ".swiper-button-next", // Elemento do botão "próximo"
            prevEl: ".swiper-button-prev", // Elemento do botão "anterior"
        },
    });
    // ========== FIM DA INICIALIZAÇÃO DO SWIPER ==========

}); // Fim do DOMContentLoaded
