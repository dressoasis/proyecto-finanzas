// 📌 Endpoints for categories and movements
const endpointCategories = "http://localhost:3000/categories";
const endpointMovements = "http://localhost:3000/movimientos";

// 📌 DOM elements
const btnLogout = document.getElementById("logout-btn");
const formMovements = document.getElementById("form-movimiento");
const tbodyMovements = document.getElementById("tbody-movimientos");
const selectCategories = formMovements.categoria;

btnLogout.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
});

let editingMovement = null;
let currentOrder = "";

// 📌 Load data when page loads
document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    fillCategoryFilter();
    renderMovements();
});

// 📌 Handle form submit (create or edit movement)
formMovements.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newMovement = {
        tipo: formMovements.tipo.value,
        descripcion: formMovements.descripcion.value,
        importe: formMovements.importe.value,
        fecha: formMovements.fecha.value,
        categoryId: formMovements.categoria.value
    };

    try {
        if (editingMovement) {
            // Editing existing movement
            await fetch(`${endpointMovements}/${editingMovement}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMovement)
            });
        } else {
            // Creating new movement
            await fetch(endpointMovements, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMovement)
            });
        }

        editingMovement = null;
        formMovements.reset();
        renderMovements();

    } catch (err) {
        console.error("Error saving movement", err);
    }
});

// 📌 Handle Edit/Delete buttons
tbodyMovements.addEventListener("click", async (event) => {
    const target = event.target;

    if (target.classList.contains("btn-editar")) {
        // Load values into form
        editingMovement = target.dataset.id;
        formMovements.tipo.value = target.dataset.tipo;
        formMovements.descripcion.value = target.dataset.descripcion;
        formMovements.importe.value = target.dataset.importe;
        formMovements.fecha.value = target.dataset.fecha;
        formMovements.categoria.value = target.dataset.category;

    } else if (target.classList.contains("btn-eliminar")) {
        // Confirm and delete
        const id = target.dataset.id;
        if (confirm("Are you sure you want to delete this movement?")) {
            try {
                await fetch(`${endpointMovements}/${id}`, { method: "DELETE" });
                renderMovements();
            } catch (err) {
                console.error("Error deleting movement", err);
            }
        }
    }
});

// 📌 Load category options into form
async function renderCategories() {
    selectCategories.innerHTML = "";

    const response = await fetch(endpointCategories);
    const categories = await response.json();

    if (categories.length === 0) {
        selectCategories.innerHTML = `
            <option disabled>No categories. Please register at least one.</option>
        `;
    }

    categories.forEach(cat => {
        selectCategories.innerHTML += `
            <option value="${cat.id}">${cat.nombre}</option>
        `;
    });
}

// 📌 Render all movements
async function renderMovements() {
    const movements = await fetchMovements();
    tbodyMovements.innerHTML = "";

    movements.forEach(mov => {
        tbodyMovements.innerHTML += `
            <tr>
                <td>${mov.tipo}</td>
                <td>${mov.descripcion}</td>
                <td>${mov.importe}</td>
                <td>${mov.fecha}</td>
                <td>${mov.category.nombre}</td>
                <td>
                    <button class="btn-editar"
                        data-id="${mov.id}"
                        data-tipo="${mov.tipo}"
                        data-descripcion="${mov.descripcion}"
                        data-importe="${mov.importe}"
                        data-fecha="${mov.fecha}"
                        data-category="${mov.categoryId}"
                    >Edit</button>
                    <button class="btn-eliminar" data-id="${mov.id}">Delete</button>
                </td>
            </tr>
        `;
    });
}

// 📌 Get movements with category joined
async function fetchMovements() {
    const res = await fetch(`${endpointMovements}?_embed=category`);
    return await res.json();
}

// ========== FILTERS ========== //

const filtroTipo = document.getElementById("filtro-tipo");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroFechaInicio = document.getElementById("filtro-fecha-inicio");
const filtroFechaFin = document.getElementById("filtro-fecha-fin");
const btnClearFilters = document.getElementById("btn-limpiar-filtros");
const btnOrderAZ = document.getElementById("orden-az");
const btnOrderZA = document.getElementById("orden-za");

// 📌 Fill filter categories
async function fillCategoryFilter() {
    const response = await fetch(endpointCategories);
    const categories = await response.json();

    filtroCategoria.innerHTML = '<option value="">Category</option>';
    categories.forEach(cat => {
        filtroCategoria.innerHTML += `
            <option value="${cat.id}">${cat.nombre}</option>
        `;
    });
}

// 📌 Clear filters
btnClearFilters.addEventListener("click", () => {
    filtroTipo.value = "";
    filtroCategoria.value = "";
    filtroFechaInicio.value = "";
    filtroFechaFin.value = "";
    currentOrder = "";
    renderMovements();
});

// 📌 Apply filters on change
[filtroTipo, filtroCategoria, filtroFechaInicio, filtroFechaFin].forEach(filter => {
    filter.addEventListener("change", applyFilters);
});

// 📌 Apply selected filters and sort
async function applyFilters() {
    let movements = await fetchMovements();

    const tipo = filtroTipo.value;
    const categoria = filtroCategoria.value;
    const fechaInicio = filtroFechaInicio.value;
    const fechaFin = filtroFechaFin.value;

    if (tipo) {
        movements = movements.filter(m => m.tipo === tipo);
    }

    if (categoria) {
        movements = movements.filter(m => String(m.category.id) === String(categoria));
    }

    if (fechaInicio) {
        movements = movements.filter(m => new Date(m.fecha) >= new Date(fechaInicio));
    }

    if (fechaFin) {
        movements = movements.filter(m => new Date(m.fecha) <= new Date(fechaFin));
    }

    if (currentOrder === "az") {
        movements.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
    }

    if (currentOrder === "za") {
        movements.sort((a, b) => b.descripcion.localeCompare(a.descripcion));
    }

    tbodyMovements.innerHTML = "";
    movements.forEach(mov => {
        tbodyMovements.innerHTML += `
            <tr>
                <td>${mov.tipo}</td>
                <td>${mov.descripcion}</td>
                <td>${mov.importe}</td>
                <td>${mov.fecha}</td>
                <td>${mov.category.nombre}</td>
                <td>
                    <button class="btn-editar"
                        data-id="${mov.id}"
                        data-tipo="${mov.tipo}"
                        data-descripcion="${mov.descripcion}"
                        data-importe="${mov.importe}"
                        data-fecha="${mov.fecha}"
                        data-category="${mov.categoryId}"
                    >Edit</button>
                    <button class="btn-eliminar" data-id="${mov.id}">Delete</button>
                </td>
            </tr>
        `;
    });
}

// 📌 Sort alphabetically A-Z
btnOrderAZ.addEventListener("click", () => {
    currentOrder = "az";
    applyFilters();
});

// 📌 Sort alphabetically Z-A
btnOrderZA.addEventListener("click", () => {
    currentOrder = "za";
    applyFilters();
});
