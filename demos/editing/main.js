require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Editor",
  "esri/widgets/Legend"
], function(WebMap, MapView, Editor, Legend) {
  let treeConfigLayer;

  // Create a map frm the referenced webmap item id
  let webmap = new WebMap({
    portalItem: {
      id: "372222092d0a46d9b809acee49c786b9"
    }
  });

  let view = new MapView({
    container: "viewDiv",
    map: webmap,
    center: [13.4040, 52.5200],
    zoom: 15
  });

  view.when(function() {
    view.popup.autoOpenEnabled = false; //disable popups

    // Loop through webmap layers and set an EditConfig for each
    view.map.layers.forEach(function(layer) {
      if (layer.title === "Baum_Berlin") {
        treeConfigLayer = {
          layer: layer,
          // Set it so that only two field displays within the form
          fieldConfig: [
            {
              name: "Gattung",
              label: "Genus"
            },
            {
              label: "Tree Details",
              description: "Provide specific details on tree species",
              visibilityExpression: "!IsEmpty($feature.Gattung)",
              fieldConfig: [
                {
                  name: "NameNr",
                  label: "Name"
                },
                {
                  name: "Pflanzjahr",
                  label: "Planting Year"
                },
                {
                  name: "KroneDurch",
                  label: "Crown diameter (m)"
                },
                {
                  name: "BaumHoehe",
                  label: "Height (m)"
                },
                {
                  name: "Kategorie",
                  label: "Category"
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