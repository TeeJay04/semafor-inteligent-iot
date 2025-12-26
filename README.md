# Semafor Inteligent – Proiect IoT

## Descriere
Proiect IoT care implementează un semafor inteligent pentru vehicule și pietoni,
folosind ESP32, protocol MQTT, Node-RED și o bază de date PostgreSQL.

## Arhitectură
- Dispozitiv embedded: ESP32 (WiFi)
- Broker MQTT: Mosquitto
- Platformă logică: Node-RED
- Bază de date: PostgreSQL

## Funcționalități
- Detectarea vehiculelor cu senzor ultrasonic
- Cerere pieton prin buton
- Control automat al semaforului
- Interfață web (Node-RED Dashboard)
- Stocarea evenimentelor în PostgreSQL

## Structura proiectului
- `embedded/` – cod ESP32
- `node-red/` – flow-uri Node-RED
- `database/` – schema bazei de date
- `docs/` – diagrame și capturi ecran


