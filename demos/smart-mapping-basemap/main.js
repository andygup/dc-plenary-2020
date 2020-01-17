require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/VectorTileLayer",
  "esri/renderers/smartMapping/creators/color",
  "esri/renderers/smartMapping/statistics/histogram",
  "esri/widgets/smartMapping/ColorSlider",
  "esri/core/watchUtils",
  "esri/widgets/BasemapToggle"
], function(
  Map,
  MapView,
  FeatureLayer,
  VectorTileLayer,
  colorRendererCreator,
  histogram,
  ColorSlider,
  watchUtils,
  BasemapToggle
) {

  const slider = document.getElementById("slider");

  const custom = {
    baseLayers: [
      new VectorTileLayer({
        portalItem: {
          id: "790b72a7b82f452fb749f26217293a85"
        }
      })
    ]
  };

  const nova = {
    baseLayers: [
      new VectorTileLayer({
        portalItem: {
          id: "75f4dfdff19e445395653121a95a85db"
        }
      })
    ]
  }

  const map = new Map({
    basemap: nova
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-85.0502, 33.125524],
    zoom: 5
  });
  view.ui.add("toggle-snippet", "top-left");
  view.ui.add("containerDiv", "bottom-right");

  const toggle = new BasemapToggle({
    view: view,
    nextBasemap: custom
  });

  toggle.on("toggle", () => {
    watchUtils.whenFalseOnce(view, "updating", generateRenderer);
  });

  // Add widget to the top right corner of the view
  view.ui.add(toggle, "top-right");

  // Create FeatureLayer instance with popupTemplate

  const layer = new FeatureLayer({
    url:
      "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/counties_politics_poverty/FeatureServer/0",
    popupTemplate: {
      // autocasts as new PopupTemplate()
      title: "{COUNTY}, {STATE}",
      content:
        "{POP_POVERTY} of {TOTPOP_CY} people live below the poverty line.",
      fieldInfos: [
        {
          fieldName: "POP_POVERTY",
          format: {
            digitSeparator: true,
            places: 0
          }
        },
        {
          fieldName: "TOTPOP_CY",
          format: {
            digitSeparator: true,
            places: 0
          }
        }
      ]
    }
  });

  watchUtils.whenFalseOnce(view, "updating", generateRenderer);

  let colorSlider;

  function generateRenderer() {
    slider.innerHTML = "";
    if (colorSlider) {
      delete colorSlider;
    }
    // configure parameters for the color renderer generator
    // the layer must be specified along with a field name
    // or arcade expression. The view and other properties determine
    // the appropriate default color scheme.

    const colorParams = {
      layer: layer,
      valueExpression:
        "( $feature.POP_POVERTY / $feature.TOTPOP_CY ) * 100",
      view: view,
      theme: "above-and-below",
      outlineOptimizationEnabled: true
    };

    // Generate a continuous color renderer based on the
    // statistics of the data in the provided layer
    // and field normalized by the normalizationField.
    //
    // This resolves to an object containing several helpful
    // properties, including color scheme, statistics,
    // the renderer and visual variable

    let rendererResult;

    colorRendererCreator
      .createContinuousRenderer(colorParams)
      .then(function(response) {
        // set the renderer to the layer and add it to the map
        rendererResult = response;
        layer.renderer = rendererResult.renderer;

        if (!map.layers.includes(layer)) {
          map.add(layer);
        }

        // generate a histogram for use in the slider. Input the layer
        // and field or arcade expression to generate it.

        return histogram({
          layer: layer,
          valueExpression: colorParams.valueExpression,
          view: view,
          numBins: 70
        });
      })
      .then(function(histogramResult) {
        // Construct a color slider from the result of both
        // smart mapping renderer and histogram methods
        colorSlider = ColorSlider.fromRendererResult(
          rendererResult,
          histogramResult
        );
        colorSlider.container = "slider";
        colorSlider.primaryHandleEnabled = true;
        // Round labels to 1 decimal place
        colorSlider.labelFormatFunction = function(value, type) {
          return value.toFixed(1);
        };
        // styles the standard deviation lines to be shorter
        // than the average line
        colorSlider.histogramConfig.dataLineCreatedFunction = function(
          lineElement,
          labelElement,
          index
        ) {
          if (index != null) {
            lineElement.setAttribute("x2", "66%");
            const sign = index === 0 ? "-" : "+";
            labelElement.innerHTML = sign + "σ";
          }
        };
        colorSlider.viewModel.precision = 1;

        // when the user slides the handle(s), update the renderer
        // with the updated color visual variable object

        function changeEventHandler() {
          const renderer = layer.renderer.clone();
          const colorVariable = renderer.visualVariables[0].clone();
          const outlineVariable = renderer.visualVariables[1];
          colorVariable.stops = colorSlider.stops;
          renderer.visualVariables = [colorVariable, outlineVariable];
          layer.renderer = renderer;
        }

        colorSlider.on(
          ["thumb-change", "thumb-drag", "min-change", "max-change"],
          changeEventHandler
        );
      })
      .catch(function(error) {
        console.log("there was an error: ", error);
      });
  }
});