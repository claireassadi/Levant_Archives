<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Titre de la page</title>
    <link rel="icon" type="image/png" href="assets/img/archiver.png"/>
    <link rel="stylesheet" href="assets/css/normalize.css" />
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossorigin=""/>
     <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
     integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
     crossorigin=""></script>
     <script src="https://d3js.org/d3.v7.min.js"></script>
  </head>
  <body>
      <?php include 'header.php';?>
      
      <div id="modal" class="modal">
        <span class="close">&times;</span>
        <div class="modal-content">
          <img id="modal-img">
          <div id="caption"></div>
        </div>
      </div>

      <div class="volet_reseaux volet-visible" id="volet-reseaux">
        <p class="titre_volet" id="reseaux-toggle">Reseaux</p>
        <p class="titre_volet" class="legendes" >Légende: <span class="fr">f=Français</span>, <span class="syr">S=Syrien</span>, <span class="brit">b=Britanniques</span>, <span class="usa">a=Américains</span>, <span class="urss">U=URSS</span>, <span class="lie">l=Lieux</span>, <span class="obj">o=objets de diffusion culturels</span>, <span class="egy">E=Egypte</span>,</p>
        <div id="network"></div>
      </div>
      <div class="volet_biographie volet-visible" id="volet-biographie">
        <p class="titre_volet">Biographies</p>
        <div>
          <input type="text" id="search-input" placeholder="Rechercher un personnage...">
        </div>
        <div class="affichage_bio"></div>
      </div>
      <div class="volet_archives volet-visible" id="volet-archives">
        <p class="titre_volet">Annexes</p>
        <?php include 'annexes.php';?>
      </div>
      <div id="map" style="height: 500px;"></div>
      <div id="network-graph" style="display:none;"></div>

  <!-- Timeline section -->
  <div class="timeline-container">
    <div class="timeline">
      <a href="#1945_1946"><div class="timeline-section" data-start-year="1945" data-end-year="1946" id="button_1945_1946">1945-1946</div></a>
      <a href="#1947_1949"><div class="timeline-section" data-start-year="1947" data-end-year="1949" id="button_1947_1949">1947-1949</div></a>
      <a href="#1950_1956"><div class="timeline-section" data-start-year="1950" data-end-year="1956" id="button_1950_1956">1950-1956</div></a>
      <a href="#1957_1971"><div class="timeline-section" data-start-year="1957" data-end-year="1971" id="button_1956_1971">1957-1971</div></a>
    </div>
  </div>

  <div class="timeline-content"></div>

  <?php include 'footer.php';?>

  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>
  <script src="assets/js/map.js"></script>
  <script src="assets/js/script.js"></script>
  <script src="assets/js/network.js"></script>
  <script src="assets/js/timeline.js"></script>
</body>
</html>