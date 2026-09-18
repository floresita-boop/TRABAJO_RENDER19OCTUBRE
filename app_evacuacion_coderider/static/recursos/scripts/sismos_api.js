// =====================================================
// SISMOS_API.JS - Actualizado con Capa Propia
// =====================================================

// Capa global para almacenar los círculos de los sismos
window.capaSismosGlobal = null;

document.addEventListener(
    "mapaListo",
    function (evento) {
        const mapa = evento.detail.mapa;
        cargarSismos(mapa);
    }
);

function cargarSismos(mapa) {
    fetch(URL_API_SISMOS)
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("Error al consultar la API de sismos");
            }
            return respuesta.json();
        })
        .then(function (datos) {
            mostrarSismos(mapa, datos);
        })
        .catch(function (error) {
            console.error("No se pudieron cargar los sismos:", error);
        });
}

function mostrarSismos(mapa, datos) {
    if (!datos || !datos.features) {
        return;
    }

    // Crear el grupo de capas para los sismos si no existe
    if (!window.capaSismosGlobal) {
        window.capaSismosGlobal = L.layerGroup();
    } else {
        window.capaSismosGlobal.clearLayers();
    }

    datos.features.forEach(function (sismo) {
        if (!sismo.geometry || !sismo.geometry.coordinates) {
            return;
        }

        const longitud = sismo.geometry.coordinates[0];
        const latitud = sismo.geometry.coordinates[1];
        const profundidad = sismo.geometry.coordinates[2];
        const magnitud = sismo.properties.mag;
        const lugar = sismo.properties.place ?? "Ubicación desconocida";

        const circulo = L.circleMarker([latitud, longitud], {
            radius: calcularRadio(magnitud),
            color: "#8e24aa",
            fillColor: "#e53935",
            fillOpacity: 0.65,
            weight: 2
        });

        circulo.bindPopup(
            "<strong>🌎 Sismo</strong><br><br>" +
            "📊 Magnitud: " + (magnitud ?? "N/D") + "<br>" +
            "📍 " + escaparTexto(lugar) + "<br>" +
            "🌊 Profundidad: " + (profundidad ?? "N/D") + " km"
        );

        // Añadir el círculo a la capa de sismos
        window.capaSismosGlobal.addLayer(circulo);
    });

    // Añadir la capa completa al mapa
    window.capaSismosGlobal.addTo(mapa);
}

function calcularRadio(magnitud) {
    if (!magnitud) {
        return 5;
    }
    return Math.max(5, Math.min(20, magnitud * 3));
}

function escaparTexto(texto) {
    const div = document.createElement("div");
    div.textContent = String(texto);
    return div.innerHTML;
}