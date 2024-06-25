$(document).ready(function() {
    // Créer la carte
    var map = L.map('map').setView([34.63908194940235, 37.9294664934], 7);

    // Afficher la carte
    L.tileLayer('https://api.mapbox.com/styles/v1/yohoho/clffvxs9y002f01p4s3c59upu/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieW9ob2hvIiwiYSI6ImNqZHo4MHdlbzRuZWsycXFvYno4aGU2eW0ifQ.vY_xI_fFfGZZVAHQeK0SvA', {
        maxZoom: 18,
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>"
    }).addTo(map);

    var markers = [];
    var allData = [];

    // Fonction pour ajuster la taille des icônes en fonction du niveau de zoom
    function resizeIcons() {
        var zoomLevel = map.getZoom();
        var iconSize = Math.max(10, zoomLevel * 3); // Ajustez ce facteur selon vos besoins

        markers.forEach(function(marker) {
            var icon = marker.options.icon;
            icon.options.iconSize = [iconSize, iconSize];
            marker.setIcon(icon);
        });
    }

    // Création des icônes
    function createIcon(iconUrl) {
        return L.icon({
            iconUrl: iconUrl,
            iconSize: [21, 21] // Taille initiale
        });
    }

    var iconCentresCulturels = createIcon('assets/img/centre.png');
    var iconEcoles = createIcon('assets/img/ecole.png');
    var iconCollege = createIcon('assets/img/college.png');
    var iconLycee = createIcon('assets/img/lycee.png');
    var iconUniversite = createIcon('assets/img/university.png');
    var iconBibliotheque = createIcon('assets/img/library.png');
    var iconMusee = createIcon('assets/img/musee.png');
    var iconFouilles = createIcon('assets/img/fouilles.png');
    var defaultIcon = createIcon('assets/img/office.png');

    // Fonction pour ajouter des marqueurs sur la carte
    function addMarkers(data) {
        // Supprimer les marqueurs existants de la carte
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        data.forEach(function(row) {
            var latitude = parseFloat(row.Latitude);
            var longitude = parseFloat(row.Longitude);
            var name = row.Lieu;
            var info = row.Informations;
            var photo = row.Photo;
            var icon;

            // Déterminer l'icône en fonction du type de lieu
            if (name.includes("Centre Culturel") || name.includes("Institut")) {
                icon = iconCentresCulturels;
            } else if (name.includes("École")) {
                icon = iconEcoles;
            } else if (name.includes("Collège")) {
                icon = iconCollege;
            } else if (name.includes("Lycée")) {
                icon = iconLycee;
            } else if (name.includes("Université")) {
                icon = iconUniversite;
            } else if (name.includes("Bibliothèque")) {
                icon = iconBibliotheque;
            } else if (name.includes("Musée")) {
                icon = iconMusee;
            } else if (name.includes("Fouille")) {
                icon = iconFouilles;
            } else {
                icon = defaultIcon;
            }

            // Ajouter un marqueur sur la carte
            var marker = L.marker([latitude, longitude], { icon: icon }).addTo(map)
                .bindPopup("<b>" + name + "</b><br>" + info + "<br><img src='" + photo + "' alt='" + name + "' width='100'>");
            markers.push(marker);
        });

        resizeIcons(); // Ajuster les icônes immédiatement après l'ajout des marqueurs
    }

    // Fonction pour récupérer et analyser le fichier CSV
    function fetchLieuxData(startYear, endYear) {
        fetch('assets/csv/lieux.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    complete: function(results) {
                        allData = results.data;
                        updateMarkers(startYear, endYear);
                    },
                    error: function(error) {
                        console.error('Erreur de parsing:', error);
                    }
                });
            })
            .catch(error => console.error('Erreur de chargement du fichier CSV:', error));
    }

    function updateMarkers(startYear, endYear) {
        const data = allData.filter(item => {
            const date = parseInt(item.Date);
            return date >= startYear && date <= endYear;
        });
        addMarkers(data);
    }

    // Variable pour stocker l'année actuelle
    let currentEndYear = 0;

    // Afficher initialement les lieux pour la première période par défaut
    const defaultStartYear = 1945;
    const defaultEndYear = 1946;
    fetchLieuxData(defaultStartYear, defaultEndYear);

    // Écouter les événements de zoom pour ajuster les icônes
    map.on('zoomend', resizeIcons);

    // ----------------------- Timeline Functionality --------------------------

    $('.timeline-point, .timeline-section').on('click', function() {
        const startYear = $(this).data('start-year');
        const endYear = $(this).data('end-year');
        
        // Mettre à jour les marqueurs en fonction de la nouvelle période
        updateMarkers(defaultStartYear, endYear);
        
        // Mettre à jour l'année actuelle
        currentEndYear = endYear;
    });
});
