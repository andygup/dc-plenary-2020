require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Bookmarks",
  "esri/webmap/Bookmark"
], function(Map, MapView, FeatureLayer, Bookmarks, Bookmark) {
  const category = document.getElementById("category").text;
  const map = new Map({
    basemap: "gray-vector"
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    extent: {
      spatialReference: {
        latestWkid: 3857,
        wkid: 102100
      },
      xmin: -13185668,
      ymin: 4066176,
      xmax: -13183855,
      ymax: 4067515
    },
    constraints: {
      minScale: 2311104
    },
    popup: {
      defaultPopupTemplateEnabled: true
    }
  });

  const symbolCats = [
    "post-office",
    "atm",
    "place-of-worship",
    "park",
    "school",
    "hospital",
    "fire-station",
    "playground",
    "shopping-center",
    "campground",
    "golf-course",
    "library",
    "city-hall",
    "beach",
    "police-station",
    "subway-station",
    "train-station",
    "cemetery",
    "trail",
    "radio-tower",
    "museum",
    "airport",
    "live-music-venue",
    "sports-complex",
    "ferry"
  ];

  rendererInfos = symbolCats.map((symCat) => {
    return {
      value: symCat,
      symbol: {
        type: "web-style",
        name: symCat,
        styleName: "Esri2DPointSymbolsStyle"
      },
      label: symCat
    };
  });

  const scale = 36112;

  const renderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    valueExpression: category,
    valueExpressionTitle: "Symbol Categories",
    uniqueValueInfos: rendererInfos,
    visualVariables: [
      {
        type: "size",
        valueExpression: "$view.scale",
        stops: [
          { value: scale, size: 40 },
          { value: scale * 2, size: 30 },
          { value: scale * 4, size: 20 },
          { value: scale * 8, size: 10 },
          { value: scale * 16, size: 4 },
          { value: scale * 32, size: 2 }
        ]
      }
    ]
  };

  const featureLayer = new FeatureLayer({
    url:
      "http://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/LA_County_Points_of_Interest/FeatureServer/0",
    renderer: renderer,
    popupTemplate: {
      title: "{Name}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "cat2",
              label: "Category"
            },
            {
              fieldName: "addrln1",
              label: "Address"
            },
            {
              fieldName: "city",
              label: "City"
            },
            {
              fieldName: "phones",
              label: "Phone number"
            },
            {
              fieldName: "link",
              label: "Link"
            }
          ]
        }
      ]
    }
  });

  map.add(featureLayer);

  const bookmarks = new Bookmarks({
    view: view,
    bookmarks: [
      new Bookmark({
        name: "Angeles National Forest",
        extent: {
          spatialReference: {
            wkid: 102100
          },
          xmin: -13139131.948889678,
          ymin: 4047767.23531948,
          xmax: -13092887.54677721,
          ymax: 4090610.189673263
        }
      }),
      new Bookmark({
        name: "Crystal Lake",
        extent: {
          spatialReference: {
            wkid: 102100
          },
          xmin: -13125852.551697943,
          ymin: 4066904.1101411926,
          xmax: -13114291.451169826,
          ymax: 4077614.8487296384
        }
      }),
      new Bookmark({
        name: "San Fernando",
        extent: {
          spatialReference: {
            latestWkid: 3857,
            wkid: 102100
          },
          xmin: -13185668.186639601,
          ymin: 4066176.418652561,
          xmax: -13183855.195875114,
          ymax: 4067515.260976006
        }
      })
    ]
  });

  // Add the widget to the top-right corner of the view
  view.ui.add(bookmarks, {
    position: "top-right"
  });
  view.ui.add("toggle-snippet", "top-left");
});
