require([
    "esri/Map",
    "esri/layers/FeatureLayer",
    "esri/renderers/DictionaryRenderer",
    "esri/widgets/Editor",
    "esri/views/MapView",
    "esri/popup/content/AttachmentsContent",
    "esri/popup/content/TextContent"
], function (
    Map,
    FeatureLayer,
    DictionaryRenderer,
    Editor,
    MapView,
    AttachmentsContent,
    TextContent
) {
    // Create the Map
    const map = new Map({
        basemap: "topo-vector"
    });
    let editor, features;
    /*************************************************************
     * The PopupTemplate content is the text that appears inside the
     * popup. Bracketed {fieldName} can be used to reference the value
     * of an attribute of the selected feature. HTML elements can be
     * used to provide structure and styles within the content.
     **************************************************************/
    const editThisAction = {
        title: "Edit feature",
        id: "edit-this",
        className: "esri-icon-edit"
    };

    const popupTemplate = {
        // autocasts as new PopupTemplate()
        title: "Customer: {caller_name}",
        content: [
            {
                // It is also possible to set the fieldInfos outside of the content
                // directly in the popupTemplate. If no fieldInfos is specifically set
                // in the content, it defaults to whatever may be set within the popupTemplate.
                type: "fields",
                fieldInfos: [
                    {
                        fieldName: "type",
                        label: "Incident type"
                    },
                    {
                        fieldName: "status",
                        label: "Status"
                    },
                    {
                        fieldName: "phone_number",
                        label: "Phone number"
                    },
                    {
                        fieldName: "notes",
                        label: "Notes"
                    }
                ]
            }
        ],
        actions: [editThisAction]
    };

    const view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 14,
        center: [11.5719, 48.151],
        highlightOptions: {
            haloOpacity: 0.65,
            fillOpacity: 0
          }
    });

    const scale = 36112;
    const featureLayer = new FeatureLayer({
        label: "Call incidents",
        displayField: "caller_name",
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/call_incidents/FeatureServer/0", 
        outFields: ["*"],
        popupTemplate: popupTemplate,
        renderer: new DictionaryRenderer({
            url: "https://jsapi.maps.arcgis.com/sharing/rest/content/items/c3616b301665497cb2043b62265d591c",  //dictionary style
            fieldMap: {
                type: "type",
                status: "status",
                number: "phone_number"
            },
            visualVariables: [
                {
                    type: "size",
                    valueExpression: "$view.scale",
                    stops: [
                        { value: scale / 2, size: 60 },
                        { value: scale * 2, size: 35 },
                        { value: scale * 4, size: 28 },
                        { value: scale * 8, size: 15 },
                        { value: scale * 16, size: 10 },
                        { value: scale * 32, size: 5 }
                    ]
                }
            ]
        })
    });

    map.add(featureLayer);

    Editor.prototype._handleSave = function _fixedHandleSave() {
        const { activeWorkflow: workflow } = this.viewModel;
        workflow.commit();
    };

    view.when(function () {
        // Create the Editor with the specified layer and a list of field configurations
        editor = new Editor({
            view: view,
            container: document.createElement("div"),
            layerInfos: [
                {
                    layer: featureLayer,
                    fieldConfig: [
                        {
                            name: "type",
                            label: "Incident type"
                        },
                        {
                            name: "status",
                            label: "Status",
                            domain: {
                                type: "coded-value",
                                name: "status",
                                codedValues: [
                                    { name: "New", code: "New" },
                                    { name: "In progress", code: "In progress" },
                                    { name: "Completed", code: "Completed" }
                                ]
                            }
                        },
                        {
                            name: "phone_number",
                            label: "Phone number"
                        },
                        {
                            name: "notes",
                            label: "Notes"
                        }

                    ]
                }
            ]
        });

        // Execute each time the "Edit feature" action is clicked
        function editThis() {
            // If the EditorViewModel's activeWorkflow is null, make the popup not visible
            if (!editor.viewModel.activeWorkFlow) {
                view.popup.visible = false;
                // Call the Editor update feature edit workflow

                editor.startUpdateWorkflowAtFeatureEdit(
                    view.popup.selectedFeature
                );
                view.ui.add(editor, "top-right");
                view.popup.spinnerEnabled = false;
            }

            // We need to set a timeout to ensure the editor widget is fully rendered. We
            // then grab it from the DOM stack
            setTimeout(function () {
                // Use the editor's back button as a way to cancel out of editing
                let arrComp = editor.domNode.getElementsByClassName(
                    "esri-editor__back-button esri-interactive"
                );
                if (arrComp.length === 1) {
                    // Add a tooltip for the back button
                    arrComp[0].setAttribute(
                        "title",
                        "Cancel edits, return to popup"
                    );
                    // Add a listerner to listen for when the editor's back button is clicked
                    arrComp[0].addEventListener("click", function (evt) {
                        // Prevent the default behavior for the back button and instead remove the editor and reopen the popup
                        evt.preventDefault();
                        view.ui.remove(editor);
                        view.popup.open({
                            features: features
                        });
                    });
                }
            }, 150);
        }

        // Event handler that fires each time an action is clicked
        view.popup.on("trigger-action", function (event) {
            if (event.action.id === "edit-this") {
                editThis();
            }
        });
    });

    // Watch when the popup is visible
    view.popup.watch("visible", function (event) {
        // Check the Editor's viewModel state, if it is currently open and editing existing features, disable popups
        if (editor.viewModel.state === "editing-existing-feature") {
            view.popup.close();
        } else {
            // Grab the features of the popup
            features = view.popup.features;
        }
    });

    featureLayer.on("apply-edits", function () {
        // Once edits are applied to the layer, remove the Editor from the UI
        view.ui.remove(editor);

        // Iterate through the features
        features.forEach(function (feature) {
            // Reset the template for the feature if it was edited
            feature.popupTemplate = popupTemplate;
        });

        // Open the popup again and reset its content after updates were made on the feature
        if (features) {
            view.popup.open({
                features: features
            });
        }

        // Cancel the workflow so that once edits are applied, a new popup can be displayed
        editor.viewModel.cancelWorkflow();
    });

    view.ui.add("info", {
        position: "top-left",
        index: 1
    });
    view.ui.add("toggle-snippet", "top-left");
});
