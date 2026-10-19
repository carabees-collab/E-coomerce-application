const products = [
	{ id: "arc-chair", name: "The Arc Chair", category: "Furniture", detail: "Solid ash · Natural", price: 480, tag: "Bestseller", image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=900&q=80", alt: "Sculptural wooden chair in a warm, minimal room" },
	{ id: "dusk-lamp", name: "Dusk Table Lamp", category: "Lighting", detail: "Powder-coated steel · Olive", price: 195, tag: "New arrival", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80", alt: "Warm sculptural table lamp" },
	{ id: "everyday-throw", name: "Everyday Throw", category: "Textiles", detail: "Recycled cotton · Moss", price: 88, tag: "Made nearby", image: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=900&q=80", alt: "Softly layered neutral throw on a sofa" },
	{ id: "low-table", name: "Low Tide Table", category: "Furniture", detail: "Solid oak · Hand-finished", price: 620, tag: "Small batch", image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=900&q=80", alt: "Low wooden side table beside a sofa" },
	{ id: "stone-vase", name: "Sunday Stoneware", category: "Objects", detail: "Hand-thrown ceramic · Chalk", price: 64, tag: "One of a kind", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80", alt: "Handmade ceramic vase with a simple silhouette" },
	{ id: "linen-light", name: "Soft Light Pendant", category: "Lighting", detail: "Natural linen · Warm white", price: 245, tag: "Customer favorite", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80", alt: "Soft pendant lighting in a considered interior" }
];

const productGrid = document.querySelector("#product-grid");
const categoryButtons = [...document.querySelectorAll(".category-button")];
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#sort-products");
const emptyState = document.querySelector(".empty-state");
const cartDrawer = document.querySelector(".cart-drawer");
const cartItems = document.querySelector(".cart-items");
const cartBackdrop = document.querySelector(".drawer-backdrop");
const toast = document.querySelector(".toast");
const cart = new Map();
let selectedCategory = "All";
let toastTimer;

const formatPrice = (price) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

function getVisibleProducts() {
	const query = searchInput.value.trim().toLowerCase();
	const visible = products.filter((product) => {
		const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
		const matchesSearch = `${product.name} ${product.category} ${product.detail}`.toLowerCase().includes(query);
		return matchesCategory && matchesSearch;
	});

	if (sortSelect.value === "low") visible.sort((a, b) => a.price - b.price);
	if (sortSelect.value === "high") visible.sort((a, b) => b.price - a.price);
	if (sortSelect.value === "name") visible.sort((a, b) => a.name.localeCompare(b.name));
	return visible;
}

function renderProducts() {
	const visible = getVisibleProducts();
	productGrid.innerHTML = visible.map((product, index) => `
		<article class="product-card" style="animation-delay:${index * 55}ms">
			<div class="product-image-wrap">
				<img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy">
				<span class="product-tag">${product.tag}</span>
				<button class="quick-add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">Add to bag <span aria-hidden="true">+</span></button>
			</div>
			<div class="product-meta"><h3 class="product-name">${product.name}</h3><span class="product-price">${formatPrice(product.price)}</span></div>
			<p class="product-detail">${product.detail}</p>
		</article>`).join("");
	emptyState.hidden = visible.length > 0;
	productGrid.hidden = visible.length === 0;
}

function renderCart() {
	const entries = [...cart.entries()];
	const quantity = entries.reduce((total, [, count]) => total + count, 0);
	const subtotal = entries.reduce((total, [id, count]) => total + products.find((product) => product.id === id).price * count, 0);

	document.querySelector(".cart-count").textContent = quantity;
	document.querySelector(".drawer-count").textContent = `(${quantity})`;
	document.querySelector(".cart-empty").hidden = quantity > 0;
	document.querySelector(".cart-footer").hidden = quantity === 0;
	document.querySelector(".cart-subtotal").textContent = formatPrice(subtotal);
	cartItems.innerHTML = entries.map(([id, count]) => {
		const product = products.find((item) => item.id === id);
		return `<article class="cart-line">
			<img src="${product.image}" alt="" loading="lazy">
			<div class="cart-line-info"><strong>${product.name}</strong><span>${formatPrice(product.price)}</span>
				<div class="quantity-control" aria-label="Quantity for ${product.name}">
					<button type="button" data-quantity="${id}" data-change="-1" aria-label="Remove one ${product.name}">−</button><span>${count}</span>
					<button type="button" data-quantity="${id}" data-change="1" aria-label="Add one ${product.name}">+</button>
				</div>
			</div><span class="cart-line-price">${formatPrice(product.price * count)}</span>
		</article>`;
	}).join("");
}

function showToast(message) {
	toast.textContent = message;
	toast.classList.add("is-visible");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2300);
}

function openCart() {
	cartDrawer.inert = false;
	cartDrawer.setAttribute("aria-hidden", "false");
	cartBackdrop.hidden = false;
	requestAnimationFrame(() => cartDrawer.classList.add("is-open"));
	document.body.style.overflow = "hidden";
	cartDrawer.querySelector(".close-cart").focus();
}

function closeCart() {
	cartDrawer.classList.remove("is-open");
	cartDrawer.setAttribute("aria-hidden", "true");
	cartDrawer.inert = true;
	cartBackdrop.hidden = true;
	document.body.style.overflow = "";
	document.querySelector(".cart-trigger").focus();
}

function selectCategory(category) {
	selectedCategory = category;
	categoryButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.category === category));
	renderProducts();
}

productGrid.addEventListener("click", (event) => {
	const button = event.target.closest("[data-add]");
	if (!button) return;
	const product = products.find((item) => item.id === button.dataset.add);
	cart.set(product.id, (cart.get(product.id) || 0) + 1);
	renderCart();
	showToast(`${product.name} added to your bag`);
});

cartItems.addEventListener("click", (event) => {
	const button = event.target.closest("[data-quantity]");
	if (!button) return;
	const id = button.dataset.quantity;
	const nextQuantity = (cart.get(id) || 0) + Number(button.dataset.change);
	if (nextQuantity < 1) cart.delete(id);
	else cart.set(id, nextQuantity);
	renderCart();
});

categoryButtons.forEach((button) => button.addEventListener("click", () => selectCategory(button.dataset.category)));
document.querySelectorAll("[data-nav-category]").forEach((link) => link.addEventListener("click", () => selectCategory(link.dataset.navCategory)));
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
document.querySelector(".search-toggle").addEventListener("click", () => {
	searchForm.hidden = false;
	searchInput.focus();
	document.querySelector("#shop").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector(".search-close").addEventListener("click", () => {
	searchForm.hidden = true;
	searchInput.value = "";
	renderProducts();
	document.querySelector(".search-toggle").focus();
});
document.querySelector(".cart-trigger").addEventListener("click", openCart);
document.querySelector(".close-cart").addEventListener("click", closeCart);
document.querySelector(".continue-shopping").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
});
document.querySelector(".checkout-button").addEventListener("click", () => showToast("Checkout is ready for your store setup."));
document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
	event.preventDefault();
	document.querySelector(".newsletter-message").textContent = "You're on the list. Talk soon.";
	event.currentTarget.reset();
});

renderProducts();
renderCart();
