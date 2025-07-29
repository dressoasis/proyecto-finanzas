const endpointCategories = "http://localhost:3000/categories";
const endpointMovements = "http://localhost:3000/movimientos";

const btnLogout = document.getElementById("logout-btn");
const form = document.getElementById("form-categoria");
const inputName = document.getElementById("nombre-categoria");
const categoriesList = document.getElementById("lista-categorias");

btnLogout.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
});

let editingCategory = null;

// Load categories when the page is ready
document.addEventListener('DOMContentLoaded', loadCategories);

async function loadCategories() {
    categoriesList.innerHTML = '';
    try {
        const res = await fetch(endpointCategories);
        const categories = await res.json();

        categories.forEach(category => {
            const li = document.createElement('li');
            li.innerHTML = `
        <span>${category.nombre}</span>
        <div>
          <button class="btn-edit" data-id="${category.id}" data-nombre="${category.nombre}">Edit</button>
          <button class="btn-eliminar" data-id="${category.id}">Delete</button>
        </div>
      `;
            categoriesList.appendChild(li);
        });
    } catch (err) {
        console.log('Error loading categories:', err);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = inputName.value.trim();
    if (!name) return alert('Name cannot be empty');

    try {
        if (editingCategory) {
            await fetch(`${endpointCategories}/${editingCategory}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: name })
            });
            editingCategory = null;
        } else {
            await fetch(endpointCategories, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: name })
            });
        }

        form.reset();
        loadCategories();
    } catch (err) {
        console.error('Error saving category:', err);
    }
});

categoriesList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-edit')) {
        const id = event.target.dataset.id;
        const name = event.target.dataset.nombre;
        inputName.value = name;
        editingCategory = id;
    }

    if (event.target.classList.contains('btn-eliminar')) {
        const id = event.target.dataset.id;
        if (confirm('Are you sure you want to delete this category?')) {
            try {
                const res = await fetch(endpointMovements);
                const movements = await res.json();

                const related = movements.filter(m => m.categoryId === id);

                await Promise.all(related.map(m =>
                    fetch(`${endpointMovements}/${m.id}`, { method: 'DELETE' })
                ));

                await fetch(`${endpointCategories}/${id}`, { method: 'DELETE' });

                loadCategories();
            } catch (err) {
                console.error('Error deleting category or associated movements:', err);
            }
        }
    }
});
