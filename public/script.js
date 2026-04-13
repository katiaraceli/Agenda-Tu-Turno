const API_URL = "https://agenda-tu-turno.onrender.com"; 

async function agendarTurno() {
    const summaryInput = document.getElementById('summary');
    const nombreInput = document.getElementById('nombreCompleto');
    const startInput = document.getElementById('start');
    const emailInput = document.getElementById('email');
    const btn = document.getElementById('btn-agendar');

    if (!startInput.value || !emailInput.value || !nombreInput.value) {
        alert("Por favor, completá Nombre, Email y Fecha");
        return;
    }

    const fechaSeleccionada = new Date(startInput.value);
    fechaSeleccionada.setMinutes(0, 0, 0); 
    const startExacto = fechaSeleccionada.toISOString();

    const datos = {
        summary: summaryInput.value || "Consulta", 
        nombreCompleto: nombreInput.value, 
        start: startExacto, 
        email: emailInput.value
    };

    btn.disabled = true;
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "⌛ PROCESANDO...";

    try {
        const res = await fetch(`${API_URL}/calendar/agendar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const data = await res.json();

        if (res.status === 409) {
            alert("❌ Horario ocupado. Elegí otro.");
            return;
        }

        if (res.ok) {
            alert("✅ ¡Turno agendado! Revisá tu mail.");
            summaryInput.value = "";
            nombreInput.value = "";
            startInput.value = "";
            emailInput.value = "";
        } else {
            alert("⚠️ Error: " + (data.error || "No se pudo agendar"));
        }
    } catch (err) {
        console.error("Error de conexión:", err);
        alert("Fallo de conexión con el servidor");
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}