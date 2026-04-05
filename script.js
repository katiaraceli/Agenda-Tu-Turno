function agendarTurno() {
    const summaryInput = document.getElementById('summary');
    const startInput = document.getElementById('start');
    const emailInput = document.getElementById('email');

    if (!startInput.value || !emailInput.value) {
        alert("Por favor, completá la Fecha y tu Email");
        return;
    }

    // --- AGREGAR DESDE AQUÍ ---
    const fechaSeleccionada = new Date(startInput.value);
    fechaSeleccionada.setMinutes(0, 0, 0); // Esto fuerza el "O´clock"
    const startExacto = fechaSeleccionada.toISOString();
    // --- HASTA AQUÍ ---

const datos = {
        // Así combinamos el texto fijo con lo que escribe el usuario
        summary: `Turno por: ${summaryInput.value || "Consulta General"}`, 
        start: startExacto, 
        email: emailInput.value
    };
    // ... 

    fetch("http://localhost:3001/calendar/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(async res => {
        const data = await res.json();
        
        // 🚨 SI EL HORARIO ESTÁ OCUPADO
        if (res.status === 409) {
            alert("❌ ¡Error! Ese horario ya está reservado. Por favor, elegí otro.");
            return;
        }

        if (res.ok) {
            alert("✅ ¡Turno agendado! Revisá tu casilla de correo.");
            console.log("Servidor dice:", data);
        } else {
            alert("⚠️ Hubo un problema: " + (data.error || "Error desconocido"));
        }
    })
    .catch(err => {
        console.error("❌ Error de conexión:", err);
        alert("Fallo al conectar con el servidor");
    });
}