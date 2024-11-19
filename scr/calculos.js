document.addEventListener('DOMContentLoaded', () => {
    cargarPaises();
    cargarUltimaCotizacion();
    document.querySelector('.botones[value="Calcular"]').addEventListener('click', calcular);
    document.querySelector('.botones[value="Guardar"]').addEventListener('click', guardarCotizacion);
    document.getElementById('lblSeguro').addEventListener('click', mostrarMensajeSeguro);
});

// Cargar países desde la API
async function cargarPaises() {
    const selectNacionalidad = document.getElementById('nacionalidad');
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const countries = await response.json();

        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.cca3;
            option.textContent = country.name.common;
            selectNacionalidad.appendChild(option);
        });

        const savedCountry = localStorage.getItem('selectedCountry') || 'CRI';
        selectNacionalidad.value = savedCountry;
    } catch (error) {
        console.error('Error cargando países:', error);
    }
}

// Mostrar mensaje del seguro
function mostrarMensajeSeguro() {
    const seguro = document.getElementById('seguro').value;
    let mensaje = '';
    switch (seguro) {
        case '5.45':
            mensaje = 'PBO: Cubre daños básicos al vehículo y terceros.';
            break;
        case '9.50':
            mensaje = 'PED: Cubre PBO más daños a propiedades, incendio e inundaciones.';
            break;
        case '11.25':
            mensaje = 'PGM: Cubre PED más gastos médicos para ocupantes.';
            break;
    }
    alert(mensaje);
}

// Calcular cotización
async function calcular() {
    const fechaRetiro = new Date(document.querySelector('input[name="fechaRetiro"]').value);
    const fechaDevolucion = new Date(document.querySelector('input[name="fechadevolucion"]').value);
    const dias = (fechaDevolucion - fechaRetiro) / (1000 * 60 * 60 * 24);

    if (dias < 3 || dias > 365) {
        alert('La cantidad de días debe estar entre 3 y 365.');
        return;
    }

    document.querySelector('input[name="dias"]').value = dias;

    const tipoVehiculo = parseFloat(document.getElementById('tipoVehiculo').value);
    const seguro = parseFloat(document.getElementById('seguro').value);
    let tarifaDiaria = tipoVehiculo + seguro;

    if (dias > 30 && dias < 120) tarifaDiaria *= 0.85;
    if (dias >= 120 && dias <= 365) tarifaDiaria *= 0.75;

    document.querySelector('input[name="td"]').value = tarifaDiaria.toFixed(2);

    const nacionalidad = document.getElementById('nacionalidad').value;
    let descuento = 0;

    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${nacionalidad}`);
        const country = await response.json();
        const region = country[0]?.region || '';

        if (['Americas', 'Europe'].includes(region)) descuento = 0.10;
        if (region === 'Africa') descuento = 0.05;

    } catch (error) {
        console.error('Error obteniendo región:', error);
    }

    const total = tarifaDiaria * dias * (1 - descuento);
    document.querySelector('input[name="totalPagar"]').value = total.toFixed(2);
}

// Guardar cotización
function guardarCotizacion() {
    const datos = {
        fechaRetiro: document.querySelector('input[name="fechaRetiro"]').value,
        fechaDevolucion: document.querySelector('input[name="fechadevolucion"]').value,
        nacionalidad: document.getElementById('nacionalidad').value,
        dias: document.querySelector('input[name="dias"]').value,
        tarifaDiaria: document.querySelector('input[name="td"]').value,
        totalPagar: document.querySelector('input[name="totalPagar"]').value,
    };
    localStorage.setItem('ultimaCotizacion', JSON.stringify(datos));
    alert('Cotización guardada exitosamente.');
}

// Cargar última cotización
function cargarUltimaCotizacion() {
    const datos = JSON.parse(localStorage.getItem('ultimaCotizacion'));
    if (datos) {
        document.querySelector('input[name="fechaRetiro"]').value = datos.fechaRetiro;
        document.querySelector('input[name="fechadevolucion"]').value = datos.fechaDevolucion;
        document.getElementById('nacionalidad').value = datos.nacionalidad;
        document.querySelector('input[name="dias"]').value = datos.dias;
        document.querySelector('input[name="td"]').value = datos.tarifaDiaria;
        document.querySelector('input[name="totalPagar"]').value = datos.totalPagar;
    }
}
