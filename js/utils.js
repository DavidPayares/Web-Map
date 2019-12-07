// Global variable: Leaflet map object
let map;

/*
Leaflet function
Init a Leaflet map object.
*/
function initMap(mapId){
    // initialize map container
    map = L.map(mapId).setView([39.992703663714745, -0.06709370422363281], 15);

    // get the stamen toner-lite tiles
    let Stamen_Toner = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    // add the tiles to the map
    Stamen_Toner.addTo(map); 

    // disable actions over map 
    map.scrollWheelZoom.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.zoomControl.enable();
}

/* 
Leaflet function
Add a pair lon-lat to the map. 
isSpecial is a boolean flag to determine the style of 
the circle marker.
*/
function addPointToMap(lon, lat, isSpecial) {
    if (map) {
        let defaultMarkerOptions = {
            glayer:'random',
            radius: 4,
            fillColor: "#FFC300",
            color: " #FFC300",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        let myPositionMarkerOptions = {
            glayer:"points",
            radius: 4,
            fillColor: "#0E2F44",
            color: "#0E2F44",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        let marker = toTurfPoint(lon, lat);
        L.geoJson(marker, {
            pointToLayer: function (feature, latlng) {
                if (isSpecial) {
                    return L.circleMarker(latlng, myPositionMarkerOptions);
                } else {
                    return L.circleMarker(latlng, defaultMarkerOptions);
                }
            }
        }).addTo(map);
    }
}

/*
Leaflet function
Add a line to the map by passing start and end points as input parameters. 
*/
function addLineToMap(pointFrom, pointTo) {
    // define coordinates for line
    let latlngs = [
        pointFrom.geometry.coordinates,
        pointTo.geometry.coordinates
    ];

    // add a line to the map
    let line = toTurfLineString(latlngs);
    L.geoJson(line, {color:"#900C3F", glayer:"lines"}).addTo(map);
}

/* 
Leaflet function.
Add a bounding box to the map by passing a boundig box declaration as input parameter. 
*/
function addBoundingBoxToMap(bbox) {
    let boundingbox = toTurfPolygon(bbox);
    L.geoJson(boundingbox, {color:"#0E2F44",glayer:"bbox"}).addTo(map);
}

/*
Leaflet function.
Add polygons to the map given a "feature collection" as input parameter. 
*/
function addPolygonsToMap(featureCollection) {
    let i;

    for (i=0; i < featureCollection.features.length; i++) {
        let polygon = featureCollection.features[i].geometry;
        L.geoJson(polygon, {color:"#0E2F44",glayer:"polygon"}).addTo(map); 
    }
}

/*
Leaflet function.
Add a polygon to the map given a polygon as input parameter. 
*/
function addCirclesToMap(buffer) {
    let polygon = buffer.geometry;
    L.geoJson(polygon, {color:"#0E2F44",glayer:"polygon"}).addTo(map); 
}


/*
Leaflef function
Clean layers: random points, points (centroid) and polygons (buffer, voronoi)
*/
function cleanFeatures(){
    map.eachLayer(function (layer) {
        if(layer.defaultOptions){
            if(layer.defaultOptions['glayer']=='random' || 
               layer.options['glayer']=='points' ||
               layer.options['glayer']=='polygon'){
                map.removeLayer(layer);
            }
        }
   });   
 }

 /*
Leaflef function
Clean layer "points" (centroid)
*/
function cleanCentroid() {
    map.eachLayer(function (layer) {
        if(layer.defaultOptions){
            if(layer.options['glayer']=='points') {
                map.removeLayer(layer);
            }
        }
   });
}

/*
Leaflef function
Clean layer "polygon" (buffer, voronoi)
*/
function cleanPolygon(){
    map.eachLayer(function (layer) {    
       if(layer.options['glayer']=='polygon' ){
           map.removeLayer(layer);
       }
    });   
}

/* 
Turf function
Return a Turf Point object. 
*/
function toTurfPoint(lon, lat) {
    return turf.point([lon, lat]);
}

/* 
Turf function
Return a Turf LineString object. 
*/
function toTurfLineString(latlngs) {
    return turf.lineString(latlngs);
}

/* 
Truf function
Return a Turf Polygon object. 
*/
function toTurfPolygon(bbox) {
    return turf.bboxPolygon(bbox);
}

/* 
Turf function
Return "num" random points within a bounding box (bbox). 
*/
function generateRamdomTurfPoints(num, bbox) {
    return turf.randomPoint(num, {bbox: bbox});
}

/* 
Turf function
Return the centroid of a list of points given as input parameter. 
*/
function computeTurfCentroid(points) {
    return turf.centroid(points);
}

/* 
Turf function
Return the buffered polygon of a point (lon, lat) of "rad" kilometres of ratio. 
*/
function computeTurfBuffer(lon, lat, rad) {
    let point = toTurfPoint(lon,lat);
    return turf.buffer(point, rad, {units: 'kilometers'})
}

/* 
Turf function
Return the Voronoi polygons of a list of point given as input parameter. 
*/
function computeTurfVoronoi(points) {
    let options = {bbox: 
        [-0.07947921752929688, 39.98619605209568, -0.04978179931640625, 40.00000497268461]};
    return turf.voronoi(points, options);
}


