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
        // Removendo o item completamente
        cart.splice(itemIndex, 1);

        localStorage.setItem('cartItems', JSON.stringify(cart)); // Mantido 'cartItems'
        updateCartUI();
        updateCartCount();
        showToast('Produto removido do carrinho!');
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


// Função antiga proceedToPayment (COMENTADA - Não usada no fluxo atual)
/*
function proceedToPayment() {
    showToast('Redirecionando para a página de pagamento...');
    // Aqui você pode adicionar lógica para redirecionar para a página de pagamento real
    cart = []; // Limpar o carrinho após finalizar a compra
    localStorage.setItem('cartItems', JSON.stringify(cart)); // Alterar para "cartItems"
    updateCartCount(); // Atualizar o contador do carrinho
    updateCartUI(); // Atualizar a interface do carrinho
    closePaymentModal(); // Fecha o modal de pagamento antigo
}
*/


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


// Inicializar o carrinho ao carregar a página (Mantido)
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    updateCartCount(); // Garante que a contagem esteja correta ao carregar
});
