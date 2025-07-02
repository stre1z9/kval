document.addEventListener('DOMContentLoaded', function() {

    const gallery = document.getElementById('gallery');
    const filterForm = document.getElementById('filter-form');
    const categorySelect = document.getElementById('category');
    const searchInput = document.getElementById('search');
    const totalCountSpan = document.getElementById('total-count');
    const avgRatingSpan = document.getElementById('avg-rating');
    const sortAscBtn = document.getElementById('sort-asc');
    const sortDescBtn = document.getElementById('sort-desc');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    
    let images = [];
    let filteredImages = [];
    let categories = new Set();
    let currentSort = null;

    async function loadImages() {
        try {
            const response = await fetch('images.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить данные');
            }
            images = await response.json();

            images.forEach(image => {
                categories.add(image.category);
            });

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });

            applyFilters();
        } catch (error) {
            showError(error.message);
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.filters'));
    }

    function applyFilters() {
        const category = categorySelect.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        filteredImages = images.filter(image => {
            const matchesCategory = !category || image.category === category;
            const matchesSearch = !searchTerm || 
                image.title.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        if (currentSort) {
            sortImages(currentSort);
        } else {
            updateGallery();
        }
    }

    function sortImages(order) {
        currentSort = order;
        
        filteredImages.sort((a, b) => {
            return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        });
        
        updateGallery();
    }

    function updateGallery() {
        gallery.innerHTML = '';
        
        if (filteredImages.length === 0) {
            gallery.innerHTML = '<p>Изображения не найдены</p>';
        } else {
            filteredImages.forEach(image => {
                const card = createImageCard(image);
                gallery.appendChild(card);
            });
        }
        
        updateStats();
    }

    function createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        const img = document.createElement('img');
        img.className = 'image-preview';
        img.src = image.url;
        img.alt = image.title;
        img.loading = 'lazy';
        
        const info = document.createElement('div');
        info.className = 'image-info';
        
        const title = document.createElement('div');
        title.className = 'image-title';
        title.textContent = image.title;
        
        const rating = document.createElement('div');
        rating.className = 'image-rating';
        rating.textContent = formatRating(image.rating);
        
        info.appendChild(title);
        info.appendChild(rating);
        
        card.appendChild(img);
        card.appendChild(info);

        card.addEventListener('click', () => openModal(image));
        
        return card;
    }

    function formatRating(rating) {
        return '★' + rating.toFixed(1);
    }

    function updateStats() {
        totalCountSpan.textContent = filteredImages.length;
        
        if (filteredImages.length > 0) {
            const sum = filteredImages.reduce((acc, image) => acc + image.rating, 0);
            const avg = sum / filteredImages.length;
            avgRatingSpan.textContent = avg.toFixed(1);
        } else {
            avgRatingSpan.textContent = '0';
        }
    }

    function openModal(image) {
        document.getElementById('modal-title').textContent = image.title;
        document.getElementById('modal-image').src = image.url;
        document.getElementById('modal-image').alt = image.title;
        document.getElementById('modal-rating').textContent = formatRating(image.rating);
        document.getElementById('modal-category').textContent = image.category;
        document.getElementById('modal-url').href = image.url;
        document.getElementById('modal-url').textContent = image.url;
        
        modal.style.display = 'block';
    }

    function closeModalHandler() {
        modal.style.display = 'none';
    }

    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });

    searchInput.addEventListener('input', function() {
        applyFilters();
    });
    
    sortAscBtn.addEventListener('click', function() {
        sortImages('asc');
    });
    
    sortDescBtn.addEventListener('click', function() {
        sortImages('desc');
    });
    
    closeModal.addEventListener('click', closeModalHandler);
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalHandler();
        }
    });

    loadImages();
});