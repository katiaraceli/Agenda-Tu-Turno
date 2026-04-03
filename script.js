function agendarTurno() {
    // 1. Capturamos los elementos
    const summaryInput = document.getElementById('summary');
    const startInput = document.getElementById('start');
    const emailInput = document.getElementById('email'); // Ahora sí existe

    // 2. Validamos que no estén vacíos
    if (!startInput.value || !emailInput.value) {
        alert("Por favor, completá la Fecha y tu Email");
        return;
    }

    // 3. Armamos la valija para el servidor
    const datos = {
        summary: summaryInput.value,
        start: startInput.value,
        email: emailInput.value
    };

    fetch("http://localhost:3001/calendar/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        console.log("✅ Servidor dice:", data);
        alert("¡Turno agendado! Revisá tu casilla de correo.");
    })
    .catch(err => {
        console.error("❌ Error de conexión:", err);
        alert("Fallo al conectar con el servidor");
    });
}