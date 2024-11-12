// Elementos principales
const carrito = document.getElementById('carrito');
const elementos1 = document.getElementById('lista-1');
const lista = document.querySelector('#lista-carrito tbody');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');

// Cargar los eventos
cargarEventListeners();

function cargarEventListeners() {
    elementos1.addEventListener('click', comprarElemento);
    lista.addEventListener('click', eliminarElemento); // Permite eliminar productos del carrito
    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    cargarCarritoDesdeLocalStorage(); // Carga el carrito al iniciar
    actualizarEstadoBotonCompra(); // Actualiza el estado del botón de compra al iniciar
    actualizarContadorCarrito(); // Actualiza el contador del carrito al iniciar
}

// Función para agregar elementos al carrito
function comprarElemento(e) {
    e.preventDefault();
    if (e.target.classList.contains('agregar-carrito')) {
        const elemento = e.target.parentElement.parentElement;
        leerDatosElemento(elemento);
        guardarCarritoEnLocalStorage(); 
        actualizarEstadoBotonCompra(); // Actualiza el estado después de agregar
        actualizarContadorCarrito(); // Actualiza el contador después de agregar


        // Agregar animación de retroalimentación
        e.target.textContent = 'Agregado ✓';
        setTimeout(() => {
            e.target.textContent = 'Agregar al carrito';
        }, 1000); // Cambia el texto de nuevo después de 1 segundo
    }
}

function leerDatosElemento(elemento) {
    const infoElemento = {
        imagen: elemento.querySelector('img').src,
        titulo: elemento.querySelector('h3').textContent,
        precio: elemento.querySelector('.precio').textContent,
        id: elemento.querySelector('a').getAttribute('data-id'),
    };

    // Verificar si el producto ya está en el carrito
    const productosEnCarrito = [...lista.querySelectorAll('tr')];
    const productoExistente = productosEnCarrito.find(producto => producto.querySelector('a').getAttribute('data-id') === infoElemento.id);

    if (productoExistente) {
        // Incrementar cantidad del producto existente
        const cantidadActual = parseInt(productoExistente.querySelector('td:nth-child(4)').textContent) || 0;
        productoExistente.querySelector('td:nth-child(4)').textContent = cantidadActual + 1; // Actualizar cantidad
        const precioProducto = parseFloat(infoElemento.precio.replace('$', ''));
        productoExistente.querySelector('td:nth-child(5)').textContent = `$${(precioProducto * (cantidadActual + 1)).toFixed(2)}`; // Actualizar total
    } else {
        // Insertar nuevo producto en el carrito
        insertarCarrito(infoElemento);
    }

    calcularTotal(); // Actualiza el total después de agregar un producto
    guardarCarritoEnLocalStorage(); // Guarda el carrito actualizado
}

function insertarCarrito(elemento) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><img src="${elemento.imagen}" width=100></td>
        <td>${elemento.titulo}</td>
        <td>${elemento.precio}</td>
        <td>1</td> <!-- Inicialmente la cantidad es 1 -->
        <td>${elemento.precio}</td> <!-- Total del producto -->
        <td><a href="#" class="eliminar" data-id="${elemento.id}">X</a></td> <!-- Botón de eliminar -->
    `;
    lista.appendChild(row);
}

function eliminarElemento(e) {
    e.preventDefault();
    if (e.target.classList.contains('eliminar')) {
        // Elimina la fila del carrito
        e.target.parentElement.parentElement.remove();
        calcularTotal(); // Actualiza el total después de eliminar
        guardarCarritoEnLocalStorage(); // Guarda el carrito actualizado
        actualizarEstadoBotonCompra(); // Actualiza el estado después de eliminar
        actualizarContadorCarrito(); // Actualiza el contador después de eliminar
    }
}

function vaciarCarrito() {
    while (lista.firstChild) {
        lista.removeChild(lista.firstChild);
    }
    calcularTotal(); // Actualiza el total al vaciar el carrito
    guardarCarritoEnLocalStorage(); // Guarda el carrito vacío en localStorage
    actualizarEstadoBotonCompra(); // Actualiza el estado al vaciar el carrito
    actualizarContadorCarrito(); // Actualiza el contador al vaciar el carrito
}

// Calcular el total del carrito
function calcularTotal() {
    let total = 0;
    const filas = lista.querySelectorAll('tr');
    filas.forEach(fila => {
        const precio = parseFloat(fila.querySelector('td:nth-child(3)').textContent.replace('$', ''));
        const cantidad = parseInt(fila.querySelector('td:nth-child(4)').textContent);
        total += precio * cantidad; // Sumar al total
    });
    document.getElementById('total-carrito').textContent = `Total: $${total.toFixed(2)}`; // Actualiza el total
}

// Guardar el carrito en localStorage
function guardarCarritoEnLocalStorage() {
    const productos = [];
    lista.querySelectorAll('tr').forEach(fila => {
        const producto = {
            id: fila.querySelector('a.eliminar').getAttribute('data-id'),
            imagen: fila.querySelector('img').src,
            titulo: fila.querySelector('td:nth-child(2)').textContent,
            precio: fila.querySelector('td:nth-child(3)').textContent,
            cantidad: parseInt(fila.querySelector('td:nth-child(4)').textContent)
        };
        productos.push(producto);
    });
    localStorage.setItem('carrito', JSON.stringify(productos));
}

// Cargar el carrito desde localStorage al iniciar
function cargarCarritoDesdeLocalStorage() {
    const productos = JSON.parse(localStorage.getItem('carrito')) || [];
    productos.forEach(producto => insertarCarrito(producto));
    calcularTotal(); // Asegura que el total se actualice al cargar
}

// Función para habilitar o deshabilitar el botón "Finalizar Compra" según el estado del carrito
function actualizarEstadoBotonCompra() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (lista.children.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
    }
}

// Función para actualizar el contador de productos en el icono del carrito
function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    let totalCantidad = 0;
    lista.querySelectorAll('tr').forEach(fila => {
        totalCantidad += parseInt(fila.querySelector('td:nth-child(4)').textContent);
    });
    contador.textContent = totalCantidad;
}

// Mostrar el formulario de pago al hacer clic en "Finalizar Compra"
document.getElementById('checkout-btn').addEventListener('click', function() {
    document.getElementById('formulario-pago').style.display = 'flex';
});

// Evento para cerrar el formulario al hacer clic en "Cancelar"
document.getElementById('cerrar-formulario').addEventListener('click', function() {
    document.getElementById('formulario-pago').style.display = 'none';
});

// Evento para el botón "Pagar Ahora" que muestra la alerta de éxito y cierra el formulario
document.getElementById('pago-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío real del formulario

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const tarjeta = document.getElementById('tarjeta').value.trim();
    const expiracion = document.getElementById('expiracion').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    // Validaciones
    if (nombre === "") {
        alert("Por favor, ingrese el nombre en la tarjeta.");
        return;
    }

    if (!/^\d{16}$/.test(tarjeta)) {
        alert("El número de tarjeta debe tener 16 dígitos.");
        return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiracion)) {
        alert("La fecha de expiración debe estar en formato MM/AA.");
        return;
    }

    if (!/^\d{3}$/.test(cvv)) {
        alert("El CVV debe tener 3 dígitos.");
        return;
    }

    // Simula el procesamiento del pago
    setTimeout(() => {
        alert('Pago realizado con éxito. ¡Gracias por tu compra!');
        document.getElementById('formulario-pago').style.display = 'none'; // Oculta el formulario

        // Llama a la función para vaciar el carrito después del pago
        vaciarCarrito();
    }, 1000); // Simula un retraso de 1 segundo
});

document.getElementById('fecha-expiracion').addEventListener('input', function () {
    if (this.value.length === 5) { // Validar solo si tiene 5 caracteres (MM/YY)
        const today = new Date();
        const [month, year] = this.value.split('/').map(num => parseInt(num, 10));

        // Validar que el mes esté entre 1 y 12
        if (month < 1 || month > 12) {
            alert('Por favor, ingrese un mes válido (01-12).');
            this.value = ''; // Limpia el campo para que el usuario ingrese de nuevo
            return;
        }

        const currentYear = today.getFullYear() % 100; // Últimos dos dígitos del año actual
        const currentMonth = today.getMonth() + 1; // Mes actual

        // Verificar que la fecha no esté en el pasado
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            alert('La fecha de expiración no puede ser en el pasado.');
            this.value = ''; // Limpia el campo para que el usuario ingrese de nuevo
        }
    }
});

document.getElementById('pagar-ahora').addEventListener('click', function(event) {
    // Comprobamos si todos los campos están completos y válidos
    const nombreTarjeta = document.getElementById('nombre-tarjeta').value;
    const numeroTarjeta = document.getElementById('numero-tarjeta').value;
    const fechaExpiracion = document.getElementById('fecha-expiracion').value;
    const cvv = document.getElementById('cvv').value;

    if (!nombreTarjeta || !numeroTarjeta || !fechaExpiracion || !cvv) {
        alert('Por favor, complete todos los campos del formulario.');
        event.preventDefault(); // Evita la compra si los campos no están completos
        return;
    }

    // Mostrar mensaje de éxito si todo está completo y correcto
    alert('Su compra ha sido exitosa.');

    // Vaciar el carrito
    vaciarCarrito();

    // Redirigir a la página principal después de la confirmación
    window.location.href = 'index.html'; // Cambia "index.html" a la URL de tu página principal
});

function vaciarCarrito() {
    // Limpiar el carrito en el localStorage
    localStorage.removeItem('carrito');
    
    // Aquí actualiza la interfaz visual del carrito (si es necesario)
    const carritoContenedor = document.getElementById('lista-carrito'); // Asegúrate de que este sea el id correcto de tu carrito
    if (carritoContenedor) {
        carritoContenedor.innerHTML = ''; // Vacía el contenido del carrito en la interfaz
    }

    // Actualizar el contador del carrito si tienes uno
    const contadorCarrito = document.getElementById('contador-carrito'); // Asegúrate de que este sea el id correcto de tu contador
    if (contadorCarrito) {
        contadorCarrito.innerText = '0';
    }
}




