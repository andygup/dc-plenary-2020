require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/ImageryLayer",
  "esri/layers/TileLayer",
  "esri/widgets/LayerList",
  "esri/widgets/Swipe",
  "esri/widgets/Expand"
], function(Map, MapView, ImageryLayer, TileLayer, LayerList, Swipe, Expand) {
  const map = new Map({
    basemap: "satellite"
  });

  // const infared = new TileLayer({
  //   url:
  //     "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/WV03_Kilauea_20180519_ShortwaveInfrared/MapServer",
  //   maxScale: 3000
  // });
  const infared = new ImageryLayer({
    portalItem: {
      id: "e4019754886548aa84f92a4dee751ce4"
    }
  });
  map.add(infared);

  // const nearInfared = new TileLayer({
  //   url:
  //     "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/WV03_Kilauea_20180519_NearInfrared/MapServer",
  //   maxScale: 3000
  // });
  // map.add(nearInfared);
  const natural = new ImageryLayer({
    portalItem: {
      id: "4e7451bf28543e2a5e32e0a341159c6"
    }
  });
  map.add(natural);

  const view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 13,
    center: [11.149151, 53.269225], // longitude, latitude
    constraints: {
      maxZoom: 17,
      minZoom: 8
    }
  });

  // create a layerlist and expand widget and add to the view
  const layerList = new LayerList({
    view: view
  });
  const llExpand = new Expand({
    view: view,
    content: layerList,
    expanded: false
  });
  view.ui.add(llExpand, "top-right");

  // create a new Swipe widget
  const swipe = new Swipe({
    leadingLayers: [infared],
    // trailingLayers: [nearInfared],
    trailingLayers: [natural],
    position: 50, // set position of widget to 50%
    view: view
  });

  // add the widget to the view
  view.ui.add(swipe);

  view.ui.add("toggle-snippet", "top-left");
});
