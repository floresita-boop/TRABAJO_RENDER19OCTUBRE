// =====================================================
// TABLA_CSV.JS
// Tabla de extintores CodeRider
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarCSV();

    }
);


// -----------------------------------------------------
// CARGAR CSV
// -----------------------------------------------------

function cargarCSV() {

    fetch(URL_CSV)

        .then(function (respuesta) {

            if (!respuesta.ok) {

                throw new Error(
                    "No se pudo cargar extintores.csv"
                );

            }

            return respuesta.text();

        })

        .then(function (texto) {

            crearTablaCSV(texto);

        })

        .catch(function (error) {

            console.error(
                "Error cargando CSV:",
                error
            );

        });

}


// -----------------------------------------------------
// CREAR TABLA
// -----------------------------------------------------

function crearTablaCSV(texto) {

    const lineas =
        texto
            .trim()
            .split(/\r?\n/);


    if (lineas.length === 0) {
        return;
    }


    // Detectar separador
    const primeraLinea =
        lineas[0];

    let separador = ",";

    if (
        primeraLinea.includes(";")
    ) {
        separador = ";";
    }


    const encabezados =
        dividirCSV(
            lineas[0],
            separador
        );


    const tabla =
        document.createElement("table");

    tabla.className =
        "tabla-csv";


    // -------------------------------------------------
    // ENCABEZADO
    // -------------------------------------------------

    const thead =
        document.createElement("thead");

    const filaEncabezado =
        document.createElement("tr");


    encabezados.forEach(
        function (encabezado) {

            const th =
                document.createElement("th");

            th.textContent =
                encabezado.trim();

            filaEncabezado.appendChild(th);

        }
    );


    thead.appendChild(
        filaEncabezado
    );

    tabla.appendChild(thead);


    // -------------------------------------------------
    // CUERPO
    // -------------------------------------------------

    const tbody =
        document.createElement("tbody");


    for (
        let i = 1;
        i < lineas.length;
        i++
    ) {

        if (
            lineas[i].trim() === ""
        ) {
            continue;
        }


        const valores =
            dividirCSV(
                lineas[i],
                separador
            );


        const fila =
            document.createElement("tr");


        encabezados.forEach(
            function (_, indice) {

                const td =
                    document.createElement("td");

                td.textContent =
                    valores[indice] ??
                    "";

                fila.appendChild(td);

            }
        );


        tbody.appendChild(fila);

    }


    tabla.appendChild(tbody);


    // -------------------------------------------------
    // COLOCAR TABLA EN LA PÁGINA
    // -------------------------------------------------

    const seccion =
        document.createElement("section");

    seccion.className =
        "tarjeta tabla-seccion";


    const titulo =
        document.createElement("h2");

    titulo.textContent =
        "🧯 Tabla de extintores CodeRider";


    seccion.appendChild(titulo);


    seccion.appendChild(tabla);


    document
        .querySelector("main")
        .appendChild(seccion);

}


// -----------------------------------------------------
// DIVIDIR CSV
// -----------------------------------------------------

function dividirCSV(
    linea,
    separador
) {

    const resultado = [];

    let actual = "";

    let dentroComillas = false;


    for (
        let i = 0;
        i < linea.length;
        i++
    ) {

        const caracter =
            linea[i];


        if (
            caracter === '"'
        ) {

            dentroComillas =
                !dentroComillas;

            continue;

        }


        if (
            caracter === separador &&
            !dentroComillas
        ) {

            resultado.push(
                actual.trim()
            );

            actual = "";

        } else {

            actual += caracter;

        }

    }


    resultado.push(
        actual.trim()
    );


    return resultado;

}