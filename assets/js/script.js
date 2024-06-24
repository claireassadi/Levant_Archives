$(function() {
    // Charger et parser le fichier CSV
    Papa.parse("assets/csv/personnages.csv", {
        download: true,
        header: true,
        complete: function(results) {
            var data = results.data;
            displayBiographies(data);
        }
    });

    function displayBiographies(data) {
        var biographieContent = '';
        data.forEach(function(item) {
            var id = item.Nom.replace(/\s+/g, '_'); // Crée un ID unique basé sur le nom
            biographieContent += `
                <div class="biographie_entry" data-id="${id}">
                    ${item.image ? `<img src="${item.image}" alt="${item.Nom}">` : ''}    
                    <div>
                        <h3>${item.Nom}</h3>
                        <p>${item["Fonction/Caractéristiques"]}</p>
                        <p>${item["Date"]}</p>
                    </div>
                </div>
            `;
        });

        $('.affichage_bio').html(biographieContent);

        // Ajouter des gestionnaires de clic pour les entrées de biographie
        $('.biographie_entry').on('click', function() {
            var id = $(this).data('id');
            highlightElement(id);
            highlightNetworkElement(id);
            // Notifier l'autre section de la sélection
            $(document).trigger('biographySelected', { id: id });
        });
    }

    // Fonction pour mettre en surbrillance un élément dans le volet biographie
    function highlightElement(id) {
        $('.biographie_entry').removeClass('highlight');
        $(`.biographie_entry[data-id="${id}"]`).addClass('highlight');
    }

    // Fonction pour mettre en surbrillance un élément dans le volet réseaux
    function highlightNetworkElement(id) {
        $('#network svg circle').removeClass('highlight');
        $(`#network svg circle[data-id="${id}"]`).addClass('highlight');
    }

    // Écouter l'événement personnalisé de sélection du réseau
    $(document).on('networkSelected', function(event, detail) {
        var id = detail.id;
        highlightElement(id);
        highlightNetworkElement(id);
    });

    // Ajouter la fonctionnalité de recherche
    $('#search-input').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('.biographie_entry').each(function() {
            var name = $(this).find('h3').text().toLowerCase();
            if (name.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    // ----------------------- MODAL ANNEXES --------------------------

    // Gestion de la modal pour les images des annexes
    var imgModal = $('#modal');
    var modalImg = $('#modal-img');
    var captionText = $('#caption');
    var spanImg = imgModal.find('.close').first();

    $('.annexes_entry img').on('click', function() {
        imgModal.show();
        modalImg.attr('src', this.src);
        captionText.html(this.alt);
    });

    spanImg.on('click', function() { 
        imgModal.hide();
    });

    $(window).on('click', function(event) {
        if ($(event.target).is(imgModal)) {
            imgModal.hide();
        }
    });

    // ----------------------- TOGGLE RESEAUX/MAP --------------------------

    var isNetworkVisible = false;
    var allNetworkData = [];

    // Fonction pour dessiner le graphique des réseaux
    function drawNetworkGraph(data) {
        $('#network-graph').empty();
        
        var width = $('#network-graph').width();
        var height = $('#network-graph').height();

        var svg = d3.select("#network-graph").append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", function(event) {
                svg.attr("transform", event.transform);
            }))
            .append("g");

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("text-align", "center")
            .style("width", "120px")
            .style("height", "28px")
            .style("padding", "2px")
            .style("font", "12px sans-serif")
            .style("background", "lightsteelblue")
            .style("border", "0px")
            .style("border-radius", "8px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        const nodes = [];
        const nodeSet = new Map(); // Use a Map to track node degrees
        const links = [];

        data.forEach(d => {
            if (!nodeSet.has(d.Personnage)) {
                nodeSet.set(d.Personnage, 0);
                nodes.push({ id: d.Personnage, type: 'person', sigle: d.Personnage.split('(')[1]?.charAt(0) || '?' });
            }
            if (!nodeSet.has(d["Autre Entité"])) {
                nodeSet.set(d["Autre Entité"], 0);
                nodes.push({ id: d["Autre Entité"], type: 'entity', sigle: d["Autre Entité"].split('(')[1]?.charAt(0) || '?' });
            }
            nodeSet.set(d.Personnage, nodeSet.get(d.Personnage) + 1);
            nodeSet.set(d["Autre Entité"], nodeSet.get(d["Autre Entité"]) + 1);
            links.push({ source: d.Personnage, target: d["Autre Entité"], relation: d.Relation });
        });

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(5))
            .force("charge", d3.forceManyBody().strength(-5))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(15));

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", d => Math.sqrt(nodeSet.get(d.id)) * 2 + 3) // Scale the radius by the square root of the degree
            .attr("fill", d => {
                switch (d.sigle) {
                    case 'F': return "blue";
                    case 'S': return "green";
                    case 'B': return "pink";
                    case 'A': return "orange";
                    case 'E': return "black";
                    case '?': return "grey";
                    case 'U': return "red";
                    case 'O': return "purple";
                    default: return "yellow";
                }
            })
            .attr("data-id", d => d.id.replace(/\s+/g, '_'))
            .call(drag(simulation))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.id)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(event, d) {
                highlightNode(d.id);
                $(document).trigger('networkSelected', { id: d.id.replace(/\s+/g, '_') });
            });

        const labels = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("dy", -6)
            .attr("text-anchor", "top")
            .attr("font-size", "5px")
            .attr("fill", "#000")
            .text(d => d.id);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        function drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        function highlightNode(id) {
            node.attr("class", d => d.id.replace(/\s+/g, '_') === id ? "highlight" : "");
        }

        $(document).on('biographySelected', function(event, detail) {
            var id = detail.id;
            highlightNode(id);
        });
    }

    // Initialiser les données de réseau
    function fetchAllNetworkData() {
        d3.csv("assets/csv/reseaux.csv").then(function(data) {
            allNetworkData = data;
            updateNetworkGraph(1945, 1950); // Période initiale
        }).catch(function(error) {
            console.error("Erreur lors du chargement du fichier CSV :", error);
        });
    }

    function updateNetworkGraph(startYear, endYear) {
        const filteredData = allNetworkData.filter(item => {
            const date = parseInt(item.Date);
            return date >= startYear && date <= endYear;
        });
        drawNetworkGraph(filteredData);
    }

    // --------------- toggle titre volet + icone folder ----------

    $('#reseaux-toggle').on('click', function() {
        isNetworkVisible = !isNetworkVisible;
        if (isNetworkVisible) {
            $('#map').hide();
            $('#network-graph').show();
            $("#reseaux-map-toggle").find('img').attr('src', 'assets/img/carte.png').attr('alt', 'map icon');
            $("#reseaux-map-toggle").find('p').text('Carte');
            updateNetworkGraph(1945, 1950); // Initial load for 1945-1950
        } else {
            $('#network-graph').hide();
            $('#map').show();
            $("#reseaux-map-toggle").find('img').attr('src', 'assets/img/neural.png').attr('alt', 'network icon');
            $("#reseaux-map-toggle").find('p').text('Réseaux');
        }
    });

    fetchAllNetworkData();

    // Gestion des clics sur la timeline pour mettre à jour les réseaux
    $('.timeline-point, .timeline-section').on('click', function() {
        const startYear = $(this).data('start-year');
        const endYear = $(this).data('end-year');
        if (isNetworkVisible) {
            updateNetworkGraph(startYear, endYear);
        }
    });

    // ----------------------- ANIMATION DES VOLETS --------------------------

    $('nav.barreOutils a').on('click', function(event) {
        event.preventDefault();
        var iconAltText = $(this).find('img').attr('alt').toLowerCase();
        slideOutPanel(iconAltText);
        console.log(iconAltText)
    });

    function slideOutPanel(target) {
        if (target.includes('bio')) {
            $('#volet-biographie').toggleClass('volet-hidden-left volet-visible');
        } else if (target.includes('archives')) {
            $('#volet-archives').toggleClass('volet-hidden-right volet-visible');
        } else if (target.includes('reseaux')) {
            $('#volet-reseaux').toggleClass('volet-hidden-left volet-visible');
        }
    }

    // ----------------------- Toggle Carte/Réseaux --------------------------

    $('#reseaux-map-toggle').on('click', function() {
        isNetworkVisible = !isNetworkVisible;
        if (isNetworkVisible) {
            $('#map').hide();
            $('#network-graph').show();
            $(this).find('img').attr('src', 'assets/img/carte.png').attr('alt', 'map icon');
            $(this).find('p').text('Carte');
            updateNetworkGraph(1945, 1950); // Initial load for 1945-1950
        } else {
            $('#network-graph').hide();
            $('#map').show();
            $(this).find('img').attr('src', 'assets/img/neural.png').attr('alt', 'network icon');
            $(this).find('p').text('Réseaux');
        }
    });

    // ----------------------- Timeline Functionality --------------------------

    $('.timeline-point, .timeline-section').on('click', function() {
        const startYear = $(this).data('start-year');
        const endYear = $(this).data('end-year');
        fetchTimelineData(startYear, endYear);
    });

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
        Papa.parse('assets/csv/reseaux.csv', {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data.filter(item => {
                    const date = parseInt(item.Date);
                    return date >= startYear && date <= endYear;
                });
                drawNetworkGraph(data);
            }
        });
    }

    function fetchLieuxData(startYear, endYear) {
        Papa.parse('assets/csv/lieux.csv', {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data.filter(item => {
                    const date = parseInt(item.Date);
                    return date >= startYear && date <= endYear;
                });
                addMarkers(data);
            }
        });
    }
});
