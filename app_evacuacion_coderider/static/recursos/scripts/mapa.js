// =====================================================
// MAPA.JS - CodeRider
// Mapa + puntos + sismos + geolocalización + ruta
// =====================================================

console.log("MAPA.JS CARGADO");

// =====================================================
// 1. CREAR MAPA
// =====================================================

const mapa = L.map("mapa").setView([2.4419, -76.6063], 15);

// Guardar mapa globalmente
window.mapaGlobal = mapa;

// =====================================================
// 2. MAPA BASE
// =====================================================

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(mapa);

// Corregir tamaño del mapa
setTimeout(function () {
    mapa.invalidateSize();
}, 500);

console.log("MAPA CREADO CORRECTAMENTE");

// =====================================================
// 3. CAPA DE PUNTOS DE ENCUENTRO
// =====================================================

window.capaPuntosEncuentro = L.layerGroup().addTo(mapa);

// =====================================================
// 4. CARGAR PUNTOS DE ENCUENTRO
// =====================================================

function cargarPuntosEnMapa() {

    console.log("Cargando puntos de encuentro...");

    fetch(URL_JSON)

        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "No se pudo cargar el archivo JSON de puntos."
                );
            }

            return response.json();
        })

        .then(function (data) {

            window.capaPuntosEncuentro.clearLayers();

            data.forEach(function (punto) {

                const marker = L.marker([
                    punto.lat,
                    punto.lng
                ]);

                marker.bindPopup(`
                    <div style="text-align:center;">
                        <strong>${punto.nombre}</strong>
                        <br>
                        <p style="margin:5px 0;">
                            ${punto.descripcion}
                        </p>
                        <span style="
                            color:green;
                            font-weight:bold;
                        ">
                            Estado: ${punto.estado}
                        </span>
                    </div>
                `);

                window.capaPuntosEncuentro.addLayer(marker);
            });

            console.log(
                "Puntos de encuentro cargados correctamente:",
                data.length
            );
        })

        .catch(function (error) {

            console.error(
                "Error cargando puntos de encuentro:",
                error
            );
        });
}

// Ejecutar carga
cargarPuntosEnMapa();

// =====================================================
// 5. EVENTO MAPA LISTO
// =====================================================
// IMPORTANTE:
// Se utiliza setTimeout para permitir que los demás
// archivos JS registren primero el evento "mapaListo".

setTimeout(function () {

    const eventoMapaListo = new CustomEvent(
        "mapaListo",
        {
            detail: {
                mapa: mapa
            }
        }
    );

    document.dispatchEvent(eventoMapaListo);

    console.log("Evento mapaListo enviado.");

}, 100);

// =====================================================
// 6. VARIABLES DE RUTA
// =====================================================

const btnRuta = document.getElementById("btn-ruta");

let marcadorUsuario = null;
let capaRuta = null;
let capaRutaGeoJSON = null;

// =====================================================
// 7. DESTINO DE EVACUACIÓN
// =====================================================

const latDestino = 2.4410;
const lngDestino = -76.6060;

// =====================================================
// 8. CARGAR RUTA DESDE GEOJSON
// =====================================================

function cargarRutaGeoJSON() {

    console.log("Cargando ruta.geojson...");

    fetch(URL_GEO)

        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "No se pudo cargar ruta.geojson"
                );
            }

            return response.json();
        })

        .then(function (data) {

            // Eliminar únicamente la ruta GeoJSON anterior
            if (capaRutaGeoJSON) {
                mapa.removeLayer(capaRutaGeoJSON);
            }

            capaRutaGeoJSON = L.geoJSON(data, {

                // Mostrar solamente la línea de ruta.
                // Los puntos PE-01 y PE-02 seguirán
                // siendo manejados por su propia capa.
                filter: function (feature) {

                    return (
                        feature.geometry &&
                        feature.geometry.type === "LineString"
                    );
                },

                style: function () {

                    return {
                        color: "#2563eb",
                        weight: 6,
                        opacity: 0.85,
                        lineCap: "round",
                        lineJoin: "round"
                    };
                }
            }).addTo(mapa);

            // Poner la ruta encima del mapa
            capaRutaGeoJSON.bringToFront();

            console.log(
                "Ruta GeoJSON mostrada correctamente."
            );

            // Mantener puntos visibles
            if (
                window.capaPuntosEncuentro &&
                !mapa.hasLayer(window.capaPuntosEncuentro)
            ) {
                window.capaPuntosEncuentro.addTo(mapa);
            }

            // Mantener sismos visibles
            if (
                window.capaSismosGlobal &&
                !mapa.hasLayer(window.capaSismosGlobal)
            ) {
                window.capaSismosGlobal.addTo(mapa);
            }
        })

        .catch(function (error) {

            console.error(
                "Error cargando ruta.geojson:",
                error
            );
        });
}

// =====================================================
// 9. RUTA POR CALLES CON OSRM
// =====================================================

function calcularRutaOSRM(
    latOrigen,
    lngOrigen
) {

    console.log(
        "Calculando ruta por calles..."
    );

    const urlOSRM =
        "https://router.project-osrm.org/route/v1/driving/" +
        `${lngOrigen},${latOrigen};` +
        `${lngDestino},${latDestino}` +
        "?overview=full&geometries=geojson";

    console.log(
        "Consultando OSRM:",
        urlOSRM
    );

    fetch(urlOSRM)

        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "Error HTTP de OSRM."
                );
            }

            return response.json();
        })

        .then(function (data) {

            console.log(
                "Respuesta de OSRM:",
                data
            );

            if (
                data.code !== "Ok" ||
                !data.routes ||
                data.routes.length === 0
            ) {

                throw new Error(
                    "OSRM no encontró una ruta."
                );
            }

            // Coordenadas de OSRM vienen como:
            // [longitud, latitud]

            const coordenadasRuta =
                data.routes[0].geometry.coordinates.map(
                    function (coord) {

                        return [
                            coord[1],
                            coord[0]
                        ];
                    }
                );

            // Eliminar solamente la ruta anterior
            if (capaRuta) {
                mapa.removeLayer(capaRuta);
            }

            // Dibujar ruta
            capaRuta = L.polyline(
                coordenadasRuta,
                {
                    color: "#2563eb",
                    weight: 6,
                    opacity: 0.85,
                    lineCap: "round",
                    lineJoin: "round"
                }
            ).addTo(mapa);

            // Ruta encima de los elementos
            capaRuta.bringToFront();

            console.log(
                "RUTA POR CALLES MOSTRADA CORRECTAMENTE."
            );

            // =================================================
            // IMPORTANTE:
            // NO usamos fitBounds().
            //
            // Así no alejamos/acercamos el mapa de manera
            // brusca y no desaparecen visualmente los puntos
            // de sismos de la segunda imagen.
            // =================================================

            // Mantener puntos de encuentro
            if (
                window.capaPuntosEncuentro &&
                !mapa.hasLayer(window.capaPuntosEncuentro)
            ) {

                window.capaPuntosEncuentro.addTo(mapa);
            }

            // Mantener sismos
            if (
                window.capaSismosGlobal &&
                !mapa.hasLayer(window.capaSismosGlobal)
            ) {

                window.capaSismosGlobal.addTo(mapa);
            }
        })

        .catch(function (error) {

            console.error(
                "OSRM no pudo calcular la ruta:",
                error
            );

            console.log(
                "Se utilizará ruta.geojson como respaldo."
            );

            // Si OSRM falla, utilizar tu GeoJSON
            cargarRutaGeoJSON();
        });
}

// =====================================================
// 10. BOTÓN MOSTRAR RUTA
// =====================================================

if (btnRuta) {

    btnRuta.addEventListener(
        "click",
        function () {

            console.log(
                "================================="
            );

            console.log(
                "BOTÓN MOSTRAR RUTA PRESIONADO"
            );

            console.log(
                "================================="
            );

            // =================================================
            // UBICACIÓN
            // =================================================

            function procesarUbicacion(
                lat,
                lng,
                esSimulado
            ) {

                console.log(
                    "Ubicación utilizada:",
                    lat,
                    lng
                );

                // Centrar en la ubicación del usuario
                mapa.setView(
                    [lat, lng],
                    16
                );

                // =================================================
                // MARCADOR DEL USUARIO
                // =================================================

                if (marcadorUsuario) {

                    marcadorUsuario.setLatLng([
                        lat,
                        lng
                    ]);

                } else {

                    marcadorUsuario = L.marker([
                        lat,
                        lng
                    ]).addTo(mapa);
                }

                // =================================================
                // POPUP
                // =================================================

                if (esSimulado) {

                    marcadorUsuario
                        .bindPopup(
                            "📍 <strong>¡Ubicación Simulada en Popayán!</strong>"
                        )
                        .openPopup();

                } else {

                    marcadorUsuario
                        .bindPopup(
                            "🔴 <strong>¡Estás aquí! (Ubicación actual)</strong>"
                        )
                        .openPopup();
                }

                // =================================================
                // CALCULAR RUTA
                // =================================================

                calcularRutaOSRM(
                    lat,
                    lng
                );

                // =================================================
                // ASEGURAR CAPAS
                // =================================================

                if (
                    window.capaPuntosEncuentro &&
                    !mapa.hasLayer(
                        window.capaPuntosEncuentro
                    )
                ) {

                    window.capaPuntosEncuentro.addTo(mapa);
                }

                if (
                    window.capaSismosGlobal &&
                    !mapa.hasLayer(
                        window.capaSismosGlobal
                    )
                ) {

                    window.capaSismosGlobal.addTo(mapa);
                }
            }

            // =================================================
            // COMPROBAR GEOLOCALIZACIÓN
            // =================================================

            if (!navigator.geolocation) {

                console.warn(
                    "Este navegador no soporta geolocalización."
                );

                // Ubicación simulada
                procesarUbicacion(
                    2.4430,
                    -76.6080,
                    true
                );

                return;
            }

            // =================================================
            // OBTENER UBICACIÓN REAL
            // =================================================

            navigator.geolocation.getCurrentPosition(

                function (posicion) {

                    console.log(
                        "GPS OBTENIDO CORRECTAMENTE"
                    );

                    procesarUbicacion(
                        posicion.coords.latitude,
                        posicion.coords.longitude,
                        false
                    );
                },

                function (error) {

                    console.warn(
                        "No se pudo obtener GPS:",
                        error.message
                    );

                    console.log(
                        "Usando ubicación simulada en Popayán."
                    );

                    procesarUbicacion(
                        2.4430,
                        -76.6080,
                        true
                    );
                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    );

} else {

    console.error(
        "ERROR: No existe el botón #btn-ruta"
    );
}

// =====================================================
// 11. FINAL
// =====================================================

console.log(
    "MAPA.JS CARGADO COMPLETAMENTE."
);