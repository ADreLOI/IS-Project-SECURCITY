// map.ts

// Funzione per decodificare una polyline encoded in formato Google Maps
// Restituisce un array di coordinate { latitude, longitude }

export function decodePolyline(
  encoded: string
): { latitude: number; longitude: number }[] {
  let index = 0, // Indice per scorrere i caratteri della stringa
    lat = 0, // Variabile accumulatore per latitudine
    lng = 0, // Variabile accumulatore per longitudine
    coordinates = [] as { latitude: number; longitude: number }[];

  // Cicla su ogni carattere dell’encoded string
  while (index < encoded.length) {
    // --- Decodifica della latitudine ---
    let b,
      shift = 0,
      result = 0;

    // Legge i bit finché il valore è >= 0x20 (continuazione)
    do {
      b = encoded.charCodeAt(index++) - 63; // Decodifica base64 modificata (ASCII - 63)
      result |= (b & 0x1f) << shift; // Mantiene solo i 5 bit meno significativi
      shift += 5; // Incrementa il bitshift
    } while (b >= 0x20);

    // Applica la conversione da valore zig-zag a intero con segno
    let deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat; // Aggiorna latitudine assoluta

    // --- Decodifica della longitudine ---
    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng; // Aggiorna longitudine assoluta

    // Aggiunge la coordinata normalizzata (divisa per 1e5)
    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  // Ritorna l’elenco delle coordinate decodificate
  return coordinates;
}
