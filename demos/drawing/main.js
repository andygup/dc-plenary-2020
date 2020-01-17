require([
  "esri/widgets/Sketch",
  "esri/Map",
  "esri/layers/GraphicsLayer",
  "esri/views/MapView",
  "esri/geometry/geometryEngine",
], function(Sketch, Map, GraphicsLayer, MapView, { intersects, contains }) {
  const layer = new GraphicsLayer();

  const map = new Map({
    basemap: {
      portalItem: {
        id: "e64f06e8d912465a96f9ea9bfdb72676"
      }
    },
    layers: [layer]
  });

  const invalidPoly = {
    type: "simple-fill",
    color: "red",
    style: "diagonal-cross",
    outline: {
      color: "red",
      style: "dash",
      width: 1
    }
  };

  const view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 12,
    center: [12.4964, 41.9028]
  });

  const sketch = new Sketch({
    layer: layer,
    view: view
  });

  const symbolPoly = {
    type: "simple-fill",
    color: [150, 150, 150, 0.5],
    style: "solid",
    outline: {
      color: [50, 50, 50, 1],
      width: 2
    }
  }

  sketch.on(["create", "update"], function(event){
    // console.log(event);
    const graphic = event.graphic || (event.graphics ? event.graphics[0] : null);
    if (!graphic) return;
    if (graphic.geometry.type !== "polygon") return;
    const intersecting = layer.graphics.some(g => (
      intersects(g.geometry, graphic.geometry)
    ));
    if (intersecting && event.state !== "complete") {
      graphic.symbol = invalidPoly;
    }
    else {
      graphic.symbol = symbolPoly;
    }
  });

  view.ui.add(sketch, "top-right");
  view.ui.add("toggle-snippet", "top-left");
});