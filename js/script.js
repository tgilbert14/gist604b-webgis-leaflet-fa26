// initializes the map
const map = L.map("map", {
  center: [32.24, -110.95],
  zoom: 13,
  zoomControl: false // added manually below so I can place it
});

// basemap from OpenStreetMap, set default zoom and center
const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// add zoom controls and a scale bar
L.control.zoom({ position: "topleft" }).addTo(map);
L.control.scale({ position: "bottomleft", imperial: true, metric: true }).addTo(map);

// this creates layer groups for bars, bike paths, and parks
const barsGroup = L.layerGroup().addTo(map);
const bikeGroup = L.layerGroup().addTo(map);
const parksGroup = L.layerGroup().addTo(map);

// option to turn them on and off
L.control.layers(
  { "OpenStreetMap": osm },
  {
    "Bars": barsGroup,
    "Bike Paths": bikeGroup,
    "Parks": parksGroup
  },
  { collapsed: false }
).addTo(map);

// now we load the GeoJSON data for parks, bike paths, and bars

// Parks (polygons) - have to load first so they appear underneath other layers
fetch("data/parks.geojson")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#2e7d32",
        weight: 1,
        fillColor: "#66bb6a",
        fillOpacity: 0.4
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || "Unnamed park";
        layer.bindPopup(`<h3>${name}</h3>Park`);
      }
    }).addTo(parksGroup);
  });

// Bike paths (lines)
fetch("data/bike_paths.geojson")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: "#1565c0",
        weight: 3,
        opacity: 0.8
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const name = p.name || "Unnamed bike path";
        const surface = p.surface || "unknown";
        layer.bindPopup(`<h3>${name}</h3>Surface: ${surface}`);
      }
    }).addTo(bikeGroup);
  });

// Bars (points) - loaded last so they get raw on top
fetch("data/bars.geojson")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 7,
          color: "#ffffff",
          weight: 2,
          fillColor: "#e39a12",
          fillOpacity: 0.9
        }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        let popup = `<h3>${p.name}</h3>`;
        if (p.opening_hours) popup += `Hours: ${p.opening_hours}<br>`;
        if (p.website) popup += `<a href="${p.website}" target="_blank">Website</a>`;
        layer.bindPopup(popup);
      }
    }).addTo(barsGroup);
  });