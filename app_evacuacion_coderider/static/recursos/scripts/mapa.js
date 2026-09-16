document.addEventListener("DOMContentLoaded", function () {
    console.log("MAPA.JS CARGADO");

    const contenedor = document.getElementById("mapa");
    if (!contenedor) {
        console.error("NO EXISTE #mapa");
        return;
    }

    // 1. Inicializar el mapa centrado en Popayán
    const mapa = L.map("mapa").setView([2.4419, -76.6063], 15);
    
    // Guardar referencia global para que otros scripts puedan usarla
    window.mapaGlobal = mapa;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(mapa);

    // Forzar redibujado para evitar que el mapa aparezca gris
    setTimeout(function() {
        mapa.invalidateSize();
    }, 200);

    console.log("MAPA CREADO CORRECTAMENTE");

    // 2. Disparar evento de que el mapa ya está listo
    const eventoMapaListo = new CustomEvent("mapaListo", {
        detail: { mapa: mapa }
    });
    document.dispatchEvent(eventoMapaListo);

    // 3. Botón de Geolocalización y Ruta
    const btnRuta = document.getElementById("btn-ruta");
    let marcadorUsuario = null;

    if (btnRuta) {
        btnRuta.addEventListener("click", function () {
            if (!navigator.geolocation) {
                alert("Tu navegador no soporta geolocalización.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                function (posicion) {
                    const lat = posicion.coords.latitude;
                    const lng = posicion.coords.longitude;

                    mapa.setView([lat, lng], 17);

                    if (marcadorUsuario) {
                        marcadorUsuario.setLatLng([lat, lng]);
                    } else {
                        marcadorUsuario = L.marker([lat, lng]).addTo(mapa);
                    }

                    marcadorUsuario.bindPopup("🔴 <strong>¡Estás aquí! (Ubicación actual)</strong>").openPopup();
                },
                function (error) {
                    console.error("Error de geolocalización:", error);
                    alert("No se pudo obtener tu ubicación. Revisa los permisos.");
                },
                { enableHighAccuracy: true }
            );
        });
    }
});