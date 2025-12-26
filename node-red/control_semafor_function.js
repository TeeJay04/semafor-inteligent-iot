// Initializare variabile de flux la prima rulare (On-Start) a fluxului
flow.set("stare", "V");
flow.set("cerere_pieton", false);
flow.set("vehicul_detectat", false);

node.log("Semafor: sistem automat pornit.");

// Cod principal al functiei (On-Message)

// Preluare stare curenta sau initializare
let stare = flow.get("stare") || "V";
let cerere_pieton = flow.get("cerere_pieton") || false;
let vehicul_detectat = flow.get("vehicul_detectat") || false;

// Variabila pentru a decide daca rulam logica de semafor acum sau asteptam ciclul urmator
let executa_logica = false;

// 1. GESTIONARE INPUT PIETON
if (msg.topic === "trafic/senzor/buton_pieton") {
    // Verificam daca mesajul este de apasare (payload "apasat")
    if (msg.payload === "apasat") {
        cerere_pieton = true;
        flow.set("cerere_pieton", true);

        // Daca semaforul e verde, nu mai asteptam timer-ul ci trecem imediat in galben
        if (stare === "V") {
            executa_logica = true;
        }
    }
}

// 2. GESTIONARE INPUT VEHICUL
else if (msg.topic === "trafic/senzor/numar_vehicule") {
    // Verificam ce trimite nodul Trigger (Auto-reset) de la senzorul de vehicule
    // El trimite boolean false cand expira timpul fara vehicule detectate
    if (msg.payload === false || msg.payload === "false" || msg.payload === 0) {
        vehicul_detectat = false;
    } else {
        vehicul_detectat = true;
    }
    // Salvam starea detectiei vehiculului
    flow.set("vehicul_detectat", vehicul_detectat);
}

// 3. GESTIONARE TIMER CICLIC - nodul Inject
// Acest nod trimite un mesaj periodic pentru a forta evaluarea starii semaforului
else if (msg.topic === "trafic/ciclu") {
    executa_logica = true;
}

// Daca nu trebuie sa executam logica (doar am actualizat o variabila de vehicul), iesim din functie
if (!executa_logica) {
    return null;
}

// LOGICA STARE SISTEM

// Decizie stare urmatoare in functie de starea curenta si conditiile de trafic
switch (stare) {

    case "V":  // VERDE
        if (cerere_pieton) {
            // Pietonul are prioritate -> Trecem in Galben
            stare = "G";
        }
        else if (vehicul_detectat) {
            // Daca e vehicul si nu e pieton -> Ramane Verde
            // Resetam practic timer-ul ramanand in starea asta
            stare = "V";
        }
        else {
            // Nu se detecteaza nimic -> Ciclare normala
            stare = "G";
        }
        break;

    case "G": // GALBEN
        stare = "R";
        break;

    case "R": // ROSU
        stare = "V";

        // Resetam cererile doar cand ne intoarcem in Verde
        // (Dupa ce s-a terminat ciclul de asteptare)
        cerere_pieton = false;
        flow.set("cerere_pieton", false);

        break;
}

// Salvare stare noua
flow.set("stare", stare);

// Afisam status mic sub nod pentru debugging
node.status({ fill: stare === "V" ? "green" : stare === "R" ? "red" : "yellow", shape: "dot", text: stare });

// Emitere comanda catre embedded
return {
    payload: stare,
    topic: "trafic/cmd/semafor"
};