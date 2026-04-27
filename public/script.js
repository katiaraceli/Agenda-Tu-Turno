const API_URL = "https://agenda-tu-turno.onrender.com";
let fp;

// 1. CAMBIO DE VISTAS (TABS)
function cambiarVista(vista) {
    const vAgendar = document.getElementById('vista-agendar');
    const vGestionar = document.getElementById('vista-gestionar');
    const tabA = document.getElementById('tab-agendar');
    const tabG = document.getElementById('tab-gestionar');

    if(vista === 'agendar') {
        vAgendar.classList.remove('hidden');
        vGestionar.classList.add('hidden');
        tabA.classList.add('active');
        tabG.classList.remove('active');
    } else {
        vAgendar.classList.add('hidden');
        vGestionar.classList.remove('hidden');
        tabG.classList.add('active');
        tabA.classList.remove('active');
    }
}

// 2. CARGAR CALENDARIO
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
    } catch (e) { console.error("Error API", e); }
}

// 3. AGENDAR (CON MENSAJE INLINE)
async function agendarTurno() {
    const btn = document.getElementById('btn-agendar');
    const msg = document.getElementById('mensaje-exito');
    
    const fechaVal = document.getElementById('start').value;
    if(!fechaVal) return alert("Selecciona una fecha");

    const datos = {
        summary: document.getElementById('summary').value || "Consulta",
        nombreCompleto: document.getElementById('nombreCompleto').value,
        email: document.getElementById('email').value,
        start: new Date(fechaVal).toISOString()
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
            document.getElementById('detalle-turno-exito').innerText = `Turno: ${fechaVal} hs`;
            msg.classList.remove('hidden');
            document.getElementById('form-agenda').reset();
            cargarDisponibilidad();
            setTimeout(() => msg.classList.add('hidden'), 6000);
        }
    } catch (e) { alert("Error de red"); }
    finally { btn.disabled = false; btn.innerText = "CONFIRMAR TURNO"; }
}

// El resto de funciones (buscarTurnos, solicitarCancelacion) siguen igual que antes.
document.addEventListener("DOMContentLoaded", cargarDisponibilidad);