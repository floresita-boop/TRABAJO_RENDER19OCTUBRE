document.addEventListener("DOMContentLoaded", function () {
    console.log("PUNTOS_ENCUENTRO.JS CARGADO");

    // Esperar a que el mapa esté completamente creado
    document.addEventListener("mapaListo", function (e) {
        const mapa = e.detail.mapa;
        const btnPuntos = document.getElementById("btn-puntos");
        const contenedorLista = document.getElementById("lista-puntos");
        const infoInstitucion = document.getElementById("info-institucion");

        if (infoInstitucion) {
            infoInstitucion.innerHTML = "<strong>Institución CodeRider:</strong> Sistema de gestión de puntos de encuentro activo.";
        }

        // Crear una capa para los marcadores de los puntos
        let marcadoresCapa = L.layerGroup().addTo(mapa);

        if (btnPuntos) {
            btnPuntos.addEventListener("click", function () {
                console.log("Cargando puntos desde:", URL_JSON);
                
                fetch(URL_JSON)
                    .then(response => {
                        if (!response.ok) throw new Error("No se pudo cargar el archivo JSON de puntos");
                        return response.json();
                    })
                    .then(data => {
                        marcadoresCapa.clearLayers();
                        if (contenedorLista) contenedorLista.innerHTML = "";

                        // Soporta tanto si el JSON es un array directo como si tiene la clave "puntos"
                        const puntos = Array.isArray(data) ? data : (data.puntos || []);

                        if (puntos.length === 0) {
                            alert("El archivo JSON está vacío o no tiene el formato correcto.");
                            return;
                        }

                        puntos.forEach((punto) => {
                            // 1. Agregar marcador rojo o azul al mapa con Leaflet
                            const marker = L.marker([punto.lat, punto.lng])
                                .bindPopup(`<strong>${punto.nombre}</strong><br>${punto.descripcion}`);
                            
                            marcadoresCapa.addLayer(marker);

                            // 2. Crear la tarjeta visual en el HTML debajo del mapa
                            if (contenedorLista) {
                                const tarjetaPunto = document.createElement("div");
                                tarjetaPunto.className = "punto-encuentro";
                                tarjetaPunto.innerHTML = `
                                    <h3>📍 ${punto.nombre}</h3>
                                    <p>${punto.descripcion}</p>
                                    <button type="button" onclick="centrarPunto(${punto.lat}, ${punto.lng})">Ver en el mapa</button>
                                `;
                                contenedorLista.appendChild(tarjetaPunto);
                            }
                        });

                   
                    })
                    .catch(error => {
                        console.error("Error al cargar puntos:", error);
                        alert("Error al cargar los puntos de encuentro. Revisa la ruta en la consola (F12).");
                    });
            });
        }
    });
});

// Función global para que las tarjetas puedan mover el mapa al hacer clic
function centrarPunto(lat, lng) {
    if (window.mapaGlobal) {
        window.mapaGlobal.setView([lat, lng], 17);
    }
}