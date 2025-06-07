// Cambia questo flag a seconda dell'ambiente
import {USE_PRODUCTION} from "@env";

export const API_BASE_URL = USE_PRODUCTION
  ? "https://securcity.onrender.com"
  : "http://10.0.2.2:3000"; // localhost per emulatori Android
