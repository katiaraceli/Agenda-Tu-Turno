let googleAuth; 
let googleListo = false;

function startApp() {
    console.log("Cerebro iniciando...");
    gapi.load('client:auth2', () => {
        gapi.client.init({
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
        }).then(() => {
            googleAuth = gapi.auth2.getAuthInstance();
            googleListo = true;
            console.log("✅ SISTEMA CONECTADO");
        }).catch(err => console.error("❌ Error:", err));
    });
}

function conectarGoogle() {
    if (!googleAuth) return alert("Cargando...");
    googleAuth.signIn().then(() => alert("¡Conectado!"));
}

function enviarTurnoPrueba() {
    if (googleListo && googleAuth.isSignedIn.get()) {
        agendarTurno(); // Llama a la función del Brazo
    } else {
        alert("Primero conectá Google.");
    }
}