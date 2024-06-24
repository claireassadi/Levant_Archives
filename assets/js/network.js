document.addEventListener("DOMContentLoaded", function() {
    const networkDiv = document.querySelector(".volet_reseaux");
    const width = networkDiv.clientWidth;
    const height = networkDiv.clientHeight;

    const svg = d3.select("#network")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function(event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    const tooltip = d3.select("body").append("div")
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

    let allData = [];

    function drawNetwork(data) {
        svg.selectAll("*").remove();

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
                document.dispatchEvent(new CustomEvent('networkSelected', { detail: { id: d.id.replace(/\s+/g, '_') } }));
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

        document.addEventListener('biographySelected', function(event) {
            var id = event.detail.id;
            highlightNode(id);
        });
    }

    // --------------- YEAR ---------------------

    function fetchReseauxData() {
        d3.csv("assets/csv/reseaux.csv").then(function(data) {
            allData = data;
            updateNetwork(1945, 1950);
        }).catch(function(error) {
            console.error("Erreur lors du chargement du fichier CSV :", error);
        });
    }

    function updateNetwork(startYear, endYear) {
        const filteredData = allData.filter(item => {
            const date = parseInt(item.Date);
            return date >= startYear && date <= endYear;
        });
        drawNetwork(filteredData);
    }

    // Charger initialement les réseaux pour la période 1945-1950
    fetchReseauxData();

    // Gestion des clics sur la timeline pour mettre à jour les réseaux
    $('.timeline-point, .timeline-section').on('click', function() {
        const startYear = $(this).data('start-year');
        const endYear = $(this).data('end-year');
        updateNetwork(startYear, endYear);
    });
});
