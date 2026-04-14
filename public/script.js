const API_URL = "https://agenda-tu-turno.onrender.com"; 
let fp; // Instancia de Flatpickr

// Función: Cargar disponibilidad y configurar calendario
async function cargarDisponibilidad() {
    try {
        const res = await fetch(`${API_URL}/calendar/disponibilidad`);
        const ocupados = await res.json();

        fp = flatpickr("#start", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            minDate: "today",
            disable: ocupados.map(f => new Date(f)),
            locale: "es",
            time_24hr: true,
            minuteIncrement: 60
        });
    } catch (err) {
        console.error("Error cargando agenda:", err);
    }
}

// Función: Agendar turno (Modificada para Fase 2)
async function agendarTurno() {
    const summaryInput = document.getElementById('summary');
    const nombreInput = document.getElementById('nombreCompleto');
    const startInput = document.getElementById('start');
    const emailInput = document.getElementById('email');
    const btn = document.getElementById('btn-agendar');
    const spinner = document.getElementById('spinner');

    if (!startInput.value || !emailInput.value || !nombreInput.value) {
        alert("Por favor, completá los campos obligatorios");
        return;
    }

    const datos = {
        summary: summaryInput.value || "Consulta",
        nombreCompleto: nombreInput.value,
        start: new Date(startInput.value).toISOString(),
        email: emailInput.value
    };

    btn.disabled = true;
    spinner.style.display = "block";

    try {
        const res = await fetch(`${API_URL}/calendar/agendar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('ultimo_turno_id', data.eventId);
            mostrarConfirmacion(datos.summary, startInput.value);
            document.getElementById('form-agenda').reset();
            cargarDisponibilidad(); // Recargar grises
        } else {
            alert(data.error || "Error al agendar");
        }
    } catch (err) {
        alert("Error de conexión");
    } finally {
        btn.disabled = false;
        spinner.style.display = "none";
    }
}

// Función: Buscar turnos por email
async function buscarTurnos() {
    const email = document.getElementById('email-busqueda').value;
    if (!email) return alert("Ingresá tu mail");

    try {
        const res = await fetch(`${API_URL}/calendar/mis-turnos?email=${email}`);
        const turnos = await res.json();

        if (turnos.length > 0) {
            const t = turnos[0]; 
            localStorage.setItem('ultimo_turno_id', t.id);
            mostrarConfirmacion(t.summary, t.start.dateTime);
        } else {
            alert("No se encontraron turnos con ese email");
        }
    } catch (err) {
        alert("Error al buscar");
    }
}

// Función: Cancelar turno
async function solicitarCancelacion() {
    const id = localStorage.getItem('ultimo_turno_id');
    if (!id || !confirm("¿Seguro que querés cancelar este turno?")) return;

    try {
        const res = await fetch(`${API_URL}/calendar/cancelar/${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("Turno cancelado con éxito");
            location.reload();
        }
    } catch (err) {
        alert("No se pudo cancelar");
    }
}

// Función: Controladores de UI
function mostrarBusqueda() {
    document.getElementById('main-card').classList.add('hidden');
    document.getElementById('search-section').classList.remove('hidden');
}

function volverAlInicio() {
    location.reload();
}

function mostrarConfirmacion(motivo, fecha) {
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('main-card').classList.add('hidden');
    const card = document.getElementById('card-confirmacion');
    card.classList.remove('hidden');
    document.getElementById('res-motivo').innerText = motivo;
    document.getElementById('res-fecha').innerText = new Date(fecha).toLocaleString();
}

// Inicialización
document.addEventListener("DOMContentLoaded", cargarDisponibilidad);