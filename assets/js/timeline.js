$(document).ready(function() {
    function fetchTimelineData(startYear, endYear) {
        fetchPersonnagesData(startYear, endYear);
        fetchReseauxData(startYear, endYear);
        fetchLieuxData(startYear, endYear);
    }

    function fetchPersonnagesData(startYear, endYear) {
        Papa.parse('assets/csv/personnages.csv', {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data.filter(item => {
                    const date = parseInt(item.Date);
                    return date >= startYear && date <= endYear;
                });
                displayBiographies(data);
            }
        });
    }

    function fetchReseauxData(startYear, endYear) {
        d3.csv('assets/csv/reseaux.csv').then(function(results) {
            const data = results.filter(item => {
                const date = parseInt(item.Date);
                return date >= startYear && date <= endYear;
            });
            document.dispatchEvent(new CustomEvent('timelineFilter', { detail: { data: data } }));
        }).catch(function(error) {
            console.error("Erreur lors du chargement du fichier CSV :", error);
        });
    }

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
                        const data = results.data.filter(item => {
                            const [startDate, endDate] = item.Date.split('-').map(Number);
                            return (startDate <= endYear && endDate >= startYear);
                        });
                        addMarkers(data);
                    },
                    error: function(error) {
                        console.error('Erreur de parsing:', error);
                    }
                });
            })
            .catch(error => console.error('Erreur de chargement du fichier CSV:', error));
    }

    $('.timeline-point, .timeline-section').on('click', function() {
        const startYear = $(this).data('start-year');
        const endYear = $(this).data('end-year');
        fetchTimelineData(startYear, endYear);
    });

    document.addEventListener('timelineFilter', function(event) {
        const data = event.detail.data;
        drawNetwork(data);
    });
});
