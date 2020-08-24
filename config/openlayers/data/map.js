////////////////////////////////////////////////////////////////////////
// Initialize map
////////////////////////////////////////////////////////////////////////
const osm = new ol.layer.Tile({
    source: new ol.source.OSM(),
});

const map = new ol.Map({
    layers: [
        osm
    ],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([2.1,41.4]),
        zoom: 8,
    }),
  }
);


////////////////////////////////////////////////////////////////////////
// Popup overlay
////////////////////////////////////////////////////////////////////////
const popup_element = document.getElementById('popup');
const popup = new ol.Overlay({
    element: popup_element,
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -10],
});

map.addOverlay(popup);

// display popup on click
map.on('click', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature;
    });

    $(popup_element).popover('dispose');

    if (feature) {
        const coordinates = feature.getFlatMidpoint();
        popup.setPosition(coordinates);

        $(popup_element).popover({
            placement: 'top',
            html: true,
            content: feature.get('name'),
        });

        $(popup_element).popover('show');
    }
});



////////////////////////////////////////////////////////////////////////
// Layer selection
////////////////////////////////////////////////////////////////////////
const layer_name = "rasterdata:aca_sensor_river_flow";
const matrix_set = "EPSG:900913";

const active_layer_protocol = "VectorTile";

switch (active_layer_protocol) {
    case "WMS":
        loadWMSLayer();
        break;

    case "WMTS":
        loadWMTSLayer();
        break;

    case "VectorTile":
        loadVectorTileLayer();
        break;

    default:
        console.log("No protocol selected.");
        break;
}


////////////////////////////////////////////////////////////////////////
// WMS layer
////////////////////////////////////////////////////////////////////////

function loadWMSLayer() {
    const layer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: "https://geoserver.vm.local/geoserver/rasterdata/wms",
            projection: ol.proj.get("EPSG:3857"),
            params: {
                LAYERS: layer_name,
                VERSION: "1.3.0",
                FORMAT: "image/png"
            }
        })
    });

    map.addLayer(layer);
}


////////////////////////////////////////////////////////////////////////
// WMTS layer
////////////////////////////////////////////////////////////////////////

function loadWMTSLayer() {
    const capabilities_parser = new ol.format.WMTSCapabilities();
    const wmts_capabilities_url = "https://geoserver.vm.local/geoserver/gwc/service/wmts?REQUEST=GetCapabilities";

    fetch(wmts_capabilities_url)
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            const capabilities = capabilities_parser.read(text);

            const options = ol.source.WMTS.optionsFromCapabilities(capabilities, {
                layer: layer_name,
                matrixSet: matrix_set,
                format: 'image/png'
            });

            const layer = new ol.layer.Tile({
                source: new ol.source.WMTS(options)
            });

            map.addLayer(layer);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


////////////////////////////////////////////////////////////////////////
// Vector Tile layer
////////////////////////////////////////////////////////////////////////

function vectorStyle(feature) {
    // Properties
    const icon_type = feature.get("icon_type");
    const level = feature.get("level");

    // To display SVG images the file needs to contain a definition of height & width
    //const src_img = "img/light-bulb.svg";
    const src_img = `img/${icon_type}/${level}.png`;

    const img_style = new ol.style.Style({
        image: new ol.style.Icon({
            crossOrigin: '',
            scale: 0.7,
            src: src_img,
        }),
    });

    return  img_style;
}

function loadVectorTileLayer() {
    const layer = new ol.layer.VectorTile({
        style: vectorStyle,
        //renderBuffer: 1500,
        //declutter: true,
        source: new ol.source.VectorTile({
            tileGrid: ol.tilegrid.createXYZ({maxZoom: 19}),

            // format: new ol.format.TopoJSON(),
            // url: `https://geoserver.vm.local/gwc/service/tms/1.0.0/${layer_name}@${matrix_set}@topojson/{z}/{x}/{-y}.topojson`,

            // format: new ol.format.GeoJSON(),
            // url: `https://geoserver.vm.local/gwc/service/tms/1.0.0/${layer_name}@${matrix_set}@geojson/{z}/{x}/{-y}.geojson`,

            format: new ol.format.MVT(),
            url: `https://geoserver.vm.local/gwc/service/tms/1.0.0/${layer_name}@${matrix_set}@pbf/{z}/{x}/{-y}.pbf`,
        }),
    });

    map.addLayer(layer);
}
