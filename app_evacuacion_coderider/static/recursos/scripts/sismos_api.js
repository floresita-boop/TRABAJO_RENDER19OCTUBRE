// =====================================================
// SISMOS_API.JS
// Información de sismos recientes
// =====================================================

document.addEventListener(
    "mapaListo",
    function (evento) {

        const mapa = evento.detail.mapa;

        cargarSismos(mapa);

    }
);


// -----------------------------------------------------
// CARGAR SISMOS
// -----------------------------------------------------

function cargarSismos(mapa) {

    fetch(URL_API_SISMOS)

        .then(function (respuesta) {

            if (!respuesta.ok) {

                throw new Error(
                    "Error al consultar la API de sismos"
                );

            }

            return respuesta.json();

        })

        .then(function (datos) {

            mostrarSismos(
                mapa,
                datos
            );

        })

        .catch(function (error) {

            console.error(
                "No se pudieron cargar los sismos:",
                error
            );

        });

}


// -----------------------------------------------------
// MOSTRAR SISMOS
// -----------------------------------------------------

function mostrarSismos(mapa, datos) {

    if (
        !datos ||
        !datos.features
    ) {
        return;
    }


    datos.features.forEach(
        function (sismo) {

            if (
                !sismo.geometry ||
                !sismo.geometry.coordinates
            ) {
                return;
            }


            const longitud =
                sismo.geometry.coordinates[0];

            const latitud =
                sismo.geometry.coordinates[1];

            const profundidad =
                sismo.geometry.coordinates[2];


            const magnitud =
                sismo.properties.mag;

            const lugar =
                sismo.properties.place ??
                "Ubicación desconocida";


            const circulo =
                L.circleMarker(
                    [latitud, longitud],
                    {
                        radius:
                            calcularRadio(magnitud),

                        color: "#8e24aa",

                        fillColor: "#e53935",

                        fillOpacity: 0.65,

                        weight: 2
                    }
                )
                .addTo(mapa);


            circulo.bindPopup(
                "<strong>🌎 Sismo</strong><br><br>" +

                "📊 Magnitud: " +
                (magnitud ?? "N/D") +

                "<br>" +

                "📍 " +
                escaparTexto(lugar) +

                "<br>" +

                "🌊 Profundidad: " +
                (profundidad ?? "N/D") +
                " km"
            );

        }
    );

}


// -----------------------------------------------------
// TAMAÑO DEL CÍRCULO
// -----------------------------------------------------

function calcularRadio(magnitud) {

    if (!magnitud) {
        return 5;
    }

    return Math.max(
        5,
        Math.min(
            20,
            magnitud * 3
        )
    );

}


// -----------------------------------------------------
// SEGURIDAD
// -----------------------------------------------------

function escaparTexto(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        String(texto);

    return div.innerHTML;

}