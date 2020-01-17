require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/renderers/DictionaryRenderer",
    "esri/widgets/Bookmarks",
    "esri/webmap/Bookmark"
], function (
    Map,
    MapView,
    FeatureLayer,
    DictionaryRenderer
) {
    const map = new Map({
        basemap: "topo-vector"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-115.0966, 33.09726],
        zoom: 13
    });

    view.ui.add("toggle-snippet", "top-left");

    const scale = 36112;
    const layer = new FeatureLayer({
        url:
            "https://services1.arcgis.com/6677msI40mnLuuLr/arcgis/rest/services/Land_Equipment/FeatureServer/2",
        outFields: ["*"],
        //  popupTemplate: popupTemplate,
        renderer: new DictionaryRenderer({
            url: "https://devtesting.mapsdevext.arcgis.com/sharing/rest/content/items/7923dac92202452ab602359c3398e077", //"https://runtime.maps.arcgis.com/sharing/rest/content/items/a0adf685cf9a4650a487a6e3a24da30e",
            fieldMap: {
                context: "context",
                identity: "identity_",
                symbolset: "symbolset",
                indicator: "indicator",
                //echelon:"echelon",
                mobility: "mobility",
                //array: "",
                symbolentity: "symbolentity",
                modifier1: "modifier1",
                //modifier2: "",
                //specialentitysubtype: "",
                civilian: "civilian",
                direction: "direction",
                //sidc: "",
                operationalcondition: "operationalcondition"
            },
            config: {
                modifiers: "ON",
                frame: "ON",
                fill: "ON",
                icon: "ON",
                text: "ON",
                colors: "LIGHT"
            },
            visualVariables: [
                {
                    type: "size",
                    valueExpression: "$view.scale",
                    stops: [
                        { value: scale / 2, size: 300 },
                        { value: scale * 2, size: 120 },
                        { value: scale * 4, size: 115 },
                        { value: scale * 8, size: 30 },
                        { value: scale * 16, size: 20 },
                        { value: scale * 32, size: 15 }
                    ]
                }
            ]
        })
    });

    map.add(layer);
});