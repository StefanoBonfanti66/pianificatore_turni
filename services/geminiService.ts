import { GoogleGenAI, Type } from "@google/genai";
import type { Worker, Machine, ShiftSuggestion, Department } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        workerName: {
          type: Type.STRING,
          description: "Il nome del lavoratore assegnato."
        },
        date: {
          type: Type.STRING,
          description: "La data del turno in formato AAAA-MM-GG."
        },
        startTime: {
          type: Type.STRING,
          description: "L'orario di inizio del turno in formato HH:MM."
        },
        endTime: {
          type: Type.STRING,
          description: "L'orario di fine del turno in formato HH:MM."
        },
        departmentName: {
          type: Type.STRING,
          description: "Il nome del reparto per il turno. Deve essere uno dei reparti disponibili."
        },
        machineName: {
            type: Type.STRING,
            description: "Il nome della macchina di produzione assegnata per questo turno, se applicabile. Deve essere una delle macchine disponibili."
        }
      },
      required: ["workerName", "date", "startTime", "endTime", "departmentName"]
    }
};

export const generateShiftSuggestions = async (
  requirements: string,
  workers: Worker[],
  machines: Machine[],
  departments: Department[],
  existingShifts: { date: string, workerName: string }[]
): Promise<ShiftSuggestion[]> => {
  const workerList = workers.map(w => w.name).join(', ');
  const machineList = machines.map(m => m.name).join(', ');
  const departmentList = departments.map(d => d.name).join(', ');
  const existingShiftsString = existingShifts.map(s => `${s.workerName} il ${s.date}`).join('; ') || 'Nessuno';

  const prompt = `
    Sei un assistente per la pianificazione dei turni per un impianto di produzione.
    Il tuo compito è generare un elenco di nuove assegnazioni di turni in base ai requisiti forniti, al personale, alle macchine e ai reparti disponibili e al programma esistente.
    
    Lavoratori Disponibili: ${workerList}
    Macchine Disponibili: ${machineList}
    Reparti Disponibili: ${departmentList}
    
    Turni Esistenti (per evitare doppie prenotazioni nello stesso giorno): ${existingShiftsString}
    
    Requisiti di Pianificazione: "${requirements}"
    
    La data di oggi è ${new Date().toISOString().split('T')[0]}.
    
    Sulla base di tutte queste informazioni, genera un elenco di nuove assegnazioni di turni. Assicurati che un lavoratore non sia assegnato a più di un turno nello stesso giorno. Assegna una macchina a un turno solo se ha senso per il reparto e i requisiti.
    Restituisci la risposta come un array JSON che corrisponda allo schema fornito.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    
    // Basic validation
    if (!Array.isArray(suggestions)) {
        throw new Error("La risposta dell'IA non è un array valido.");
    }
    
    return suggestions as ShiftSuggestion[];

  } catch (error) {
    console.error("Errore durante la generazione dei suggerimenti di turno:", error);
    throw new Error("Impossibile ottenere suggerimenti dall'IA. Controlla la console per i dettagli.");
  }
};