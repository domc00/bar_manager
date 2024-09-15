let productIdToDelete = null;

// Validacija podataka iz forme
function validateProductForm() {
    const name = document.getElementById('productName').value;
    const costPrice = document.getElementById('costPrice').value;
    const sellingPrice = document.getElementById('sellingPrice').value;

    if (name.trim() === '') {
        alert('Polje "Naziv proizvoda" ne može biti prazno');
        return false;
    }

    if (costPrice <= 0) {
        alert('Nabavna cijena mora biti veća od 0');
        return false;
    }

    if (sellingPrice <= 0) {
        alert('Prodajna cijena mora biti veća od 0');
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const addProductButton = document.getElementById('addNewProductButton');
    const productModalTitle = document.getElementById('productModalTitle');
    const productImagePlaceholder = document.getElementById('productImagePlaceholder');
    const productForm = document.getElementById('productForm');
    const addEditModal = new bootstrap.Modal(document.getElementById('addEditProductModal'));
    const addProductBtn = document.getElementById('addProductButton');
    const saveProductButton = document.getElementById('saveProductButton');
    const deleteProductBtn = document.getElementById('deleteProductButton');
    const deleteAlert = document.getElementById('deleteConfirmationBox');
    const productGrid = document.getElementById('productsGrid');
    const sortDropdown = document.getElementById('productsSortDropdown');

    // Osiguraj da količina nije negativna pri unosu cijene

        document.getElementById('costPrice').addEventListener('input', function () {
            if (this.value < 0) {
                this.value = 0;
            }
        });

        document.getElementById('sellingPrice').addEventListener('input', function () {
            if (this.value < 0) {
                this.value = 0;
            }
        });

    // Otvori modal za dodavanje novog proizvoda
    addProductButton.addEventListener('click', function () {
        productModalTitle.innerText = 'Dodaj novi proizvod';

        // Isprazni potencijalno postojeće podatke iz forme
        productForm.reset();
        deleteAlert.classList.add('d-none');
        productImagePlaceholder.querySelector('img').src = 'https://via.placeholder.com/200x200';

        // Prikaži "Dodaj proizvod" dugme
        addProductBtn.classList.remove('d-none');
        saveProductButton.classList.add('d-none');
        deleteProductBtn.classList.add('d-none');

        addEditModal.show();
    });

    // Klikni na proizvod za preuređivanje
    productGrid.addEventListener('click', function (e) {
        const productItem = e.target.closest('.clickable-product');
        if (!productItem) return;

        const productId = productItem.getAttribute('data-product-id');

        // Dohvati podatke iz backenda
        fetch(`/get_product/${productId}`)
            .then(response => response.json())
            .then(product => {
                productModalTitle.innerText = `Ažuriraj proizvod: ${product.name}`;

                // Popuni modal sa podacima
                document.getElementById('productName').value = product.name;
                document.getElementById('costPrice').value = product.cost_price;
                document.getElementById('sellingPrice').value = product.selling_price;
                document.getElementById('productImageURL').value = product.image_url;
                document.getElementById('uploadProductImage').value = '';
                productImagePlaceholder.querySelector('img').src = product.image_url;

                // Prikaži "Spremi promjene" i "Izbriši proizvod" dugmad
                addProductBtn.classList.add('d-none');
                saveProductButton.classList.remove('d-none');
                deleteProductBtn.classList.remove('d-none');

                // Spremi id proizvoda za dalju upotrebu
                saveProductButton.setAttribute('data-product-id', product.id);
                deleteProductBtn.setAttribute('data-product-id', product.id);

                // Sakrij prozor za potvrdu brisanja proizvoda ako je otvoren
                deleteAlert.classList.add('d-none');

                addEditModal.show();
            });
    });

    // Spremi novi proizvod u bazu
    addProductBtn.addEventListener('click', function () {
        const formData = new FormData(productForm);

        if (!validateProductForm()) {
            event.preventDefault();
        }

        fetch('/add_product', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
          .then(data => {
              if (data.error){
                alert(data.error);
              }
              if (data.success) {
                  location.reload(); // Osvježi stranicu za prikaz promjena
              }
          });
    });

    // Spremi promjene za postojeći proizvod
    saveProductButton.addEventListener('click', function () {
        const productId = saveProductButton.getAttribute('data-product-id');
        const formData = new FormData(productForm);

        fetch(`/update_product/${productId}`, {
            method: 'PATCH',
            body: formData
        }).then(response => response.json())
          .then(data => {
              if (data.error){
                  alert(data.error);
              }
              if (data.success) {
                  location.reload(); // Osvježi stranicu za prikaz promjena
              }
          });
    });

    // Prikaži prozorčić za potvrdu brisanja proizvoda
    deleteProductBtn.addEventListener('click', function() {
        const productName = document.getElementById('productName').value;
        productIdToDelete = deleteProductBtn.getAttribute('data-product-id');

        document.getElementById('deleteProductName').textContent = productName;

        deleteAlert.classList.add('show');
        deleteAlert.classList.remove('d-none');
    });

    // Odustani od brisanja
    document.getElementById('cancelDelete').addEventListener('click', function() {
        // Sakrij prozor za potvrdu
        deleteAlert.classList.remove('show');
        confirmDelete.classList.add('disabled');
        setTimeout(function(){
            deleteAlert.classList.add('d-none');
            confirmDelete.classList.remove('disabled');
        }, 200);
    });

    // Potvrdi brisanje iz baze
    document.getElementById('confirmDelete').addEventListener('click', function() {
        fetch(`/delete_product/${productIdToDelete}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();  // Osvježi stranicu
            } else {
                alert('Failed to delete the product.');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    document.getElementById('uploadProductImage').addEventListener('change', function (event) {
        const reader = new FileReader();
        reader.onload = function () {
            document.getElementById('productImage').src = reader.result;
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    // Sortiranje podataka
    function sortProducts(){
        const sortOption = sortDropdown.value;
        const products = Array.from(document.getElementsByClassName('product-item'));

        // Logika sortiranja
        products.sort((a, b) => {
            const nameA = a.querySelector('.product-name').textContent.trim().toLowerCase();
            const nameB = b.querySelector('.product-name').textContent.trim().toLowerCase();
            const costA = parseFloat(a.querySelector('.product-cost').textContent.match(/\d+\.\d+/));
            const costB = parseFloat(b.querySelector('.product-cost').textContent.match(/\d+\.\d+/));
            const sellA = parseFloat(a.querySelector('.product-sell').textContent.match(/\d+\.\d+/));
            const sellB = parseFloat(b.querySelector('.product-sell').textContent.match(/\d+\.\d+/));

            switch (sortOption) {
                case 'alphabetical-asc':
                    return nameA.localeCompare(nameB);
                case 'alphabetical-desc':
                    return nameB.localeCompare(nameA);
                case 'cost-asc':
                    return costA - costB;
                case 'cost-desc':
                    return costB - costA;
                case 'sell-asc':
                    return sellA - sellB;
                case 'sell-desc':
                    return sellB - sellA;
            }
        });

        // Prikaži sortirane proizvode
        const container = document.getElementById('productsGrid');
        container.innerHTML = '';
        products.forEach(product => container.appendChild(product));
    }

    sortDropdown.addEventListener('change', sortProducts);
    window.addEventListener('DOMContentLoaded', sortProducts);
});
