
const BASE_URL = 'https://agenda-tu-turno.onrender.com'; 

// Inicializador de Vistas y Flatpickr
document.addEventListener('DOMContentLoaded', () => {
    // Inicialización básica del calendario visual
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#start", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            locale: "es",
            minDate: "today",
            time_24hr: true
        });
    }

    // Configuración del botón REPROGRAMAR
    const btnReprogramar = document.getElementById('tab-reprogramar');
    if (btnReprogramar) {
        btnReprogramar.removeAttribute('disabled');
        btnReprogramar.removeAttribute('title');
        btnReprogramar.addEventListener('click', (e) => {
            e.preventDefault();
            alert('🔄 La reprogramación automática estará disponible próximamente. Por favor, cancela tu turno actual y genera uno nuevo.');
        });
    }
});

// Manejo del cambio de pestañas (Agendar / Cancelar / Reprogramar)
function cambiarVista(vista) {
    document.querySelectorAll('.view-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    if (vista === 'agendar') {
        document.getElementById('vista-agendar').classList.add('active');
        document.getElementById('vista-agendar').classList.remove('hidden');
        document.getElementById('tab-agendar').classList.add('active');
    } else if (vista === 'cancelar') {
        document.getElementById('vista-cancelar').classList.add('active');
        document.getElementById('vista-cancelar').classList.remove('hidden');
        document.getElementById('tab-cancelar').classList.add('active');
    }
}

// ==========================================
// ACCIÓN: CONFIRMAR / AGENDAR TURNO
// ==========================================
async function agendarTurno() {
    const summary = document.getElementById('summary').value;
    const nombreCompleto = document.getElementById('nombreCompleto').value;
    const email = document.getElementById('email').value;
    const start = document.getElementById('start').value;

    if (!nombreCompleto || !email || !start) {
        return alert('Por favor, completa todos los campos requeridos.');
    }

    const btnAgendar = document.getElementById('btn-agendar');
    btnAgendar.innerText = 'PROCESANDO...';
    btnAgendar.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/calendar/agendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summary, nombreCompleto, email, start })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ¡Reserva confirmada con éxito! Revisa tu casilla de correo.');
            document.getElementById('form-agenda').reset();
        } else {
            alert(data.error || 'No se pudo procesar la reserva.');
        }
    } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor.');
    } finally {
        btnAgendar.innerText = 'CONFIRMAR TURNO';
        btnAgendar.disabled = false;
    }
}

// ==========================================
// ACCIÓN: BUSCAR Y CANCELAR DIRECTO 
// ==========================================
async function buscarTurnos() {
    const emailInput = document.getElementById('email-busqueda');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
        return alert('Por favor, ingresa tu correo para cancelar la reserva.');
    }

    const btnSearch = document.querySelector('.btn-search');
    btnSearch.innerText = 'PROCESANDO...';
    btnSearch.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/calendar/cancelar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Reserva cancelada correctamente.');
            if (emailInput) emailInput.value = '';
        } else {
            alert(data.error || 'No se encontró ninguna reserva activa para este email.');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión al procesar la solicitud.');
    } finally {
        btnSearch.innerText = 'BUSCAR';
        btnSearch.disabled = false;
    }
}

// Se preserva vacía para evitar errores de referencias en el HTML viejo
function solicitarCancelacion() {
    return;
}