# Istruzioni per l'Architettura Corretta (Frontend su AI Studio)

Questa guida descrive il flusso di lavoro corretto e professionale per questo progetto, utilizzando `pm2` per garantire che il backend sia sempre attivo e facile da gestire.

### L'Architettura

- **Backend (Server API):** Gira sulla tua macchina Linux. Il suo unico scopo è gestire i dati.
- **Frontend (Applicazione Utente):** Gira su Google AI Studio (un ambiente sicuro **HTTPS**). È qui che sviluppi l'interfaccia.
- **ngrok (Tunnel Sicuro):** Crea un indirizzo **HTTPS** pubblico e sicuro che si collega al tuo backend.
- **pm2 (Process Manager):** Mantiene il server API e il tunnel `ngrok` attivi in background.

---

## 1. Configurazione Iniziale (da fare una sola volta)

Sulla tua macchina Linux:

1.  **Copia solo la cartella `server`** in una posizione a tua scelta (es. la tua Home).
2.  Apri un terminale e naviga dentro la cartella `server`:
    ```bash
    cd /percorso/alla/cartella/server
    ```
3.  Installa le dipendenze del server e `pm2` a livello globale:
    ```bash
    npm install
    sudo npm install pm2 -g
    ```
4.  **Installa e configura ngrok** se non l'hai già fatto (vedi la guida ufficiale per i comandi `apt install` e per aggiungere il tuo `authtoken`).

---

## 2. Risoluzione Problemi: Procedura di Reset Forzato (Metodo Raccomandato)

Questa è la procedura da seguire **sempre**, sia per il primo avvio sia quando riscontri problemi (come l'errore "endpoint is already online" o processi in stato "errored"). Garantisce una pulizia completa.

**Passo A: Naviga nella Cartella Corretta**

Apri un terminale e assicurati di essere **DENTRO** la cartella `server`.
```bash
cd ~/server
```

**Passo B: Esegui i Comandi di Reset Forzato**

Esegui questi comandi **uno dopo l'altro**:

1.  **Pulisci la lista di `pm2`:**
    ```bash
    pm2 delete all
    ```

2.  **Uccidi TUTTI i processi `ngrok` (Metodo Forzato):**
    ```bash
    killall ngrok
    ```

3.  **Libera la porta del server (CRUCIALE):**
    Questo comando uccide qualsiasi processo stia occupando la porta 3001. Se il comando restituisce un errore "nessun processo trovato", è normale: significa che la porta era già libera.
    ```bash
    fuser -k 3001/tcp
    ```

4.  **Riavvia il server API in background:**
    ```bash
    pm2 start server.js --name "turni-api"
    ```

5.  **Riavvia il tunnel `ngrok` in background:**
    ```bash
    pm2 start "ngrok http 3001" --name "ngrok-tunnel"
    ```

6.  **Verifica che tutto sia online** con `pm2 list` e **recupera il nuovo URL di `ngrok`** con `pm2 logs ngrok-tunnel`.

**A questo punto, puoi chiudere tutte le finestre del terminale. I tuoi servizi sono online.**

---

## 3. Configurazione del Frontend (all'interno dell'App)

1.  **Apri l'applicazione** dal tuo link di Google AI Studio.
2.  Se è la prima volta o se l'URL di `ngrok` è cambiato, **apparirà un pop-up di configurazione**.
3.  **Incolla l'URL di `ngrok`** che hai appena copiato nel campo richiesto.
4.  Usa il pulsante **"Test Connessione"** per assicurarti che funzioni.
5.  Clicca su "Salva e Riconnetti".

**Fatto!** L'applicazione ora è connessa al tuo backend. Non devi più modificare alcun file di codice per la connessione.