const request = require("supertest");
const app = require("../app");

const axios = require("axios");
const Itinerario = require("../models/itinerarioModel");
const Sensore = require("../models/sensoreAffollamentoModel");
const Segnalazione = require("../models/segnalazioneModel");

jest.mock("axios");
jest.mock("../models/itinerarioModel");
jest.mock("../models/sensoreAffollamentoModel");
jest.mock("../models/segnalazioneModel");

describe("POST /api/v1/itinerario/percorso-sicuro", () => {
  const partenza = {
    nome: "Punto di partenza",
    coordinate: [12.4924, 41.8902], // Colosseo, Roma
  };
  const destinazione = {
    nome: "Punto di arrivo",
    coordinate: [12.4964, 41.9028], // Fontana di Trevi, Roma
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_MAPS_API_KEY = "fake-api-key";
  });

  test("should return a 400 if coordinates are missing", async () => {
    const res = await request(app)
      .post("/api/v1/itinerario/percorso-sicuro")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Coordinate mancanti.");
  });

  test("should return 200 with fallback message if few safe stops or low score", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        routes: [
          {
            legs: [
              {
                steps: [
                  {
                    end_location: { lat: 41.891, lng: 12.492 },
                  },
                  {
                    end_location: { lat: 41.892, lng: 12.493 },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    axios.get.mockResolvedValueOnce({
      data: { results: [] }, // Nearby stores
    });

    Segnalazione.find.mockResolvedValue([]);
    Sensore.find.mockResolvedValue([]);

    const res = await request(app)
      .post("/api/v1/itinerario/percorso-sicuro")
      .send({ partenza, destinazione });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Percorso non abbastanza sicuro/);
    expect(res.body.itinerario).toBe(null);
  });

  test("should generate a secure path and save itinerary", async () => {
    // Step 1: Directions API
    axios.get.mockResolvedValueOnce({
      data: {
        routes: [
          {
            legs: [
              {
                steps: [
                  {
                    end_location: { lat: 41.891, lng: 12.492 },
                  },
                  {
                    end_location: { lat: 41.892, lng: 12.493 },
                  },
                  {
                    end_location: { lat: 41.893, lng: 12.494 },
                  },
                  {
                    end_location: { lat: 41.894, lng: 12.495 },
                  },
                  {
                    end_location: { lat: 41.895, lng: 12.496 },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    // Step 2: Places API (esercizi commerciali)
    axios.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            name: "Negozio Sicuro",
            geometry: {
              location: { lat: 41.8911, lng: 12.4921 },
            },
            vicinity: "Via Esempio 1",
          },
        ],
      },
    });

    // Step 3: Sensori e Segnalazioni
    Sensore.find.mockResolvedValue([
      {
        coordinate: [12.4922, 41.8912],
        affollamentoCalcolato: 75,
      },
    ]);

    Segnalazione.find.mockResolvedValue([]);

    // Step 4: Reverse Geocoding (for each safe tappa)
    axios.get.mockResolvedValue({
      data: {
        results: [{ formatted_address: "Via Sicura" }],
      },
    });

    // Step 5: Save to DB
    Itinerario.create.mockResolvedValue({
      tappe: [],
      gradoSicurezzaTotale: "Alto",
    });

    const res = await request(app)
      .post("/api/v1/itinerario/percorso-sicuro")
      .send({ partenza, destinazione });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Percorso sicuro generato con successo");
    expect(Itinerario.create).toHaveBeenCalled();
    expect(res.body.itinerario).toBeDefined();
  });

  test("should handle internal server errors", async () => {
    axios.get.mockRejectedValueOnce(new Error("API failure"));

    const res = await request(app)
      .post("/api/v1/itinerario/percorso-sicuro")
      .send({ partenza, destinazione });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Errore interno");
  });
});
