
import React from "react";
import ReactDOM from "react-dom";
import ReactMapGL, { NavigationControl, FullscreenControl, BaseControl} from "react-map-gl";

const fullscreenControlStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '10px'
};

const navStyle = {
  position: 'absolute',
  top: 36,
  left: 0,
  padding: '10px'
};

const drawStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  padding: '10px'
};

export default class DrawMap extends React.Component {
  
  state = {
    viewport: {
      width: 400,
      height: 400,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 8
    }
  };
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ReactMapGL 
        {...this.state.viewport}
        onViewportChange={(viewport) => this.setState({viewport})}
        mapboxApiAccessToken={"pk.eyJ1IjoibWFyaWMxIiwiYSI6Ii0xdWs1TlUifQ.U56tiQG_kj88zNf_1PxHQw"} 
      >
        <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
        </div>
        <div className="nav" style={navStyle}>
          <NavigationControl />
        </div>

        <div className="draw" style={drawStyle}>
          <BaseControl  />
        </div>

      </ReactMapGL>
    )
  }
}