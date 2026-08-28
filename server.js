// Ładowanie oficjalnego rdzenia noVNC z niezawodnej chmury CDN (Działa bezbłędnie na Kindle!)
import RFB from 'https://jsdelivr.net';

let rfb;

// Funkcja do wyciągania parametrów hosta i portu z paska adresu URL
function getQueryParam(name, defaultValue) {
    const re = new RegExp('.*[?&]' + name + '=([^&#]*)');
    const match = document.location.href.match(re);
    if (match) {
        return decodeURIComponent(match[1]);
    }
    return defaultValue;
}

function initVNC() {
    // 1. Automatycznie czytamy bezpieczny host z Pinggy podany w linku
    const host = getQueryParam('host', '');
    const port = getQueryParam('port', '443');
    const password = getQueryParam('password', '1234'); // Hasło ustawione w UltraVNC

    if (!host) {
        console.error("Błąd: Brak podanego parametru ?host= w pasku adresu URL!");
        return;
    }

    // 2. Budujemy bezpieczny adres URL w standardzie wss:// wymagany przez Render i Chrome
    const wsUrl = `wss://${host}:${port}`;
    console.log("Łączenie z bezpiecznym tunelem wideo: " + wsUrl);

    // 3. Inicjalizacja sprzętowego połączenia z UltraVNC przez Websockify
    rfb = new RFB(document.getElementById('vnc-container'), wsUrl, {
        credentials: { password: password }
    });

    // 4. Wymuszamy pełne, automatyczne skalowanie widoku pod wielkość ekranu urządzenia
    rfb.scaleViewport = true;
    rfb.resizeSession = true;

    // Obsługa zdarzeń statusu połączenia w konsoli przeglądarki
    rfb.addEventListener("connect", () => {
        console.log("Sukces! Połączono online przez bezpieczny tunel VNC!");
    });

    rfb.addEventListener("disconnect", (e) => {
        console.log("Połączenie VNC zostało zamknięte: ", e.detail.reason);
    });
}

// Uruchamiamy system natychmiast po załadowaniu struktury HTML witryny
window.addEventListener('load', initVNC);
