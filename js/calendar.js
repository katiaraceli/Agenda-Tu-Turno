function agendarTurno() {
    console.log("Brazo agendando...");
    const evento = {
        'summary': 'TURNO PRUEBA - TURNOAPP',
        'start': { 'dateTime': new Date().toISOString(), 'timeZone': 'America/Argentina/Buenos_Aires' },
        'end': { 'dateTime': new Date(Date.now() + 3600000).toISOString(), 'timeZone': 'America/Argentina/Buenos_Aires' }
    };

    gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': evento
    }).execute(resp => {
        if (resp.htmlLink) alert("✅ ¡Turno en tu Calendario!");
    });
}