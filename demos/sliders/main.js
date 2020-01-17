require(["esri/widgets/Slider"], function(Slider) {

  const params = {
    "default": {
      min: 0,
      max: 100,
      values: [50]
    },
    "labels": {
      labelInputsEnabled: true,
      labelsVisible: true,
      rangeLabelsVisible: true,
      rangeLabelInputsEnabled: true,
      min: 0,
      max: 100,
      values: [50]
    },
    "two-handles-connected-segment": {
      min: 0,
      max: 100,
      values: [33.3, 66.6]
    },
    "two-handles-ratio": {
      labelInputsEnabled: false,
      labelsVisible: true,
      rangeLabelsVisible: true, // overridden by 'display: none' in CSS
      layout: "horizontal",
      min: 0,
      max: 100,
      values: [25, 75]
    },
    "two-handle-wide-track-ratio": {
      labelInputsEnabled: false,
      labelsVisible: false,
      layout: "horizontal",
      min: 0,
      max: 100,
      values: [25, 75]
    },
    "style-ramp-handles": {
      min: 0,
      max: 100,
      values: [33.3, 66.6]
    },
    "thumb-states": {
      min: 0,
      max: 1,
      values: [0.5]
    },
    "segment-two-colors-custom-tooltip": {
      labelInputsEnabled: false,
      labelsVisible: true,
      min: -24300,
      max: 45200,
      values: [0]
    },
    "noui-handle": {
      labelsVisible: false,
      layout: "horizontal",
      min: 0,
      max: 1,
      values: [0.5],
    },
    "segment-rainbow": {
      labelsVisible: false,
      min: 0,
      max: 7,
      values: [1, 2, 3, 4, 5, 6]
    },
    "five-handles": {
      labelInputsEnabled: false,
      labelsVisible: true,
      min: 0,
      max: 100,
      values: [0, 25, 50, 75, 100]
    },
    "time-slider": {
      labelsVisible: false,
      layout: "horizontal",
      min: 0,
      max: 100,
      values: [25, 50, 75],
    },
    "range-editors-bottom": {
      labelInputsEnabled: false,
      rangeLabelsVisible: true,
      rangeLabelInputsEnabled: true,
      layout: "horizontal",
      min: 0,
      max: 100,
      values: [50]
    },
    "custom-minLabel-maxLabel": {
      labelInputsEnabled: false,
      layout: "horizontal",
      min: 0,
      max: 1,
      labelsVisible: false,
      rangeLabelInputsEnabled: false,
      rangeLabelsVisible: true,
      // Deprecated
      // minLabel: "Performance",
      // maxLabel: "Quality",
      labelFormatFunction: function(value, type) {
        if (type === "min") {
          return "Performance";
        } else if (type === "max") {
          return "Quality"
        }
        return value;
      },
      values: [0.5]
    },
    "smashing": {
      labelsVisible: false,
      labelInputsEnabled: false,
      layout: "horizontal",
      min: 0,
      max: 100,
      values: [50]
    },
    "precision-0": {
      layout: "horizontal",
      min: 0,
      max: 2,
      labelsVisible: true,
      snapOnClickEnabled: true,
      values: [0],
      precision: 0
    },
  };

  createSliders(params);

  function createSliders(params){
    for (var key in params){

      // console.log(key, params[key]);

      try{
        createSlider(key, params[key]);
      }
      catch (e) {
        console.error("Slider ", key, " didn't construct correctly.");
        createErrorContent(key);
      }
    }
  }

  function createSlider(id, params){
    params.container = createSliderElement(id);
    var slider = new Slider(params);

    function logEventCallback (event){
      console.log(event);
    }

    return slider;
  }

  function createSliderElement(id){
    var labelContainer = document.createElement("div");
        labelContainer.innerText = id;
        labelContainer.classList.add("label-container");

    var slider = document.createElement("div");
        slider.setAttribute("id", id);

    var container = document.createElement("div");
        container.classList.add("container");
        container.appendChild(slider);

    var moduleContainer = document.createElement("div");
        moduleContainer.classList.add("module-container");
        moduleContainer.appendChild(labelContainer);
        moduleContainer.appendChild(container);

    var mainDiv = document.getElementById("main");
        mainDiv.appendChild(moduleContainer);

    return slider;
  }

  function createErrorContent(id){
    var sliderContainer = document.getElementById(id);
        sliderContainer.innerHTML += "😭";
        sliderContainer.style.fontSize = "240px";
  }
});