// =================================================================
// # LÓGICA PRINCIPAL DE LA APLICACIÓN
// =================================================================

async function iniciarAplicacion() {
  // 1. Cargar los datos desde el archivo JSON de forma asíncrona
  try {
    const respuesta = await fetch("assets/data/datos.json");
    if (!respuesta.ok) {
      throw new Error(`HTTP error! status: ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    const catalogoCategorias = datos.categorias;
    const catalogoProductos = datos.productos;

    // Una vez cargados los datos, ejecutamos toda la lógica del sitio
    ejecutarLogicaDelSitio(catalogoCategorias, catalogoProductos);
  } catch (error) {
    console.error("Error al cargar los datos de la tienda:", error);
    document.body.innerHTML =
      '<p class="text-center text-red-500 font-bold mt-10">No se pudo cargar la información de la tienda. Por favor, intente más tarde.</p>';
  }
}

function ejecutarLogicaDelSitio(catalogoCategorias, catalogoProductos) {
  // --- Funcionalidad del Menú Móvil ---
  const botonMenu = document.getElementById("boton-menu");
  if (botonMenu) {
    const menuMovil = document.getElementById("menu-movil");
    const iconoAbrir = document.getElementById("icono-abrir");
    const iconoCerrar = document.getElementById("icono-cerrar");
    botonMenu.addEventListener("click", () => {
      menuMovil.classList.toggle("hidden");
      iconoAbrir.classList.toggle("hidden");
      iconoCerrar.classList.toggle("hidden");
    });
  }

  // --- Variables y Lógica Común ---
  const contenedorProductos = document.getElementById("lista-productos");
  const tituloPagina = document.querySelector("main h1");
  const tituloOriginal = tituloPagina ? tituloPagina.textContent : "";
  let productosOriginales = [];

  // --- LÓGICA DE BÚSQUEDA HÍBRIDA ---
  if (contenedorProductos) {
    // Si hay una lista de productos en esta página, activamos la búsqueda en vivo.
    function manejarBusquedaEnVivo(evento) {
      const query = evento.target.value.toLowerCase().trim();
      if (!tituloPagina) return;
      if (query.length === 0) {
        tituloPagina.textContent = tituloOriginal;
        renderizarProductos(contenedorProductos, productosOriginales);
        return;
      }
      const resultados = catalogoProductos.filter(
        (p) =>
          (p.nombre ? p.nombre.toLowerCase().includes(query) : false) ||
          (p.categoria ? p.categoria.toLowerCase().includes(query) : false) ||
          (p.marca ? p.marca.toLowerCase().includes(query) : false)
      );
      tituloPagina.textContent = `Resultados para: "${evento.target.value}"`;
      renderizarProductos(contenedorProductos, resultados);
    }

    const searchInputDesktop = document.getElementById("search-desktop");
    const searchInputMobile = document.getElementById("search-mobile");
    if (searchInputDesktop)
      searchInputDesktop.addEventListener("input", manejarBusquedaEnVivo);
    if (searchInputMobile)
      searchInputMobile.addEventListener("input", manejarBusquedaEnVivo);
  } else {
    // Si NO hay lista de productos (ej. catalogo.html), activamos la búsqueda por redirección.
    function activarBusquedaPorRedireccion(formId, inputId) {
      const form = document.getElementById(formId);
      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const searchInput = document.getElementById(inputId);
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
          }
        });
      }
    }
    activarBusquedaPorRedireccion("search-form-desktop", "search-desktop");
    activarBusquedaPorRedireccion("search-form-mobile", "search-mobile");
  }

  // --- LÓGICA PARA RENDERIZAR CADA PÁGINA ---
  const contenedorCategorias = document.getElementById("lista-categorias");
  if (contenedorCategorias) {
    catalogoCategorias.forEach((categoria) => {
      const tarjetaHTML = `
                <a href="${categoria.url}" class="block group">
                    <div class="relative rounded-xl overflow-hidden shadow-lg transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300">
                        <img class="w-full h-80 object-cover" src="${categoria.imagen}" alt="Categoría ${categoria.nombre}" />
                        <div class="absolute bottom-0 left-0 right-0 p-4 ${categoria.colorFondo} backdrop-blur-md">
                            <h2 class="text-lg font-bold text-white text-center">${categoria.nombre}</h2>
                        </div>
                    </div>
                </a>`;
      contenedorCategorias.innerHTML += tarjetaHTML;
    });
  }

  if (contenedorProductos) {
    const categoriaActual = document.body.dataset.categoria;
    if (categoriaActual) {
      productosOriginales = catalogoProductos.filter(
        (p) => p.categoria === categoriaActual
      );
    } else {
      productosOriginales = [];
      const categoriasParaDestacar = catalogoCategorias.slice(0, 4);
      categoriasParaDestacar.forEach((categoria) => {
        const productoDestacado = catalogoProductos.find(
          (producto) => producto.categoria === categoria.id
        );
        if (productoDestacado) {
          productosOriginales.push(productoDestacado);
        }
      });
    }
    renderizarProductos(contenedorProductos, productosOriginales);
  }

  // --- LÓGICA PARA LA PÁGINA DE PRODUCTO INDIVIDUAL (producto.html) ---
  if (window.location.pathname.endsWith("producto.html")) {
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get("id");
    const producto = catalogoProductos.find((p) => p.id === productoId);
    if (producto) {
      document.title = producto.nombre + " - TIENDA GENTA";
      document.getElementById("product-name").textContent = producto.nombre;
      document.getElementById(
        "product-price"
      ).textContent = `$${producto.precio}`;
      document.getElementById(
        "product-old-price"
      ).textContent = `$${producto.precioAnterior}`;
      document.getElementById("product-description").textContent =
        producto.descripcion;
      document.getElementById("product-ref").textContent = producto.referencia;
      document.getElementById("product-brand").textContent = producto.marca;
      document.getElementById(
        "product-stock"
      ).textContent = `${producto.disponibles} unidades`;
      document.getElementById("main-image").src = producto.imagen1;

      const thumbnailContainer = document.getElementById("thumbnail-container");
      thumbnailContainer.innerHTML = "";
      [producto.imagen1, producto.imagen2, producto.imagen3].forEach(
        (imgSrc, index) => {
          if (imgSrc) {
            const thumbDiv = document.createElement("div");
            thumbDiv.className = "flex-shrink-0 w-24 h-24 aspect-square";
            const thumbImg = document.createElement("img");
            thumbImg.src = imgSrc;
            thumbImg.className =
              "thumbnail w-full h-full object-cover rounded-md cursor-pointer border-2";
            thumbImg.classList.add(
              index === 0 ? "border-red-500" : "border-transparent"
            );
            thumbDiv.appendChild(thumbImg);
            thumbnailContainer.appendChild(thumbDiv);
          }
        }
      );

      const mainImage = document.getElementById("main-image");
      const thumbnails = document.querySelectorAll(".thumbnail");
      thumbnails.forEach((thumb) => {
        thumb.addEventListener("click", function () {
          mainImage.src = this.src;
          thumbnails.forEach((t) =>
            t.classList.replace("border-red-500", "border-transparent")
          );
          this.classList.replace("border-transparent", "border-red-500");
        });
      });

      // ==========================================================
      // INICIO: CÓDIGO AÑADIDO PARA LOS BOTONES DE CANTIDAD
      // ==========================================================
      const minusBtn = document.getElementById("minus-btn");
      const plusBtn = document.getElementById("plus-btn");
      const quantityInput = document.getElementById("quantity-input");

      if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener("click", () => {
          let currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
          }
        });

        plusBtn.addEventListener("click", () => {
          let currentValue = parseInt(quantityInput.value);
          quantityInput.value = currentValue + 1;
        });
      }
      // ==========================================================
      // FIN: CÓDIGO AÑADIDO
      // ==========================================================
    }
  }

  // --- Función de Apoyo para Renderizar Tarjetas de Producto ---
  function renderizarProductos(contenedor, listaDeProductos) {
    if (!contenedor) return;
    contenedor.innerHTML = "";
    if (listaDeProductos.length === 0) {
      contenedor.innerHTML = `<p class="text-center text-gray-500 col-span-full">No se encontraron productos.</p>`;
      return;
    }
    listaDeProductos.forEach((producto) => {
      const tarjetaHTML = `
                <a href="producto.html?id=${producto.id}" class="block group">
                    <div class="relative rounded-xl overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                        <img class="w-full h-80 object-cover transition-opacity duration-500 group-hover:opacity-0" src="${producto.imagen1}" alt="${producto.nombre} - Vista 1"/>
                        <img class="absolute top-0 left-0 w-full h-80 object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100" src="${producto.imagen2}" alt="${producto.nombre} - Vista 2"/>
                        <div class="absolute bottom-0 left-0 right-0 p-4 bg-blue-200/30 backdrop-blur-md">
                            <h2 class="text-lg font-bold text-gray-800 text-center">${producto.nombre}</h2>
                        </div>
                    </div>
                </a>`;
      contenedor.innerHTML += tarjetaHTML;
    });
  }
}

// Iniciar toda la aplicación cuando la página cargue
document.addEventListener("DOMContentLoaded", iniciarAplicacion);
