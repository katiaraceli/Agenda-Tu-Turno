function agendarTurno() {

  // ✅ CAPTURAR VALORES EN EL MOMENTO DEL CLICK
  const summary = document.getElementById('summary').value;
  const start = document.getElementById('start').value;

  // ⚠️ VALIDACIÓN BÁSICA
  if (!start) {
    alert("Seleccioná fecha y hora");
    return;
  }

  fetch("http://localhost:3000/calendar/crear", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      summary: summary,
      start: start
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("✅ Turno creado:", data);
    alert("Turno agendado correctamente");
  })
  .catch(err => {
    console.error("❌ Error:", err);
    alert("Error al agendar turno");
  });

}