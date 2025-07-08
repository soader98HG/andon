# Sistema Andon

Este proyecto implementa un sistema Andon completo compuesto por:

- **Backend** Node.js que expone una API REST y puentea eventos MQTT a WebSocket.
- **Dashboard** React para visualizar y operar incidencias en tiempo real.
- **Firmware** para ESP32 que escucha el estado de su estación vía MQTT.
- **Base de datos** PostgreSQL y corredor MQTT Mosquitto.

Los IDs de las estaciones son fijos: `A1, B1, C1, C2, C3, C4, C5`. Los únicos
estados permitidos son `verde`, `rojo` y `amarillo`.

## Puesta en marcha en Raspberry Pi 5

### 1 – Instalar servicios
```bash
sudo apt update
sudo apt install -y git nodejs npm postgresql mosquitto mosquitto-clients
```

### 2 – Crear usuario y base de datos
```bash
sudo -u postgres psql <<'SQL'
CREATE USER andon WITH PASSWORD 'soader98HG';
CREATE DATABASE andon OWNER andon;
SQL
```

### 3 – Configurar Mosquitto (con autenticación)

1.  **Crear el archivo de contraseñas y añadir el usuario `soader98`:**
    ```bash
    sudo mosquitto_passwd -c /etc/mosquitto/passwd soader98 soader98HG
    ```
    *   **Nota:** Si el archivo `/etc/mosquitto/passwd` ya existe y contiene otros usuarios, usar `-c` lo sobrescribirá. Si necesitas añadir usuarios a un archivo existente, omite `-c`.

2.  **Configurar Mosquitto para usar autenticación y deshabilitar acceso anónimo:**
    Crea un nuevo archivo de configuración para Mosquitto:
    ```bash
    sudo sh -c 'echo "allow_anonymous false" > /etc/mosquitto/conf.d/auth.conf'
    sudo sh -c 'echo "password_file /etc/mosquitto/passwd" >> /etc/mosquitto/conf.d/auth.conf'
    ```

3.  **Reiniciar el servicio Mosquitto:**
    ```bash
    sudo systemctl restart mosquitto
    ```

### 4 – Cargar el esquema SQL
```bash
psql -U andon -d andon -f db/setup.sql
```

### 5 – Back-end

1.  **Configurar el archivo `.env`:**
    Copia `.env` en `andon-server` con el siguiente contenido (asegúrate de que `MQTT_USER` y `MQTT_PASS` coincidan con las credenciales de Mosquitto):
    ```
    PG_URL=postgresql://andon:soader98HG@localhost:5432/andon
    MQTT_URL=mqtt://localhost:1883
    PORT=3000
    MQTT_USER=soader98
    MQTT_PASS=soader98HG
    ```

2.  **Instalar dependencias y ejecutar pruebas:**
    ```bash
    cd andon-server
    npm install
    npm test
    ```

3.  **Iniciar la API:**
    ```bash
    node index.js
    ```
    *   **Nota:** Para que el servidor sea accesible desde otros dispositivos en la red, asegúrate de que tu firewall permita el tráfico en el puerto 3000.

### 6 – Front-end

1.  **Instalar dependencias:**
    ```bash
    cd andon-client/andon-dashboard
    npm install
    ```

2.  **Iniciar el dashboard (modo desarrollo):**
    ```bash
    npm run dev -- --host
    ```
    *   Esto iniciará el servidor de desarrollo de Vite y lo hará accesible desde otros dispositivos en tu red. La URL será algo como `http://<IP_DE_TU_RASPBERRY_PI>:5173/`.

3.  **Configuración de entorno (opcional):**
    Por defecto, el dashboard contacta la API y el WebSocket en la misma dirección donde se sirve la página (puertos `3000` y `8080`). Si tu backend está en otra IP o puerto, crea un archivo `.env` en `andon-client/andon-dashboard` con por ejemplo:
    ```
    VITE_API_URL=http://mi-servidor:3000
    VITE_WS_URL=ws://mi-servidor:8080
    ```

4.  **Generar para producción:**
    ```bash
    npm run build
    ```
    *   Esto genera el directorio `dist/` para producción. Puedes servirlo con cualquier servidor estático (por ejemplo `npx serve dist`).

### 7 – Firmware ESP32

1.  **Abrir el archivo `.ino`:**
    Abre `esp32/station_template.ino` en el IDE de Arduino o PlatformIO.

2.  **Configurar credenciales y ID de estación:**
    Modifica las siguientes líneas con tus datos:
    ```cpp
    const char* ssid = "YOUR_SSID";       // Tu nombre de red WiFi
    const char* password = "YOUR_PASS";   // Tu contraseña de WiFi
    const char* mqttServer = "MQTT_BROKER_IP"; // La IP de tu Raspberry Pi (donde corre Mosquitto)
    const char* STATION_ID = "1";         // ID único para esta estación (ej. "A1", "B1", etc.)

    // LED Pins (Adjust these to your ESP32 board's GPIO pins)
    const int RED_LED_PIN = 2;    // Ejemplo GPIO pin para LED Rojo
    const int YELLOW_LED_PIN = 4; // Ejemplo GPIO pin para LED Amarillo
    const int GREEN_LED_PIN = 16; // Ejemplo GPIO pin para LED Verde
    ```
    *   **Importante:** Asegúrate de que `MQTT_BROKER_IP` sea la dirección IP de la Raspberry Pi donde está corriendo Mosquitto.
    *   **Ajusta los pines de los LEDs** (`RED_LED_PIN`, `YELLOW_LED_PIN`, `GREEN_LED_PIN`) a los pines GPIO reales de tu placa ESP32 donde tengas conectados los LEDs de la baliza.

3.  **Compilar y grabar:**
    Compila el sketch y grábalo en cada ESP32 con el ID de estación correspondiente.

### 8 – Sincronización y Estado Inicial

Todos los navegadores conectados al dashboard y los ESP32 recibirán actualizaciones en tiempo real a través de WebSocket y MQTT.

*   **Estado Inicial del ESP32:** Al conectarse al broker MQTT, el ESP32 publicará un mensaje en `andon/station/<ID>/request_state`. El servidor Node.js escuchará esta solicitud, consultará el estado actual de la estación en la base de datos y publicará el color correspondiente (`rojo`, `amarillo`, `verde`) en `andon/station/<ID>/state`. Esto asegura que la baliza del ESP32 refleje el estado correcto desde el inicio.
*   **Actualizaciones en Tiempo Real:** Al cerrar una incidencia, cambiar su estado a reproceso, o crear una nueva, el servidor publica el estado actualizado en `andon/station/<ID>/state` para que la baliza se actualice.

---

Con estos pasos el sistema queda listo para operar en la Raspberry Pi 5.