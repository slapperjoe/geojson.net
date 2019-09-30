import React from "react";
import ReactDOM from "react-dom";
import LayerSwitch from "./ui/layer_switch";
import FileBar from "./ui/file_bar";
import Map from "./ui/map";
import LayerModal from "./ui/layer_modal";
import Dropzone from "react-dropzone";
import magicFile from "./lib/magic_file";
import mergeGeojson from "./lib/merge_geojson";
import { layers } from "./layers";
import ReactMapGL from "react-map-gl";

const initialGeojson = { type: "FeatureCollection", features: [] };

class App extends React.Component {
  state = {
    mode: "code",
    layer: "mapbox",
    layers: layers,
    layerModal: false,
    geojson: initialGeojson,
    changeFrom: undefined,
    dropzoneActive: false,
    viewport: {
      width: 400,
      height: 400,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8
    }
  };
  setMode = mode => {
    this.setState({ mode });
  };
  toggleLayerModal = () => {
    this.setState(({ layerModal }) => ({
      layerModal: !layerModal
    }));
  };
  addLayer = event => {
    event.preventDefault();

    const data = new FormData(event.target);

    const id = data.get("id");
    const title = data.get("title");
    const url = data.get("url");
    const attribution = data.get("attribution");

    const newLayer = {
      id,
      title,
      layer: L.tileLayer(url, {
        attribution
      })
    };
    const newLayers = this.state.layers.concat(newLayer);
    this.setState({
      layer: id,
      layers: newLayers,
      layerModal: false
    });
  };
  setLayer = layer => {
    this.setState({ layer });
  };
  setGeojson = (geojson, changeFrom) => {
    this.setState({ geojson, changeFrom });
  };
  onDragEnter = () => {
    this.setState({
      dropzoneActive: true
    });
  };
  onDragLeave = () => {
    this.setState({
      dropzoneActive: false
    });
  };
  onDrop = files => {
    this.setState({
      dropzoneActive: false
    });
    this.importFiles(files);
  };
  importFiles = async files => {
    const { geojson } = this.state;
    const { setGeojson } = this;
    const geojsons = await Promise.all(files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener("load", () =>
          resolve(magicFile(reader.result))
        );
      });
    }));
    setGeojson(mergeGeojson([geojson, ...geojsons]));
  };
  render() {
    const {
      geojson,
      geojsonObject,
      changeFrom,
      layer,
      layers,
      map,
      mode,
      layerModal,
      accept,
      files,
      dropzoneActive
    } = this.state;
    const { setGeojson, setLayer, setMode, togglePanel } = this;
    return (
        <Dropzone
          disableClick
          style={{ position: "relative" }}
          onDrop={this.onDrop}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        >
          <div className="f6 sans-serif fw6">
            <div className="vh-100 flex">
              <div
                className={`w-100 flex flex-column z-0`}
              >
                <div className="bg-white flex justify-between bb">
                  <FileBar
                    geojson={geojson}
                    geojsonObject={geojsonObject}
                    setGeojson={setGeojson}
                    toggleConfigModal={this.toggleConfigModal}
                  />
                </div>
                <ReactMapGL 
                  {...this.state.viewport}
                  onViewportChange={(viewport) => this.setState({viewport})}
                  mapboxApiAccessToken={"pk.eyJ1IjoibWFyaWMxIiwiYSI6Ii0xdWs1TlUifQ.U56tiQG_kj88zNf_1PxHQw"}
                />
                <Map
                  layer={layer}
                  layers={layers}
                  geojson={geojson}
                  setGeojson={setGeojson}
                  changeFrom={changeFrom}
                />
                <div className="flex justify-between bt">
                  <LayerSwitch
                    layers={layers}
                    layer={layer}
                    setLayer={setLayer}
                  />
                  <div
                    onClick={this.toggleLayerModal}
                    className="f6 fw7 dib pa2 no-underline bg-white hover-bg-light-blue black pointer"
                  >
                    Add layer
                  </div>
                </div>
              </div>
              {layerModal && (
                <LayerModal
                  onCancel={this.toggleLayerModal}
                  onSubmit={this.addLayer}
                />
              )}
            </div>
          </div>
          {dropzoneActive && (
            <div
              className="absolute absolute--fill bg-black-20 flex items-center justify-center"
              style={{
                zIndex: 999
              }}
            >
              <div className="sans-serif bg-white pa2 ba">
                Drop files to import
              </div>
            </div>
          )}
        </Dropzone>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("geojsonnet"));
