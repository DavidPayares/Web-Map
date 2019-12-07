 // Bounding box refers to UJI campus
 const bboxCampus = [-0.07947921752929688, 39.98619605209568, -0.04978179931640625, 40.00000497268461];

 const ANALYSIS_CENTROID = "centroid";
 const ANALYSIS_BUFFER = "buffer";
 const ANALYSIS_VORONOI = "voronoi";
 const ANALYSIS_BUFFER_RATIO = 0.3;

 let numPoints, typeCompute;
 let btnPoints, btnCompute;
 let activePoints;
 let counter = 0;

 window.onload = main;

 function main() {
   initMap('map-div');
   attachListeners();
   //toggleVisibilityComputation("hide");
   addBoundingBoxToMap(bboxCampus);
 }


 // Listeners to call the actions.
 function attachListeners() {
   document.getElementById('btn-points').addEventListener('click', createTable);
   document.getElementById('sel-compute').addEventListener('change', createAnalysis);
 }

 // Check that the number of points is bigger than one, then call the generate table function
 function createTable() {
   let num = document.getElementById("num").value;
   console.log(num);
   if (num <= 0) {
     alert('Wrong value! Please insert a valid number');
   } else {
     generateTable(num);
   }
 }

 // Reset variable to show the default view
 function resetHome() {
   cleanFeatures();
   document.getElementsByTagName('tbody')[0].innerHTML = ""
   document.getElementById('lbl-compute').className = 'hide';
   document.getElementById('sel-compute').className = 'hide';
   document.getElementById('sel-compute').value = 'none';
   document.getElementById("table-div").className = 'show';
   counter = 0;
 }

 // Generate a table based on the number of points selected by the user
 function generateTable(number) {

   resetHome();
   activePoints = generateRamdomTurfPoints(number, bboxCampus);
   let newtable = '';

   for (let i = 0; i < activePoints.features.length; i++) {
     let lat = activePoints.features[i].geometry.coordinates[0];
     let lon = activePoints.features[i].geometry.coordinates[1];

     newtable += '<tr>\n<td>' + lon.toFixed(3) + '</td>\n<td>' + lat.toFixed(3) +
       `</td>\n<td><button type="button" class="table" onclick="plot(${lat},${lon});">View</button></td>\n</tr>`;

     if (i != activePoints.features.length - 1) {
       newtable = newtable + '\n';
     }
   }

   document.getElementsByTagName('tbody')[0].innerHTML = newtable;
 }

 // Plot the points on map
 function plot(lat, lon) {

   event.target.disabled = true;
   event.target.innerHTML = 'OnMap'

   //event.target.className = 'hide';
   addPointToMap(lat, lon, false);

   counter++
   addAnalysis(counter);
 }

 // Display the button when all the points are on map.
 function addAnalysis(counter) {
   if (counter == document.getElementsByClassName('table').length) {
     document.getElementById('lbl-compute').className = 'show';
     document.getElementById('sel-compute').className = 'show';
   }
 }


 // Select the analysis to do and call it to be added on the map.
 function createAnalysis() {
   let analysis = document.getElementById('sel-compute').value
   cleanOutput();
   switch (analysis) {
     case 'centroid':
       createCentroids();
       break;
     case 'buffer':
       createBuffer();
       break;
     case 'voronoi':
       createVoronoi();
       break;
     default:
       cleanOutput();
       break;
   }
 }

 // Create centroid of the points and add them into the map.
 function createCentroids() {
   let centroid = computeTurfCentroid(activePoints);
   addPointToMap(centroid.geometry.coordinates[0], centroid.geometry.coordinates[1], true);
 }


 //  Create buffer polygons and Add them into the map.
 function createBuffer() {
   for (let i = 0; i < activePoints.features.length; i++) {
     let lat = activePoints.features[i].geometry.coordinates[0];
     let lon = activePoints.features[i].geometry.coordinates[1];
     bufferPoints = computeTurfBuffer(lat , lon, ANALYSIS_BUFFER_RATIO);
     addCirclesToMap(bufferPoints);
   }
 }

 //  Create Voroni polygons and Add them into the map.
 function createVoronoi() {
   let voronoi = computeTurfVoronoi(activePoints);
   addPolygonsToMap(voronoi);

 }

 // Clean layers on Map.
 function cleanOutput() {
   cleanCentroid();
   cleanPolygon();
 }