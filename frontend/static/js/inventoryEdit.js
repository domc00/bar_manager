document.addEventListener('DOMContentLoaded', function () {
    inventoryGrid = document.getElementById('inventoryGrid');
    inventoryModal = new bootstrap.Modal(document.getElementById('inventoryModal'));
    incrementBtn = document.getElementById('incrementBtn');
    decrementBtn = document.getElementById('decrementBtn');
    drinkQuantity = document.getElementById('drinkQuantity');
    productImage = document.getElementById('product-image');
    sortDropdown = document.getElementById('inventorySortDropdown');
    saveChangesButton = document.getElementById('saveChangesButton');

    incrementBtn.addEventListener('click', function() {
        const currentValue = parseInt(drinkQuantity.value);
        drinkQuantity.value = currentValue + 1;
    });

    decrementBtn.addEventListener('click', function() {
        const currentValue = parseInt(drinkQuantity.value);
        if (currentValue > 0) {
            drinkQuantity.value = currentValue - 1;
        }
    });

    // Sortiranje podataka
        function sortInventory(){
            const sortOption = sortDropdown.value;
            const products = Array.from(document.getElementsByClassName('product-item'));

            // Logika sortiranja
            products.sort((a, b) => {
                    const nameA = a.querySelector('.product-name').textContent.trim().toLowerCase();
                    const nameB = b.querySelector('.product-name').textContent.trim().toLowerCase();
                    const quantityA = parseInt(a.querySelector('.product-quantity').textContent.match(/\d+/));
                    const quantityB = parseInt(b.querySelector('.product-quantity').textContent.match(/\d+/));

                    switch (sortOption) {
                        case 'alphabetical-asc':
                            return nameA.localeCompare(nameB);
                        case 'alphabetical-desc':
                            return nameB.localeCompare(nameA);
                        case 'quantity-asc':
                            return quantityA - quantityB;
                        case 'quantity-desc':
                            return quantityB - quantityA;
                    }
            });

            // Ponovno iscrtavanje containera sa sortiranim proizvodima
            const container = document.getElementById('inventoryGrid');
            container.innerHTML = '';
            products.forEach(product => container.appendChild(product));
        }

        sortDropdown.addEventListener('change', sortInventory);
        window.addEventListener('DOMContentLoaded', sortInventory);

    // Klikni na proizvod za uređivanje
        inventoryGrid.addEventListener('click', function (e) {
            const productItem = e.target.closest('.clickable-product');
            if (!productItem) return;

            const productId = productItem.getAttribute('data-product-id');

            // Dohvati podatke iz backenda
            fetch(`/get_product/${productId}`)
                .then(response => response.json())
                .then(product => {
                    inventoryModalTitle.innerText = `${product.name}`;

                    // Popuni modal podacima
                    drinkQuantity.value = product.quantity;
                    productImage.querySelector('img').src = product.image_url;

                    // Spremi id za dalju upotrebu
                    saveChangesButton.setAttribute('data-product-id', productId);

                    inventoryModal.show();
            });
        });

        // Osiguraj da količina nije negativna
        document.getElementById('drinkQuantity').addEventListener('input', function () {
            if (this.value < 0) {
                this.value = 0;
            }
        });

        saveChangesButton.addEventListener('click', function () {
            const id = saveChangesButton.getAttribute('data-product-id');
            const quantity = document.getElementById('drinkQuantity').value;

            // Pozovi Flask API
            fetch(`/update_inventory`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    quantity: quantity
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                  location.reload(); // Osvježi stranicu za prikaz promjena
              }
            })
            .catch(error => console.error('Error updating inventory:', error));
        });
});