import admin from 'firebase-admin';

const serviceAccount = {
  type: "service_account",
  project_id: "livraison-c8498",
  private_key_id: "31764019e8e6ac83c8d090805fdb4f27a1e5681a",
  private_key: process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDTTuTn9q9irKZw\nlw3Cii2ocfTDks8Qib3S+R8hRKRxd3aW9JeTqRA3C64Lv8AZdbUMNiPReJZDXUXP\nS9XKZhnyJATqKt2aCaLyhs4vskzE4xxmPD2J1HnaTNPiwaPvOvpC3hU247kJYmrh\nwuEUnADCWpe3tgjBY1LKSSXxrEgW0hv+zzfOfZIrc8cG77IRZlVNX3ycZw6NWApP\nzzOj3qFNtEbS8MEvLAFKunZIftJDzEHdmsMVNSvqaN6eYUK5KMF3ytg9yuOBc0TS\nVjLQDbR2/uMOx4Jv+D8vK/gvDMRBHP3DggN8Rm/YSJ3Wm7BNh3JFUWrjEmHYDDdW\nVijj4ZhjAgMBAAECggEAB/zoShz8oWuD2W5o1qQoI0E3HO/GXTUgrVfL+uiHRKbO\nrZ/ATyLJwVrzHwyUgej9wlLASIwZNoUmrv1RdjMlOJzgoVn5QlvGrULSp3AKZVaJ\n3YTaIAUr4vMMxiUcCQk7Yx6c+ulvxLQMu9tobF4/IYuCgBLPrUC6SM8d+RZED2C4\nJtenm7wjhxFaFZZf45SsGTw1KUuwoYHtt0OoTdHoQYwswmZbz1mx1rEbHfvI6/tH\n/V6vkTuAF36HqQlyy40Y7Dun3kBiIlVNPMEhDAaDzzKuM513hMr61025wZ4uqi1E\nIf8jdXMOl5f3mic6HMPKNx+3zkDEwOoveIj3ZK2j4QKBgQDqhG1BA5zO2Hb+QED/\ntqZyl6PWlUnfSwaMZnxrMAh8oGwIAKTTDe1SE1YjPQ+Ff9AnfKmt4g3LO9Z3tu/7\n1CSr/Jmz0hvjo1KaV88yKQFA11ZaD3/CPt35ZjuI9m/Ro52SXkH3c6i+sV9uEFp3\nctXfl3KPqz4CQKpYqHsK9hOncQKBgQDmqjMYsO7qU/bd/QuQ79WhRpK+0krI4dzr\n4gpBAN/t1E8LizEZeqfPriBc676uKcThcbcP/ugX4//TjRKqNVy3jW74bwKZ9DUI\nRow8URNVpwwyshdDOYksqzlqUUr523hE4gBqiI6UBoKUlHF8Ok8fT9VkN3uzv342\nQOAkRNdbEwKBgCt/vLQec2t6gzfNu0CzJFSFBAK9ViJwzBomuFU5Z5mWN/OUCv6K\nysY6h/OpU8OzXWy1ltOF5oEX7EPwTrsrMlIkXG4aPsoOdTfjqa7oJC9ewcmarlvd\nRVcJO2nALCV6b7PCgAHiFh6oz8aeiek2B62dbcZwQOQyEma3eXsjAapBAoGAfSvn\nRoLdY7Pkx1pGKIS9vSL7Byo/AvvuUuL7BYNgAUOxEWabYmQ5JG4tib80Xna0LFL1\nMGz3rd9AOKDZfBwxEDpj+dTj6H+pN7Bw8Vpdz6Ey8V/LV+OlGORh59vtf+ElRtwN\ntcIc/R77RX24h91simVcO2IQct57sx1JhOUGqJkCgYBqxF/BN9dHfsULs5HlrrXD\nFIRyMKiggMaKTnLLz7y7fs5SNtvQ+PQzq3ZZ83OPV55eUkf0dbfb/1QLwobFDdqU\nG6uxFkY1VhzxFwcUYtnPX8le+6FSJSThQ/Fgy1Mh3WpuI5d6xpBqPSWdYi0io2LP\nbe1ZpCiN6gnjiOGdztJ20g==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@livraison-c8498.iam.gserviceaccount.com",
  client_id: "114335306450823773837",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40livraison-c8498.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://livraison-c8498-default-rtdb.firebaseio.com"
  });
}

export const db = admin.firestore();
export const messaging = admin.messaging();
export default admin;
