const API_URL = "https://agenda-tu-turno.onrender.com";
let fp;

/* 1. SISTEMA DE VISTAS */
function cambiarVista(vista) {
    const views = ['vista-agendar', 'vista-cancelar'];
    const tabs = ['tab-agendar', 'tab-cancelar'];
    
    views.forEach(v => document.getElementById(v).classList.add('hidden'));
    tabs.forEach(t => document.getElementById(t).classList.remove('active'));

    document.getElementById(`vista-${vista}`).classList.remove('hidden');
    document.getElementById(`tab-${vista}`).classList.add('active');
}

/* 2. INICIALIZACIÓN DEL CALENDARIO (RESILIENTE) */
async function cargarDisponibilidad() {
    let ocupados = [];
    const statusLabel = document.getElementById('api-status');

    try {
        const res = await fetch(`${API_URL}/calendar/disponibilidad`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json();
        // Validación estricta de array
        if (Array.isArray(data)) {
            ocupados = data.map(f => new Date(f)).filter(d => !isNaN(d));
            console.log("✅ Disponibilidad cargada correctamente.");
        }
    } catch (e) {
        console.error("⚠️ Fallo en Backend:", e.message);
        statusLabel.innerText = "Nota: Selecciona tu horario manualmente.";
    }

    // Inicialización garantizada de Flatpickr
    fp = flatpickr("#start", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        disable: ocupados,
        locale: "es",
        time_24hr: true,
        minuteIncrement: 60,
        allowInput: false,
        onOpen: () => console.log("Calendario abierto.")
    });
}

/* 3. ACCIÓN: AGENDAR */
async function agendarTurno() {
    const btn = document.getElementById('btn-agendar');
    const msg = document.getElementById('mensaje-exito');
    const fechaInput = document.getElementById('start').value;

    if (!fechaInput) return alert("Por favor, selecciona una fecha y hora.");

    const datos = {
        summary: document.getElementById('summary').value || "Consulta General",
        nombreCompleto: document.getElementById('nombreCompleto').value,
        email: document.getElementById('email').value,
        start: new Date(fechaInput).toISOString()
    };

    btn.disabled = true;
    btn.innerText = "PROCESANDO...";

    try {
        const res = await fetch(`${API_URL}/calendar/agendar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            document.getElementById('detalle-turno-exito').innerText = `${fechaInput} hs`;
            msg.classList.remove('hidden');
            document.getElementById('form-agenda').reset();
            cargarDisponibilidad(); // Refrescar bloqueos
            setTimeout(() => msg.classList.add('hidden'), 8000);
        } else {
            alert("El servidor no pudo procesar la reserva. Intenta nuevamente.");
        }
    } catch (e) {
        alert("Error de conexión. Verifica tu internet.");
    } finally {
        btn.disabled = false;
        btn.innerText = "CONFIRMAR TURNO";
    }
}

/* 4. ACCIÓN: GESTIONAR (CANCELAR) */
async function buscarTurnos() {
    const email = document.getElementById('email-busqueda').value;
    if (!email) return alert("Ingresa tu email.");

    try {
        const res = await fetch(`${API_URL}/calendar/mis-turnos?email=${email}`);
        const turnos = await res.json();

        if (Array.isArray(turnos) && turnos.length > 0) {
            const t = turnos[0];
            document.getElementById('res-motivo').innerText = `Motivo: ${t.summary}`;
            document.getElementById('res-fecha').innerText = `Fecha: ${new Date(t.start.dateTime).toLocaleString()}`;
            localStorage.setItem('id_temp', t.id);
            document.getElementById('resultado-busqueda').classList.remove('hidden');
        } else {
            alert("No se encontraron turnos con ese email.");
        }
    } catch (e) {
        alert("Error al buscar el turno.");
    }
}

async function solicitarCancelacion() {
    const id = localStorage.getItem('id_temp');
    if (!confirm("¿Deseas cancelar definitivamente este turno?")) return;

    try {
        const res = await fetch(`${API_URL}/calendar/cancelar/${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("Turno cancelado.");
            location.reload();
        }
    } catch (e) {
        alert("No se pudo cancelar.");
    }
}

document.addEventListener("DOMContentLoaded", cargarDisponibilidad);