require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/TileLayer",
  "esri/layers/GeoJSONLayer",
  "esri/Basemap",

  "utils/ExaggeratedElevationLayer",

  "esri/Graphic",
  "esri/geometry/Point",
  "esri/geometry/Mesh",

  "esri/core/watchUtils"
], function (Map, SceneView, TileLayer, GeoJSONLayer, Basemap, ExaggeratedElevationLayer, Graphic, Point, Mesh, watchUtils) {


  const R = 6358137; // approximate radius of the Earth in m
  const offset = 300000; // offset from the ground used for the clouds

  const basemap = new Basemap({
    baseLayers: [
      new TileLayer({
        url: "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/terrain_with_heavy_bathymetry/MapServer",
        copyright: "Bathymetry, topography and satellite imagery from <a href=\"https://visibleearth.nasa.gov/view_cat.php?categoryID=1484\" target=\"_blank\">NASA Visible Earth</a> | <a href=\"http://www.aag.org/global_ecosystems\" target=\"_blank\">World Ecological Land Units, AAG</a> | Oceans, glaciers and water bodies from <a href=\"https://www.naturalearthdata.com/\" target=\"_blank\">Natural Earth</a>"
      })
    ]
  });

  const map = new Map({
    basemap: basemap
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    alphaCompositingEnabled: true,
    qualityProfile: "high",
    camera: {
      position: [-55.03975781, 14.94826384, 19921223.30821],
      heading: 2.03,
      tilt: 0.13
    },
    environment: {
      background: {
        type: "color",
        color: [255, 252, 244, 0]
      },
      starsEnabled: false,
      atmosphereEnabled: false,
      lighting: {
        directShadowsEnabled: false,
        date: "Sun Jun 23 2019 19:19:18 GMT+0200 (Central European Summer Time)"
      }
    },
    constraints: {
      altitude: {
        min: 10000000,
        max: 25000000
      }
    },
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: "top-right",
        breakpoint: false,
        buttonEnabled: false
      },
      collapseEnabled: false
    },
    highlightOptions: {
      color: [255, 255, 255],
      haloOpacity: 0.5
    }
  });

  view.ui.remove("navigation-toggle");

  map.ground.layers = [new ExaggeratedElevationLayer({
    exaggerationBathymetry: 60,
    exaggerationTopography: 40
  })];

  const origin = new Point({
    x: 0, y: -90, z: -(2 * R)
  });

  const oceanSurface = new Graphic({
    geometry: origin,
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: {
            href: "./sphere/scene.gltf"
          },
          width: 2 * R
        }
      ]
    }
  });

  view.graphics.add(oceanSurface);

  const cloudsSphere = Mesh.createSphere(new Point({
    x: 0, y: -90, z: -(2 * R + offset)
  }), {
    size: 2 * (R + offset),
    material: {
      colorTexture: './clouds-nasa.png',
      doubleSided: false
    },
    densificationFactor: 4
  });

  cloudsSphere.components[0].shading = "flat";

  const clouds = new Graphic({
    geometry: cloudsSphere,
    symbol: {
      type: "mesh-3d",
      symbolLayers: [{ type: "fill" }]
    }
  });

  view.graphics.add(clouds);

  const extremesLayer = new GeoJSONLayer({
    url: "extreme-points.geojson",
    elevationInfo: {
      mode: "absolute-height",
      offset: offset
    },
    copyright: "Data from <a href=\"https://en.wikipedia.org/wiki/Extreme_points_of_Earth\" target=\"_blank\">Extreme points on Earth</a> Wikipedia article | <a href=\"https://sketchfab.com/3d-models/sphere-b31b12ffa93a40f48c9d991b6f168f4d\" target=\"_blank\"> 3D sphere model</a> by 3D Various under CC BY 4.0 used for the ocean surface | <a href=\"https://visibleearth.nasa.gov/view.php?id=57747\" target=\"_blank\">Cloud image</a> from NASA Goddard Space Flight Center (image by Reto Stöckli) for the cloud layer",
    renderer: {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [{
          type: "icon",
          resource: { primitive: "circle" },
          material: { color: [0, 0, 0, 0] },
          outline: { color: [245, 99, 66, 1], size: 4 },
          size: 10
        }, {
          type: "icon",
          resource: { primitive: "circle" },
          material: { color: [0, 0, 0, 0] },
          outline: { color: [245, 99, 66, 1], size: 2 },
          size: 30
        }]
      }
    },
    popupTemplate: {
      title: "{name}",
      content: `
        <div class="popupImage">
          <img src="{imageUrl}" alt="{imageCaption}"/>
        </div>
        <div class="popupImageCaption">{imageCaption}</div>
        <div class="popupDescription">
          <p class="info">
            <span class="esri-icon-favorites"></span> {type}
          </p>
          <p class="info">
            <span class="esri-icon-map-pin"></span> {location}
          </p>
          <p class="info">
            <span class="esri-icon-documentation"></span> {facts}
          </p>
        </div>
        <div class="popupCredits">
          Sources: <a href="{sourceUrl}" target="_blank">{source}</a> released under <a href="{sourceCopyrightUrl}">{sourceCopyright}</a>, <a href="{imageCopyrightUrl}" target="_blank">{imageCopyright}</a>.
        </div>
      `
    }
  });

  map.layers.add(extremesLayer);

  document.getElementById("close-about").addEventListener("click", closeMenu);

  document.getElementById("start-globe").addEventListener("click", function () {
    closeMenu();
    view.when(function () {
      watchUtils.whenFalseOnce(view, "updating", rotate);
    });
  });

  document.getElementById("container").addEventListener("click", function (e) {
    if (e.target.id === "container") {
      closeMenu();
      view.when(function () {
        watchUtils.whenFalseOnce(view, "updating", rotate);
      });
    }
  });

  function closeMenu() {
    document.getElementById("container").style.display = "none";
    view.container.style.filter = "blur(0px)";
  }

  let intro = true;
  document.getElementById("about").addEventListener("click", function () {
    document.getElementById("container").style.display = "flex";
    view.container.style.filter = "blur(10px)";
    if (intro) {
      document.getElementById("show-about").classList.remove("hidden");
      document.getElementById("show-intro").classList.add("hidden");
      intro = false;
    }
  });

  view.ui.add("about", "bottom-left");

  function rotate() {
    if (!view.interacting) {
      const camera = view.camera.clone();
      camera.position.longitude -= 0.2;
      view.goTo(camera, { animate: false });
      requestAnimationFrame(rotate);
    }
  }
});