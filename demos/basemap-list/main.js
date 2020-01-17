require([
  "esri/views/MapView",
  "esri/widgets/BasemapLayerList",
  "esri/widgets/LayerList",
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/layers/VectorTileLayer"
], function(MapView, BasemapLayerList, LayerList, ArcGISMap, FeatureLayer, VectorTileLayer) {

  const layer = new FeatureLayer({
    portalItem: {
      id: "2852240c7f1e4e6a82b42c6d70ba98c9"
    },
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        size: 8,
        color: "#338033",
        outline: {
          width: 0.5,
          color: "white"
        }
      }
    }
  });

  const map = new ArcGISMap({
    basemap: {
      baseLayers: [
        new VectorTileLayer({
          portalItem: {
            id: "2afe5b807fa74006be6363fd243ffb30"
          }
        }),
        new VectorTileLayer({
          portalItem: {
            id: "97fa1365da1e43eabb90d0364326bc2d"
          }
        })
      ],
      referenceLayers: [
        new VectorTileLayer({
          portalItem: {
            id: "ba52238d338745b1a355407ec9df6768"
          }
        })
      ]
    },
    layers: [layer]
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [10.32083, 51.446755],
    zoom: 8
  });
  view.ui.add("toggle-snippet", "top-left");
  view.when(function() {
    const layerList = new LayerList({ view });
    const basemapLayerList = new BasemapLayerList({ view, container: "basemap-container" });

    // Add widget to the top right corner of the view
    view.ui.add(layerList, "top-right");
    view.ui.add("basemaps", "top-right");
  });
});
