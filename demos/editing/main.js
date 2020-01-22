require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Editor",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend"
], function(WebMap, MapView, Editor, FeatureLayer, Legend) {
  let treeConfigLayer;

  // https://opendata.dc.gov/pages/connect-web-services

  let map = new WebMap({
    portalItem: {
      id: "03755a1ed80942248552fa56c53c3212"
    }
  });   

  let view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 15
  });

  view.when(function() {
    view.popup.autoOpenEnabled = false; //disable popups

    // Loop through webmap layers and set an EditConfig for each
    view.map.layers.forEach(function(layer) {
      if (layer.title === "DC Accidents") {
        treeConfigLayer = {
          layer: layer,
          // Set it so that only two field displays within the form
          fieldConfig: [
            {
              name: "CRASH_EVENT_TYPES",
              label: "CRASH TYPE"
            },
            {
              label: "Details",
              description: "Provide specifics related to incident",
              fieldConfig: [
                {
                  name: "CRASHID",
                  label: "Crash ID"
                },
                {
                  name: "ADDRESS1",
                  label: "Address"
                },
                {
                  name: "TRAFFICWAYRELATION",
                  label: "Traffic Relationship"
                },
                {
                  name: "STREETLIGHTING",
                  label: "Street light status"
                }                
              ]
            }
          ]
        };
      }
    });

    // Create the Editor
    let editor = new Editor({
      view: view,
      // Pass in the configurations created above
      layerInfos: [treeConfigLayer],
    });

    let legend = new Legend({ view });
    view.ui.add(legend, "bottom-left")

    // Add widget to top-right of the view
    view.ui.add(editor, "top-right");

    view.ui.add("toggle-snippet", "top-left");
  });
});