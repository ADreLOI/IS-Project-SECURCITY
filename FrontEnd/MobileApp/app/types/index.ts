
export type Cittadino = 
{
  username: string;
  id: string;
  email: string;
  isVerificato: boolean;
  isAutenticato: boolean;
  isGoogleAutenticato: boolean;
  googleId: string;
  storico: Segnalazione[];
  itinerariPreferiti: Itinerario[];
  contattiEmergenza: ContattoEmergenza[];
};

export type Tappa =
{
    nome: string;
    coordinate: {
        lat: number;
        lng: number;
    };
}

export type Segnalazione =
{
    id: string;
    userId: string;
    tipoDiReato: string;
    descrizione: string;
    tappa: Tappa
    status: string;
    data: string;
}

export type Autobus =
{
    id: string;
    linea: string;
    fermate: string[];
    orari: string[];
    calendario: string[];
}

export type EsercizioCommerciale =
{
    nome: string;
    coordinate: {
        lat: number;
        lng: number;
    };
    tipologia: string;
    orari: string[];
}

export type Taxi =
{
    id: string;
    nome: string;
    numeriTelefonici: string[];
    coordinate: {
        lat: number;
        lng: number;
    };
}

export type CasermaForzaOrdine =
{
    id: string;
    nome: string;
    coordinate: {
        lat: number;
        lng: number;
    };
}

export type InfoComunale =
{
    id: string;
    userId: string;
    informazione: string;
    tappa: Tappa;
    gradoSicurezzaAssegnato: number;
}

export type Itinerario =
{
    id: string;
    tappe: Tappa[];
    autobus: Autobus[];
    eserciziCommerciali: EsercizioCommerciale[];
    taxi: Taxi[];
    casermeForzeOrdine: CasermaForzaOrdine[];
    infoComunali: InfoComunale[];
    gradoSicurezzaTotale: number;
}


export type ContattoEmergenza =
{
    id: string;
    nominativo: string;
    numeroTelefonico: string;
}

export interface JWTPayload 
{
  id: string;
  email: string;  
  exp: number; // seconds since epoch
  [key: string]: any;
}

