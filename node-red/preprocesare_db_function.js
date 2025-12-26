// Citim variabilele de flux
let stare = flow.get("stare") || null;
let vehicul = flow.get("vehicul_detectat") || false;
let pieton = flow.get("cerere_pieton") || false;

// Actualizam variabilele pe masura ce intra mesaje noi in functie de topic
if (msg.topic === "trafic/stare/semafor") {
    stare = msg.payload; // R / G / V
    flow.set("stare", stare);
}

if (msg.topic === "trafic/senzor/numar_vehicule") {
    vehicul = (msg.payload === "1" || msg.payload === 1 || msg.payload === true);
    flow.set("vehicul_detectat", vehicul);
}

if (msg.topic === "trafic/senzor/buton_pieton") {
    pieton = (msg.payload === "apasat");
    flow.set("cerere_pieton", pieton);
}

// pregatim valorile pentru SQL INSERT in tabelul de trafic_log
msg.params = [
    stare,
    vehicul,
    pieton
];

return msg;
