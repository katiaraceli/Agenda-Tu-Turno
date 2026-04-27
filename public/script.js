const API_URL = "https://agenda-tu-turno.onrender.com";
let fp;

/* 1. SISTEMA DE VISTAS (NAVEGACIÓN) */
function cambiarVista(vista) {
    const views = ['vista-agendar', 'vista-cancelar'];
    const tabs = ['tab-agendar', 'tab-cancelar'];
    
    // Ocultar todas las secciones y desactivar pestañas
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });

    tabs.forEach(t => {
        const el = document.getElementById(t);
        if (el) el.classList.remove('active');
    });

    // Activar la vista y pestaña seleccionada
    const vistaDestino = document.getElementById(`vista-${vista}`);
    const tabDestino = document.getElementById(`tab-${vista}`);

    if (vistaDestino) vistaDestino.classList.remove('hidden');
    if (tabDestino) tabDestino.classList.add('active');

    // Forzar reinicialización del calendario si volvemos a Agendar
    if (vista === 'agendar' && !fp) {
        cargarDisponibilidad();
    }
}

/* 2. INICIALIZACIÓN DEL CALENDARIO (RESILIENTE) */
async function cargarDisponibilidad() {
    let ocupados = [];
    const statusLabel = document.getElementById('api-status');

    try {
        const res = await fetch(`${API_URL}/calendar/disponibilidad`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json();
        if (Array.isArray(data)) {
            // Filtrar y convertir a objetos Date válidos
            ocupados = data.map(f => new Date(f)).filter(d => !isNaN(d));
            console.log("✅ Disponibilidad cargada correctamente.");
            if (statusLabel) statusLabel.innerText = ""; 
        }
    } catch (e) {
        console.error("⚠️ Fallo en Backend:", e.message);
        // Si falla la API, informamos al usuario de forma elegante
        if (statusLabel) statusLabel.innerText = "Nota: Selecciona tu horario manualmente.";
    }

    // Inicialización de Flatpickr (siempre se ejecuta)
    fp = flatpickr("#start", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        disable: ocupados,
        locale: "es",
        time_24hr: true,
        minuteIncrement: 60,
        allowInput: false
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
            
            // Refrescar disponibilidad para bloquear el horario recién tomado
            await cargarDisponibilidad(); 
            
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
    const resultadoDiv = document.getElementById('resultado-busqueda');
    
    if (!email) return alert("Ingresa tu email.");

    try {
        const res = await fetch(`${API_URL}/calendar/mis-turnos?email=${email}`);
        const turnos = await res.json();

        if (Array.isArray(turnos) && turnos.length > 0) {
            const t = turnos[0]; // Mostramos el primer turno encontrado
            document.getElementById('res-motivo').innerText = `Motivo: ${t.summary}`;
            document.getElementById('res-fecha').innerText = `Fecha: ${new Date(t.start.dateTime).toLocaleString()}`;
            
            localStorage.setItem('id_temp', t.id);
            resultadoDiv.classList.remove('hidden');
        } else {
            alert("No se encontraron turnos con ese email.");
            resultadoDiv.classList.add('hidden');
        }
    } catch (e) {
        alert("Error al buscar el turno.");
    }
}

async function solicitarCancelacion() {
    const id = localStorage.getItem('id_temp');
    if (!id) return;
    if (!confirm("¿Deseas cancelar definitivamente este turno?")) return;

    try {
        const res = await fetch(`${API_URL}/calendar/cancelar/${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("Turno cancelado correctamente.");
            localStorage.removeItem('id_temp');
            location.reload(); // Recargamos para limpiar todo el estado
        } else {
            alert("No se pudo cancelar el turno. Intenta más tarde.");
        }
    } catch (e) {
        alert("Hubo un problema con la conexión al servidor.");
    }
}

/* INICIALIZACIÓN AL CARGAR EL DOM */
document.addEventListener("DOMContentLoaded", cargarDisponibilidad);