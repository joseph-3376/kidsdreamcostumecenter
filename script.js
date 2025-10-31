// Main Application Logic

// Image gallery for modal
let currentGalleryIndex = 0;
let currentGalleryImages = [];

// Page Loader
window.addEventListener('load', function() {
    const loader = document.querySelector('.page-loader');
    setTimeout(() => {
        loader.classList.add('fade-out');
        // Initialize accent animations after page loads
        initAccentAnimations();
        // Initialize scroll animations
        initScrollAnimations();
        // Populate featured products
        populateFeaturedProducts();
        // Check if user is logged in
        checkLoginStatus();
        // Initialize lazy loading
        setupLazyLoading();
        // Initialize image error handling
        setupImageErrorHandling();
        // Initialize inventory system
        initializeInventorySystem();
        // Initialize featured product inventory
        initializeFeaturedProductInventory();
        
        // Update performance data
        performanceData.pageLoadEnd = performance.now();
        updatePerformanceIndicator('Page loaded in ' + Math.round(performanceData.pageLoadEnd - performanceData.pageLoadStart) + 'ms');
    }, 2000);
});

// Slider functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const slider = document.querySelector('.hero-slider');

function showSlide(n) {
    currentSlide = (n + slides.length) % slides.length;
    slider.style.transform = `translateX(-${currentSlide * 25}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

// Auto slide every 3 seconds
setInterval(nextSlide, 3000);

// Dot click events
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// Enhanced Image Modal functionality with Gallery
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.querySelector('.close-modal');
const modalPrev = document.querySelector('.modal-prev');
const modalNext = document.querySelector('.modal-next');
const currentImageCounter = document.getElementById('current-image');
const totalImagesCounter = document.getElementById('total-images');

// Function to open image modal with gallery
function openImageModal(images, startIndex = 0) {
    currentGalleryImages = images;
    currentGalleryIndex = startIndex;
    updateModalImage();
    imageModal.style.display = 'flex';
    totalImagesCounter.textContent = images.length;
}

function updateModalImage() {
    modalImage.src = currentGalleryImages[currentGalleryIndex];
    currentImageCounter.textContent = currentGalleryIndex + 1;
    
    // Reset zoom state
    modalImage.classList.remove('zoomed');
}

// Close modal when clicking X
closeModal.addEventListener('click', function() {
    imageModal.style.display = 'none';
});

// Close modal when clicking outside the image
imageModal.addEventListener('click', function(e) {
    if (e.target === imageModal) {
        imageModal.style.display = 'none';
    }
});

// Navigate through gallery
modalPrev.addEventListener('click', function(e) {
    e.stopPropagation();
    currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    updateModalImage();
});

modalNext.addEventListener('click', function(e) {
    e.stopPropagation();
    currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
    updateModalImage();
});

// Zoom functionality
modalImage.addEventListener('click', function(e) {
    e.stopPropagation();
    this.classList.toggle('zoomed');
});

// Populate featured products on homepage with age selection
function populateFeaturedProducts() {
    const featuredGrid = document.querySelector('.featured-products-grid');
    if (!featuredGrid) return;
    
    featuredGrid.innerHTML = '';
    
    // Select 8 products to feature (first 8 from the products array)
    const featuredProducts = products.slice(0, 8);
    
    featuredProducts.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'featured-product-card';
        productCard.style.setProperty('--animation-order', index);
        
        let badgeHTML = '';
        if (product.badge) {
            badgeHTML = `<div class="product-badge ${product.badge === 'SELLING FAST' ? 'selling-fast' : ''}">${product.badge}</div>`;
        }
        
        let priceHTML = '';
        let priceRangeText = '';
        
        if (product.pricing === "age") {
            // For age-based pricing
            const minPrice = Math.min(...Object.values(product.prices));
            const maxPrice = Math.max(...Object.values(product.prices));
            priceRangeText = `GH₵ ${minPrice} - ${maxPrice}`;
            
            priceHTML = `<div class="featured-product-price">
                <span class="sale-price">${priceRangeText}</span>
                <div style="font-size: 0.8rem; color: #aaaaaa; margin-top: 5px;">Select age range for exact price</div>
            </div>`;
        } else {
            // For fixed pricing
            priceHTML = `<div class="featured-product-price">
                <span class="sale-price">GH₵ ${product.price}</span>
            </div>`;
        }
        
        productCard.innerHTML = `
            ${badgeHTML}
            <div class="inventory-badge-featured" data-product-id="${product.id}"></div>
            <div class="featured-product-image" data-image="${product.image}">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='IMAGES/placeholder.jpg'">
            </div>
            <h3 class="featured-product-name">${product.name}</h3>
            <p class="product-description" style="font-size: 0.8rem; color: #aaaaaa; padding: 0 15px; margin-bottom: 10px;">${product.description}</p>
            ${priceHTML}
            <div class="featured-product-actions">
                ${product.pricing === "age" ? `
                    <select class="age-selector-featured" data-product-id="${product.id}">
                        <option value="">Select Age Range</option>
                        ${Object.entries(product.prices).map(([range, price]) => 
                            `<option value="${range}">${range} years - GH₵ ${price}</option>`
                        ).join('')}
                    </select>
                ` : `
                    <input type="hidden" class="fixed-price-featured" value="${product.price}" data-product-id="${product.id}">
                `}
                <div class="quantity-selector">
                    <button class="quantity-btn minus-btn-featured" data-product-id="${product.id}">-</button>
                    <input type="number" class="quantity-input-featured" value="1" min="1" max="10" data-product-id="${product.id}">
                    <button class="quantity-btn plus-btn-featured" data-product-id="${product.id}">+</button>
                </div>
                <button class="btn add-to-cart-featured" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        
        featuredGrid.appendChild(productCard);
    });
    
    // Initialize inventory badges
    featuredProducts.forEach(product => {
        updateFeaturedProductInventory(product.id);
    });
    
    // Add event listeners to Add to Cart buttons in featured products
    document.querySelectorAll('.add-to-cart-featured').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const product = products.find(p => p.id == productId);
            
            let selectedAge, price, quantity;
            
            if (product.pricing === "age") {
                // Age-based pricing
                const ageSelector = document.querySelector(`.age-selector-featured[data-product-id="${productId}"]`);
                selectedAge = ageSelector ? ageSelector.value : '';
                
                if (!selectedAge) {
                    alert('Please select an age range first.');
                    return;
                }
                price = product.prices[selectedAge];
            } else {
                // Fixed pricing
                selectedAge = "One Size";
                const fixedPriceInput = document.querySelector(`.fixed-price-featured[data-product-id="${productId}"]`);
                price = fixedPriceInput ? parseFloat(fixedPriceInput.value) : product.price;
            }
            
            // Get quantity
            const quantityInput = document.querySelector(`.quantity-input-featured[data-product-id="${productId}"]`);
            quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            // Add to cart
            if (addToCart(product, selectedAge, quantity, price)) {
                alert(`Added ${quantity} ${product.name} to cart${product.pricing === "age" ? ` for ${selectedAge} age range` : ''}`);
                
                // Reset form
                if (product.pricing === "age") {
                    const ageSelector = document.querySelector(`.age-selector-featured[data-product-id="${productId}"]`);
                    if (ageSelector) ageSelector.value = "";
                }
                if (quantityInput) quantityInput.value = "1";
            }
        });
    });
    
    // Add event listeners to quantity buttons in featured products
    document.addEventListener('click', function(e) {
        // Handle minus buttons
        if (e.target.classList.contains('minus-btn-featured')) {
            const productId = e.target.getAttribute('data-product-id');
            const quantityInput = document.querySelector(`.quantity-input-featured[data-product-id="${productId}"]`);
            if (quantityInput) {
                let value = parseInt(quantityInput.value);
                if (value > 1) {
                    quantityInput.value = value - 1;
                }
            }
        }
        
        // Handle plus buttons
        if (e.target.classList.contains('plus-btn-featured')) {
            const productId = e.target.getAttribute('data-product-id');
            const quantityInput = document.querySelector(`.quantity-input-featured[data-product-id="${productId}"]`);
            if (quantityInput) {
                let value = parseInt(quantityInput.value);
                if (value < 10) {
                    quantityInput.value = value + 1;
                }
            }
        }
    });

    // Add input validation for featured product quantity inputs
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity-input-featured')) {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 1) {
                e.target.value = 1;
            } else if (value > 10) {
                e.target.value = 10;
            }
        }
    });
}

// Populate store products with dynamic pricing and filtering
function populateStoreProducts() {
    const productsGrid = document.querySelector('.store-products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    console.log('Total products:', products.length);
    console.log('Current category filter:', currentCategory);
    
    // Filter products
    let filteredProducts = [...products];
    
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === currentCategory);
    }
    
    console.log('Filtered products count:', filteredProducts.length);
    
    // Update products count
    document.getElementById('products-count').textContent = filteredProducts.length;
    
    // Check if we have products to display
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #000000;">No products found in this category.</div>';
        return;
    }
    
    filteredProducts.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'store-product-card';
        productCard.style.setProperty('--animation-order', index);
        productCard.setAttribute('data-product-id', product.id);
        
        let badgeHTML = '';
        if (product.badge) {
            badgeHTML = `<div class="product-badge ${product.badge === 'SELLING FAST' ? 'selling-fast' : ''}">${product.badge}</div>`;
        }
        
        let priceHTML = '';
        let ageSelectorHTML = '';
        let priceRangeText = '';
        
        if (product.pricing === "age") {
            // For age-based pricing
            const minPrice = Math.min(...Object.values(product.prices));
            const maxPrice = Math.max(...Object.values(product.prices));
            priceRangeText = `GH₵ ${minPrice} - ${maxPrice}`;
            
            priceHTML = `<div class="store-product-price">
                <span class="store-sale-price">${priceRangeText}</span>
            </div>`;
            
            ageSelectorHTML = `
                <select class="age-selector">
                    <option value="">Select Age Range</option>
                    ${Object.entries(product.prices).map(([range, price]) => 
                        `<option value="${range}">${range} years - GH₵ ${price}</option>`
                    ).join('')}
                </select>
            `;
        } else {
            // For fixed pricing
            priceHTML = `<div class="store-product-price">
                <span class="store-sale-price">GH₵ ${product.price}</span>
            </div>`;
            
            ageSelectorHTML = `
                <select class="age-selector" style="display: none;">
                    <option value="all">One Size - GH₵ ${product.price}</option>
                </select>
                <input type="hidden" class="fixed-price" value="${product.price}">
            `;
        }
        
        productCard.innerHTML = `
            ${badgeHTML}
            <div class="store-product-image" data-image="${product.image}">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='IMAGES/placeholder.jpg'">
            </div>
            <h3 class="store-product-name">${product.name}</h3>
            <p class="product-description" style="font-size: 0.8rem; color: #aaaaaa; padding: 0 15px; margin-bottom: 10px;">${product.description}</p>
            ${priceHTML}
            <div class="store-product-actions">
                ${ageSelectorHTML}
                <div class="quantity-selector">
                    <button class="quantity-btn minus-btn">-</button>
                    <input type="number" class="quantity-input" value="1" min="1" max="10">
                    <button class="quantity-btn plus-btn">+</button>
                </div>
                <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Add inventory badges
    products.forEach(product => {
        updateInventoryDisplay(product.id);
    });
    
    // Re-add event listeners to Add to Cart buttons
    setTimeout(() => {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const product = products.find(p => p.id == productId);
                const ageSelector = this.parentElement.querySelector('.age-selector');
                const quantityInput = this.parentElement.querySelector('.quantity-input');
                const quantity = parseInt(quantityInput.value);
                
                let selectedAge, price;
                
                if (product.pricing === "age") {
                    // Age-based pricing
                    selectedAge = ageSelector.value;
                    if (!selectedAge) {
                        alert('Please select an age range first.');
                        return;
                    }
                    price = product.prices[selectedAge];
                } else {
                    // Fixed pricing
                    selectedAge = "One Size";
                    price = product.price;
                }
                
                // Add to cart
                if (addToCart(product, selectedAge, quantity, price)) {
                    alert(`Added ${quantity} ${product.name} to cart${product.pricing === "age" ? ` for ${selectedAge} age range` : ''}`);
                }
            });
        });
        
        // Re-add event listeners to quantity buttons in store
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('.quantity-input');
                let value = parseInt(input.value);
                
                if (this.classList.contains('minus-btn')) {
                    if (value > 1) {
                        input.value = value - 1;
                    }
                } else if (this.classList.contains('plus-btn')) {
                    if (value < 10) {
                        input.value = value + 1;
                    }
                }
            });
        });
    }, 100);
}

// Page Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    // Function to show a specific page
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        
        // If showing store page, populate products
        if (pageId === 'store-page') {
            populateStoreProducts();
        }
        
        // If showing cart page, update cart display
        if (pageId === 'cart-page') {
            updateCartDisplay();
        }
        
        // If showing account page, update content
        if (pageId === 'account-page') {
            showOrderHistory();
        }
        
        // Reinitialize scroll animations for new page
        setTimeout(initScrollAnimations, 100);
    }           

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page') + '-page';
            showPage(pageId);
            
            // Close mobile menu if open
            document.querySelector('.nav-links').classList.remove('active');
        });
    });
    
    // Show home page by default
    showPage('home-page');
    
    // Enhanced form validation
    const forms = ['login-form', 'register-form', 'contactForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    validateField(this);
                });
                
                input.addEventListener('input', function() {
                    const formGroup = this.closest('.form-group');
                    if (formGroup && formGroup.classList.contains('error')) {
                        formGroup.classList.remove('error');
                    }
                });
            });
        }
    });
    
    // Enhanced checkout with inventory validation
    const originalProceedCheckout = document.getElementById('proceed-checkout').onclick;
    document.getElementById('proceed-checkout').onclick = function() {
        if (!validateCheckoutInventory()) {
            return;
        }
        originalProceedCheckout?.();
    };
    
    // User account dropdown
    const userAccount = document.querySelector('.user-account');
    const userDropdown = document.querySelector('.user-dropdown');
    
    userAccount.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        userDropdown.classList.remove('active');
    });
    
    // Category dropdown
    const categoryFilter = document.getElementById('category-filter');
    const categoryDropdown = document.querySelector('.category-dropdown');
    
    categoryFilter.addEventListener('click', function(e) {
        e.stopPropagation();
        categoryDropdown.classList.toggle('active');
    });
    
    // Close category dropdown when clicking outside
    document.addEventListener('click', function() {
        categoryDropdown.classList.remove('active');
    });
    
    // Category filter selection
    document.querySelectorAll('.category-dropdown a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterByCategory(category);
            categoryDropdown.classList.remove('active');
        });
    });
    
    // Account tabs
    const accountTabs = document.querySelectorAll('.account-tab');
    const accountContents = document.querySelectorAll('.account-content');
    
    accountTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            accountTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            accountContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-content`) {
                    content.classList.add('active');
                }
            });
            
            // If showing orders, update order history
            if (tabId === 'orders') {
                showOrderHistory();
            }
        });
    });
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                updateUserInterface();
                alert('Login successful!');
                showPage('home-page');
            } else {
                alert('Invalid email or password. Please try again.');
            }
        }
    });
    
    // Register form submission
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            
            // Check if passwords match
            if (password !== confirm) {
                alert('Passwords do not match. Please try again.');
                return;
            }
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                alert('An account with this email already exists. Please login instead.');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                phone: phone,
                password: password
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            updateUserInterface();
            
            alert('Registration successful! You are now logged in.');
            showPage('home-page');
        }
    });
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateUserInterface();
        alert('You have been logged out.');
        showPage('home-page');
    });
    
    // Contact form submission
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        }
    });
    
    // Quantity selectors on homepage
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            let value = parseInt(input.value);
            
            if (this.classList.contains('minus-btn')) {
                if (value > 1) {
                    input.value = value - 1;
                }
            } else if (this.classList.contains('plus-btn')) {
                if (value < 10) {
                    input.value = value + 1;
                }
            }
        });
    });
    
    // Delivery location change
    document.getElementById('delivery-location').addEventListener('change', function() {
        updateCartTotals();
    });
    
    // Payment option selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
    
    // Proceed to checkout
    document.getElementById('proceed-checkout').addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add some items before proceeding.');
            return;
        }
        
        if (!validateForm(document.querySelector('.checkout-form'))) {
            return;
        }
        
        if (!document.querySelector('.payment-option.selected')) {
            alert('Please select a payment method.');
            return;
        }
        
        const deliveryLocation = document.getElementById('delivery-location');
        if (!deliveryLocation.value) {
            alert('Please select a delivery location.');
            return;
        }
        
        const name = document.getElementById('customer-name').value;
        const email = document.getElementById('customer-email').value;
        const phone = document.getElementById('customer-phone').value;
        const address = document.getElementById('customer-address').value;
        
        // Create order
        const order = {
            id: Date.now(),
            userId: currentUser ? currentUser.id : null,
            date: new Date().toISOString(),
            items: [...cart],
            customer: { name, email, phone, address },
            deliveryFee: parseInt(document.getElementById('delivery-location').value),
            status: 'Pending'
        };
        
        // Calculate total
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        order.total = subtotal + order.deliveryFee;
        
        // Save order
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        cart = [];
        updateCartCount();
        
        generateInvoice(name, email, phone, address, order);
        document.getElementById('invoice-modal').style.display = 'flex';
    });
    
    // Close modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('invoice-modal').style.display = 'none';
    });
    
    // Send invoice via email
    document.getElementById('send-email').addEventListener('click', function() {
        const email = document.getElementById('customer-email').value;
        alert(`Invoice sent to ${email}`);
        document.getElementById('invoice-modal').style.display = 'none';
        showPage('home-page');
    });
    
    // Send invoice via WhatsApp
    document.getElementById('send-whatsapp').addEventListener('click', function() {
        const phone = document.getElementById('customer-phone').value;
        alert(`Invoice sent via WhatsApp to ${phone}`);
        document.getElementById('invoice-modal').style.display = 'none';
        showPage('home-page');
    });
    
    // WhatsApp order button
    document.getElementById('whatsapp-order').addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add some items before ordering.');
            return;
        }
        
        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;
        
        if (!name || !phone) {
            alert('Please provide your name and phone number.');
            return;
        }
        
        // Generate WhatsApp message
        let message = `Hello! I would like to place an order:\n\n`;
        cart.forEach(item => {
            message += `${item.quantity}x ${item.name} (${item.ageRange}) - GH₵ ${item.price * item.quantity}\n`;
        });
        message += `\nTotal: GH₵ ${document.getElementById('total-amount').textContent.replace('GH₵ ', '')}`;
        message += `\n\nName: ${name}\nPhone: ${phone}`;
        
        // Encode message for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=233240302040&text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
    });
    
    // Add click events to all product images for gallery
    document.addEventListener('click', function(e) {
        if (e.target.closest('.product-image') || e.target.closest('.store-product-image') || e.target.closest('.shop-image') || e.target.closest('.cart-item-image') || e.target.closest('.featured-product-image')) {
            const productCard = e.target.closest('.product-card, .store-product-card, .shop-card, .featured-product-card');
            if (productCard) {
                const productImages = [productCard.querySelector('img').src];
                // If this was a product with multiple images, we would collect them here
                openImageModal(productImages, 0);
            }
        }
    });
    
    // Add click events to shop cards
    document.querySelectorAll('.shop-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn')) {
                const page = this.getAttribute('data-page');
                if (page) {
                    showPage(page + '-page');
                }
            }
        });
    });
    
    // Mobile menu toggle
    document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
        document.querySelector('.nav-links').classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!navLinks.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            navLinks.classList.remove('active');
        }
    });
});


// Shopping Cart System

// Shopping cart
let cart = [];

// Enhanced addToCart function with inventory check
function addToCart(product, ageRange, quantity, price) {
    // Check inventory first
    const inventoryCheck = checkInventory(product.id, ageRange, quantity);
    
    if (!inventoryCheck.available) {
        alert(inventoryCheck.message);
        return false;
    }
    
    if (inventoryCheck.lowStock) {
        if (!confirm(`${inventoryCheck.message}\n\nDo you want to continue?`)) {
            return false;
        }
    }
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => 
        item.id === product.id && item.ageRange === ageRange
    );
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const inventoryCheckUpdate = checkInventory(product.id, ageRange, newQuantity);
        
        if (!inventoryCheckUpdate.available) {
            alert(inventoryCheckUpdate.message);
            return false;
        }
        
        existingItem.quantity = newQuantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            image: product.image,
            ageRange: ageRange,
            quantity: quantity,
            price: price,
            pricingType: product.pricing
        });
    }
    
    // Update inventory
    updateInventory(product.id, quantity);
    
    // Update cart count
    updateCartCount();
    
    // Update cart display if we're on the cart page
    if (document.getElementById('cart-page').classList.contains('active')) {
        updateCartDisplay();
    }
    
    return true;
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Add animation to cart count when it changes
    if (totalItems > 0) {
        cartCount.style.animation = 'none';
        setTimeout(() => {
            cartCount.style.animation = 'pulse 2s infinite';
        }, 10);
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    const emptyMessage = document.querySelector('.empty-cart-message');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart-message" style="text-align: center; padding: 60px 0;"><p>Your cart is currently empty.</p><a href="#" class="btn nav-link" data-page="store" style="margin-top: 20px;">Continue Shopping</a></div>';
        updateCartTotals();
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.style.setProperty('--animation-order', index);
        cartItem.innerHTML = `
            <div class="cart-item-image" data-image="${item.image}">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-age">Age Range: ${item.ageRange}</p>
                <p class="cart-item-price">GH₵ ${item.price} each</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus-btn" data-index="${index}">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                <button class="btn btn-secondary remove-btn" data-index="${index}" style="margin-left: 10px;">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Add event listeners to quantity buttons in cart
    document.querySelectorAll('.cart-item .quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            
            if (this.classList.contains('minus-btn')) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                } else {
                    cart.splice(index, 1);
                }
            } else if (this.classList.contains('plus-btn')) {
                if (cart[index].quantity < 10) {
                    cart[index].quantity++;
                }
            }
            
            updateCartCount();
            updateCartDisplay();
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartCount();
            updateCartDisplay();
        });
    });
    
    updateCartTotals();
}

// Update cart totals
function updateCartTotals() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const deliveryFee = parseInt(document.getElementById('delivery-location').value) || 0;
    const total = subtotal + deliveryFee;
    
    document.getElementById('subtotal').textContent = `GH₵ ${subtotal.toFixed(2)}`;
    document.getElementById('delivery-fee').textContent = `GH₵ ${deliveryFee.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `GH₵ ${total.toFixed(2)}`;
}

// Generate invoice
function generateInvoice(name, email, phone, address, order) {
    const invoiceContent = document.getElementById('invoice-content');
    let invoiceHTML = `
        <h3>Invoice for ${name}</h3>
        <p>Email: ${email} | Phone: ${phone}</p>
        <p>Delivery Address: ${address}</p>
        
        <div class="invoice-details">
            <h4>Order Details</h4>
    `;
    
    order.items.forEach(item => {
        invoiceHTML += `
            <div class="invoice-item">
                <span>${item.quantity}x ${item.name} (${item.ageRange})</span>
                <span>GH₵ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = order.deliveryFee;
    const total = order.total;
    
    invoiceHTML += `
            <div class="invoice-item">
                <span>Subtotal</span>
                <span>GH₵ ${subtotal.toFixed(2)}</span>
            </div>
            <div class="invoice-item">
                <span>Delivery Fee</span>
                <span>GH₵ ${deliveryFee.toFixed(2)}</span>
            </div>
            <div class="invoice-item" style="font-weight: bold;">
                <span>Total</span>
                <span>GH₵ ${total.toFixed(2)}</span>
            </div>
        </div>
        
        <p>Thank you for your order! We will contact you shortly to confirm delivery details.</p>
        <p>Order ID: #${order.id}</p>
    `;
    
    invoiceContent.innerHTML = invoiceHTML;
}

// Inventory Management System

// Enhanced product data with inventory tracking
const productsWithInventory = [
    // Career Day Costumes - Age-based pricing
    { 
        id: 1, 
        name: "Surgeon Costume", 
        category: "Career Day", 
        image: "IMAGES/doctor.jpg", 
        badge: "", 
        description: "Complete surgeon costume with lab coat, surgical mask, and toy medical instruments. Perfect for career day or medical-themed events.",
        pricing: "age", 
        prices: { "1-3": 270, "4-6": 280, "7-10": 290, "11-16": 290 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 2, 
        name: "Engineer Costume", 
        category: "Career Day", 
        image: "IMAGES/engineer.jpg", 
        badge: "SELLING FAST", 
        description: "Engineer costume with hard hat, safety vest, and tool belt. Inspires creativity and problem-solving skills.",
        pricing: "age", 
        prices: { "1-6": 320, "7-12": 330, "13-16": 350 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 3, 
        name: "Firefighter Costume", 
        category: "Career Day", 
        image: "IMAGES/fire.jpg", 
        badge: "", 
        description: "Complete firefighter outfit with jacket, helmet, and toy fire extinguisher. Perfect for aspiring heroes.",
        pricing: "age", 
        prices: { "1-3": 270, "4-6": 280, "7-10": 290, "11-16": 300 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 4, 
        name: "Pilot Uniform", 
        category: "Career Day", 
        image: "IMAGES/pilot.png", 
        badge: "", 
        description: "Authentic-looking pilot uniform with hat and wings. Perfect for career day or aviation-themed parties.",
        pricing: "age", 
        prices: { "1-6": 320, "7-12": 350, "13-16": 370 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 5, 
        name: "Chef Costume", 
        category: "Career Day", 
        image: "IMAGES/chef.jpg", 
        badge: "", 
        description: "Complete chef outfit with hat, apron, and toy cooking utensils. Perfect for little aspiring chefs.",
        pricing: "age", 
        prices: { "1-3": 270, "4-6": 280, "7-10": 290, "11-16": 300 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 6, 
        name: "Military Uniform", 
        category: "Career Day", 
        image: "IMAGES/soldier.jpg", 
        badge: "", 
        description: "Military-style uniform perfect for career day or patriotic events. Durable and comfortable for all-day wear.",
        pricing: "age", 
        prices: { "1-6": 320, "7-12": 350, "13-16": 370 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 7, 
        name: "Lawyer Costume", 
        category: "Career Day", 
        image: "IMAGES/law.jpg", 
        badge: "", 
        description: "Professional lawyer costume with suit jacket and tie. Perfect for career day or mock trial events.",
        pricing: "age", 
        prices: { "1-6": 320, "7-12": 350, "13-16": 370 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 8, 
        name: "Doctor Costume", 
        category: "Career Day", 
        image: "IMAGES/doc.jpg", 
        badge: "SELLING FAST", 
        description: "Classic doctor costume with white coat and toy stethoscope. Inspires future medical professionals.",
        pricing: "age", 
        prices: { "1-4": 240, "5-8": 250, "9-12": 260, "13-16": 270 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 9, 
        name: "Surgeon Costume", 
        category: "Career Day", 
        image: "IMAGES/surgeon.jpg", 
        badge: "", 
        description: "Complete surgeon costume with lab coat, surgical mask, and toy medical instruments. Perfect for career day or medical-themed events.",
        pricing: "age", 
        prices: { "1-3": 270, "4-6": 280, "7-10": 290, "11-16": 290 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 10, 
        name: "Scientist Lab Coat", 
        category: "Career Day", 
        image: "IMAGES/labcoat.jpg", 
        badge: "", 
        description: "Lab coat for aspiring scientists. Includes safety goggles and toy test tubes for realistic play.",
        pricing: "age", 
        prices: { "1-3": 270, "4-6": 280, "7-10": 290, "11-16": 300 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 11, 
        name: "Captain Costume", 
        category: "Career Day", 
        image: "IMAGES/captain.png", 
        badge: "", 
        description: "Fasten your seatbelts! This captain outfit lets kids command their own flight of imagination..",
        pricing: "age", 
        prices: { "1-3": 270, "4-6": 280, "7-10": 290, "11-16": 300 },
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 12, 
        name: "Surgeon Costume", 
        category: "Career Day", 
        image: "IMAGES/doctors.jpg", 
        badge: "", 
        description: "Complete surgeon costume with lab coat, surgical mask, and toy medical instruments. Perfect for career day or medical-themed events.",
        pricing: "age", 
        prices: { "1-3": 270, "4-6": 280, "7-10": 290 },
        inventory: 30,
        lowStockThreshold: 3
    },

    // Biblical Costumes - Different age ranges and pricing
    { 
        id: 13, 
        name: "Prince costume", 
        category: "Biblical", 
        image: "IMAGES/Prince costume.png", 
        badge: "", 
        description: "Regal Prince costume with robe, crown, and scepter. Perfect for nativity plays or biblical events.",
        pricing: "fixed", 
        price: 350,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 14, 
        name: "Prince", 
        category: "Biblical", 
        image: "IMAGES/Prince.png", 
        badge: "", 
        description: "A regal prince costume, complete with a robe, crown, and scepter, is perfect for a nativity play or biblical event.",
        pricing: "fixed", 
        price: 180,
        lowStockThreshold: 3
    },
    
    { 
        id: 15, 
        name: "Jesus Costume", 
        category: "Biblical", 
        image: "IMAGES/Jesus.png", 
        badge: "", 
        description: "Inspiring little Messiah costume with flowing robe, red sash, and sandals — perfect for plays, parties, or heavenly entrances.",
        pricing: "fixed", 
        price: 180,
        inventory: 30,
        lowStockThreshold: 3
    },
    
    { 
        id: 16, 
        name: "Mary Costume", 
        category: "Biblical", 
        image: "IMAGES/Mary.png", 
        badge: "", 
        description: "Traditional Mary costume with blue robe and headpiece. Perfect for nativity plays and religious events.",
        pricing: "fixed", 
        price: 180,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 17, 
        name: "Roman Soldier Costume", 
        category: "Biblical", 
        image: "IMAGES/roman soldier.png", 
        badge: "", 
        description: "Step back in time and defend the empire with this heroic Roman soldier costume.",
        pricing: "fixed", 
        price: 350,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 18, 
        name: "Roman Soldier ", 
        category: "Biblical", 
        image: "IMAGES/roman soldier n.png", 
        badge: "", 
        description: "Step back in time and defend the empire with this heroic Roman soldier costume.",
        pricing: "fixed", 
        price: 350,
        inventory: 30,
        lowStockThreshold: 3
    },
    
    // Character Costumes - Different pricing structure
    { 
        id: 19, 
        name: "Flash Costume", 
        category: "Character", 
        image: "IMAGES/flash.jpg", 
        badge: "", 
        description: "Generic superhero costume with mask. Lets your child imagine their own superhero identity.",
        pricing: "fixed", 
        price: 250,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 20, 
        name: "Princess Dress", 
        category: "Character", 
        image: "IMAGES/princess.png", 
        badge: "SELLING FAST", 
        description: "Beautiful princess dress with shimmering fabric and decorative details. Perfect for parties and imaginative play.",
        pricing: "fixed", 
        price: 320,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 21, 
        name: "Princess Costume", 
        category: "Character", 
        image: "IMAGES/princess 1.png", 
        badge: "", 
        description: "Beautiful princess dress with shimmering fabric and decorative details. Perfect for parties and imaginative play.",
        pricing: "fixed", 
        price: 320,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 22, 
        name: "Princess Costume", 
        category: "Character", 
        image: "IMAGES/princess 2.png", 
        badge: "", 
        description: "Sparkle and shine like royalty with this magical princess costume made for fairytale dreams.",
        pricing: "fixed", 
        price: 320,
        inventory: 30,
        lowStockThreshold: 3
    },
    
    { 
        id: 23, 
        name: "Boys swimming costume", 
        category: "Character", 
        image: "IMAGES/swimming costume.jpg", 
        badge: "", 
        description: "Dive, swim, and play—this boys’ swimwear is perfect for little champions of the pool.",
        pricing: "fixed", 
        price: 150,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 24, 
        name: "Spider man Costume", 
        category: "Character", 
        image: "IMAGES/spider.jpg", 
        badge: "", 
        description: "Swing into action with this Spider-Man costume—perfect for little heroes ready to save the day.",
        pricing: "fixed", 
        price: 280,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 25, 
        name: "Paw patrol", 
        category: "Character", 
        image: "IMAGES/character costume paw patrol.jpg", 
        badge: "", 
        description: "From Adventure Bay to the backyard, this Paw Patrol costume brings heroic fun to life.",
        pricing: "fixed", 
        price: 250,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 26, 
        name: "Ballet costume", 
        category: "Character", 
        image: "IMAGES/balley.jpg", 
        badge: "SELLING FAST", 
        description: "A ballet costume is a graceful outfit designed for dancing — typically featuring a fitted bodice, a tulle skirt, and soft ballet shoes.",
        pricing: "fixed", 
        price: 250,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 27, 
        name: "Chinese costume", 
        category: "Character", 
        image: "IMAGES/chinese.png", 
        badge: "SELLING FAST", 
        description: "Celebrate culture and tradition with this beautiful Chinese costume full of vibrant colors and elegance.",
        pricing: "fixed", 
        price: 300,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 28, 
        name: "Chinese costume", 
        category: "Character", 
        image: "IMAGES/chinese 1.png", 
        badge: "SELLING FAST", 
        description: "Celebrate culture and tradition with this beautiful Chinese costume full of vibrant colors and elegance.",
        pricing: "fixed", 
        price: 300,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 29, 
        name: "Power Rangers costume", 
        category: "Character", 
        image: "IMAGES/power rangers.jpg", 
        badge: "SELLING FAST", 
        description: "Transform into your favorite hero and save the day with this awesome Power Rangers outfit.",
        pricing: "fixed", 
        price: 250,
        inventory: 30,
        lowStockThreshold: 3
    },
    
    // Accessories - Fixed pricing (no age limitation)
    { 
        id: 30, 
        name: "White Lab Coat", 
        category: "Accessories", 
        image: "IMAGES/labcoat.jpg", 
        badge: "", 
        description: "Authentic white lab coat for doctors, scientists, or veterinarians. Adjustable for different sizes.",
        pricing: "fixed", 
        price: 120,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 31, 
        name: "Stethoscope Toy Set", 
        category: "Accessories", 
        image: "IMAGES/stethoscope toy set.jpg", 
        badge: "", 
        description: "Toy stethoscope that looks realistic. Perfect for completing any medical professional costume.",
        pricing: "fixed", 
        price: 80,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 32, 
        name: "Police Accessories Set", 
        category: "Accessories", 
        image: "IMAGES/police accessories.png", 
        badge: "SELLING FAST", 
        description: "Police badge and handcuffs set. Perfect accessory for police officer or detective costumes.",
        pricing: "fixed", 
        price: 60,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 33, 
        name: "Aeroplane", 
        category: "Accessories", 
        image: "IMAGES/aero.jpg", 
        badge: "", 
        description: "Watch your child’s imagination lift off with this sleek and colorful toy aeroplane.",
        pricing: "fixed", 
        price: 100,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 34, 
        name: "Gun", 
        category: "Accessories", 
        image: "IMAGES/gun.jpg", 
        badge: "", 
        description: "Get ready for friendly battles and endless fun with this colorful, kid-safe toy blaster.",
        pricing: "fixed", 
        price: 90,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 35, 
        name: "Doctors Medical Play Set", 
        category: "Accessories", 
        image: "IMAGES/doctor's medical play set.jpg", 
        badge: "", 
        description: "Spark your child’s imagination as they play doctor, cure cuddly patients, and save the day.",
        pricing: "fixed", 
        price: 120,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 36, 
        name: "Iron Man bag", 
        category: "Accessories", 
        image: "IMAGES/bag.jpg", 
        badge: "", 
        description: "Packed with style and Stark-level tech vibes, this Iron Man bag is your everyday armor.",
        pricing: "fixed", 
        price: 250,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 37, 
        name: "Stethoscope", 
        category: "Accessories", 
        image: "IMAGES/stethoscope.jpg", 
        badge: "", 
        description: "stethoscope that looks realistic. Perfect for completing any medical professional costume.",
        pricing: "fixed", 
        price: 100,
        inventory: 30,
        lowStockThreshold: 3
    },
    { 
        id: 38, 
        name: "Stethoscope Toy Set", 
        category: "Accessories", 
        image: "IMAGES/stethoscope toy set 1.jpg", 
        badge: "", 
        description: "Toy stethoscope that looks realistic. Perfect for completing any medical professional costume.",
        pricing: "fixed", 
        price: 100,
        inventory: 30,
        lowStockThreshold: 3
    },
];

// Replace original products array
let products = productsWithInventory;

// Inventory management functions
function checkInventory(productId, ageRange = null, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return { available: false, message: 'Product not found' };
    
    const currentInventory = product.inventory;
    
    if (currentInventory <= 0) {
        return { 
            available: false, 
            message: 'Sorry, this product is out of stock',
            inventory: 0
        };
    }
    
    if (currentInventory < quantity) {
        return { 
            available: false, 
            message: `Only ${currentInventory} items available in stock`,
            inventory: currentInventory
        };
    }
    
    if (currentInventory <= product.lowStockThreshold) {
        return { 
            available: true, 
            message: `Low stock - only ${currentInventory} left!`,
            inventory: currentInventory,
            lowStock: true
        };
    }
    
    return { 
        available: true, 
        message: 'In stock',
        inventory: currentInventory
    };
}

function updateInventory(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.inventory = Math.max(0, product.inventory - quantity);
        updateInventoryDisplay(productId);
        return true;
    }
    return false;
}

function updateInventoryDisplay(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Update inventory display in product cards
    const productCards = document.querySelectorAll(`.store-product-card`);
    productCards.forEach(card => {
        const productElement = card.querySelector(`[data-product-id="${productId}"]`);
        if (productElement) {
            let inventoryBadge = card.querySelector('.inventory-badge');
            if (!inventoryBadge) {
                inventoryBadge = document.createElement('div');
                inventoryBadge.className = 'inventory-badge';
                card.querySelector('.store-product-actions').prepend(inventoryBadge);
            }
            updateInventoryBadge(inventoryBadge, product.inventory, product.lowStockThreshold);
        }
    });
}

function updateInventoryBadge(badge, inventory, threshold) {
    badge.textContent = `${inventory} in stock`;
    badge.className = 'inventory-badge';
    
    if (inventory === 0) {
        badge.classList.add('out-of-stock');
        badge.textContent = 'Out of stock';
    } else if (inventory <= threshold) {
        badge.classList.add('low-stock');
        badge.textContent = `Only ${inventory} left!`;
    } else if (inventory > threshold && inventory <= 10) {
        badge.classList.add('medium-stock');
    } else {
        badge.classList.add('in-stock');
    }
}

// Enhanced checkout process with inventory validation
function validateCheckoutInventory() {
    for (const item of cart) {
        const inventoryCheck = checkInventory(item.id, item.ageRange, item.quantity);
        if (!inventoryCheck.available) {
            alert(`Inventory issue: ${item.name} - ${inventoryCheck.message}`);
            return false;
        }
    }
    return true;
}

// Initialize inventory system
function initializeInventorySystem() {
    // Add inventory badges to all product cards
    products.forEach(product => {
        updateInventoryDisplay(product.id);
    });
}

// Update featured product inventory displays
function updateFeaturedProductInventory(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const inventoryBadge = document.querySelector(`.inventory-badge-featured[data-product-id="${productId}"]`);
    if (inventoryBadge) {
        updateInventoryBadge(inventoryBadge, product.inventory, product.lowStockThreshold);
    }
}

// Initialize featured product inventory on page load
function initializeFeaturedProductInventory() {
    products.forEach(product => {
        updateFeaturedProductInventory(product.id);
    });
}

// Utility Functions

// Global variables
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let currentCategory = 'all';

// Performance monitoring implementation
const performanceIndicator = document.getElementById('performance-indicator');
let performanceData = {
    pageLoadStart: performance.now(),
    pageLoadEnd: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0
};

// Performance observer for Core Web Vitals
const perfObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            performanceData.firstContentfulPaint = entry.startTime;
            updatePerformanceIndicator('First contentful paint: ' + Math.round(entry.startTime) + 'ms');
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
            performanceData.largestContentfulPaint = entry.startTime;
            updatePerformanceIndicator('Largest contentful paint: ' + Math.round(entry.startTime) + 'ms');
        }
    });
});

perfObserver.observe({entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift']});

// Update performance indicator
function updatePerformanceIndicator(message) {
    if (performanceIndicator) {
        performanceIndicator.style.display = 'block';
        performanceIndicator.textContent = message;
        
        // Hide after 5 seconds
        setTimeout(() => {
            performanceIndicator.style.display = 'none';
        }, 5000);
    }
}

// Enhanced form validation function
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        
        const errorMessage = formGroup.querySelector('.error-message');
        
        // Reset error state
        formGroup.classList.remove('error');
        
        // Check required fields
        if (input.hasAttribute('required') && !input.value.trim()) {
            showFieldError(formGroup, 'This field is required');
            isValid = false;
            return;
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                showFieldError(formGroup, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Ghana phone number validation
        if (input.type === 'tel' && input.value && input.hasAttribute('required')) {
            const phoneRegex = /^(?:\+233|0)[2357]\d{8}$/;
            const cleanPhone = input.value.replace(/\s+/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                showFieldError(formGroup, 'Please enter a valid Ghana phone number (e.g., 0595183757 or +233595183757)');
                isValid = false;
            } else {
                // Format phone number
                input.value = cleanPhone.replace(/^0/, '+233');
            }
        }
        
        // Password strength validation
        if (input.type === 'password' && input.value && input.hasAttribute('required')) {
            if (input.value.length < 8) {
                showFieldError(formGroup, 'Password must be at least 8 characters long');
                isValid = false;
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(input.value)) {
                showFieldError(formGroup, 'Password must contain uppercase, lowercase letters and numbers');
                isValid = false;
            }
        }
        
        // Name validation (letters and spaces only)
        if (input.id.includes('name') && input.value) {
            const nameRegex = /^[A-Za-z\s]{2,50}$/;
            if (!nameRegex.test(input.value.trim())) {
                showFieldError(formGroup, 'Please enter a valid name (letters and spaces only)');
                isValid = false;
            }
        }
        
        // Quantity validation
        if (input.classList.contains('quantity-input')) {
            const quantity = parseInt(input.value);
            if (isNaN(quantity) || quantity < 1 || quantity > 10) {
                showFieldError(formGroup, 'Quantity must be between 1 and 10');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function showFieldError(formGroup, message) {
    formGroup.classList.add('error');
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

function validateField(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error');
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(formGroup, 'This field is required');
        return false;
    }
    
    // Field-specific validation
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            showFieldError(formGroup, 'Please enter a valid email address');
            return false;
        }
    }
    
    return true;
}

// Image optimization and lazy loading
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy-image');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            img.classList.add('lazy-image');
            img.dataset.src = img.src;
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDE3NVYxNzVIMTI1VjEyNVoiIGZpbGw9IiNEOEQ4RDgiLz4KPC9zdmc+';
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.classList.remove('lazy-image');
            img.classList.add('loaded');
        });
    }
}

// Enhanced image error handling
function setupImageErrorHandling() {
    // Set up error handlers for all images
    document.querySelectorAll('img').forEach(img => {
        // Store original source
        img.dataset.originalSrc = img.src;
        
        // Add error handler
        img.addEventListener('error', function() {
            handleImageError(this);
        });
        
        // Add loading state
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
}

function handleImageError(imgElement) {
    console.warn('Image failed to load:', imgElement.src);
    
    // Try fallback images in order
    const fallbacks = [
        'IMAGES/placeholder.jpg',
        'IMAGES/fallback-product.jpg',
        'https://via.placeholder.com/300x300/ffffff/666666?text=Costume+Image+Not+Available'
    ];
    
    let currentIndex = 0;
    
    function tryNextFallback() {
        if (currentIndex < fallbacks.length) {
            imgElement.src = fallbacks[currentIndex];
            currentIndex++;
        } else {
            // All fallbacks failed, show error icon
            imgElement.alt = 'Image not available';
            imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik03NSA1MEgxMjVWMTUwSDc1VjUwWiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNODAgNjBIMTIwVjE0MEg4MFY2MFoiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTEwMCAxMjBMMTEwIDEzMEw5MCAxMzBMMTAwIDEyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iOTAiIHI9IjUiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
        }
    }
    
    imgElement.addEventListener('error', tryNextFallback, { once: true });
    tryNextFallback();
}

// Initialize accent animations
function initAccentAnimations() {
    const accentContainer = document.getElementById('accent-animations');
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.width = Math.random() * 40 + 10 + 'px';
        bubble.style.height = bubble.style.width;
        bubble.style.animationDelay = Math.random() * 15 + 's';
        bubble.style.animationDuration = Math.random() * 10 + 10 + 's';
        accentContainer.appendChild(bubble);
    }
}

// Initialize scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.product-card, .shop-card, .store-product-card, .featured-product-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Check login status
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }
}

// Update user interface based on login status
function updateUserInterface() {
    const userIcon = document.querySelector('.user-account i');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (currentUser) {
        userIcon.className = 'fas fa-user-check';
        // Update account page to show user info
        if (document.getElementById('account-page').classList.contains('active')) {
            showOrderHistory();
        }
    } else {
        userIcon.className = 'fas fa-user';
    }
}

// Show order history
function showOrderHistory() {
    const orderHistoryBody = document.getElementById('order-history-body');
    const noOrders = document.getElementById('no-orders');
    
    if (!currentUser) {
        noOrders.style.display = 'block';
        orderHistoryBody.innerHTML = '';
        return;
    }
    
    const userOrders = orders.filter(order => order.userId === currentUser.id);
    
    if (userOrders.length === 0) {
        noOrders.style.display = 'block';
        orderHistoryBody.innerHTML = '';
    } else {
        noOrders.style.display = 'none';
        orderHistoryBody.innerHTML = userOrders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>${order.items.length} items</td>
                <td>GH₵ ${order.total.toFixed(2)}</td>
                <td>${order.status}</td>
            </tr>
        `).join('');
    }
}

// Filter products by category
function filterByCategory(category) {
    currentCategory = category;
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.innerHTML = `${category === 'all' ? 'All Categories' : category} <i class="fas fa-chevron-down"></i>`;
    
    console.log('Filtering by category:', category);
    populateStoreProducts();
}