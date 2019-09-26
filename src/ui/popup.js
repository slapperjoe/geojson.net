import ReactJson from "react-json-view";
import React from "react";
import { geometry as geometryArea } from "@mapbox/geojson-area";
import {icon} from '../map/icon';
import NumericInput from 'react-numeric-input'
import InputNumber from 'react-input-number'

export default class Popup extends React.Component {
  state = {
    tab: "display properties"
  };
  setTab = tab => {
    this.setState({ tab });
  };
  render() {
    const tabs = ["display properties", "other properties", "statistics"];
    const { tab } = this.state;
    const { layer, editProperties, popupRemoveLayer } = this.props;
    const { properties } = layer.toGeoJSON();
    const otherProps = properties.filter ? properties.filter(a => {
      return ["marker-color", "marker-size", "stroke", "stroke-width", "stroke-opacity", "fill", "fill-opacity"].indexOf(a) === -1;
    }) : [];
    return (
      <div>
        <div className="bb flex fw6">
          {tabs.map(name => (
            <span
              key={name}
              onClick={() => this.setTab(name)}
              className={`db pointer bn pa2 outline-0 ${
                tab === name ? "bg-light-blue" : ""
              }`}
            >
              {name}
            </span>
          ))}
        </div>
        {tab === "other properties" ? (
          <div className="pa2">
            <ReactJson
              name="properties"
              displayDataTypes={false}
              onEdit={editProperties}
              onAdd={editProperties}
              onDelete={editProperties}
              enableClipboard={false}
              src={otherProps}
            />
          </div>
        ) : tab === "statistics" ? (
          <Metadata layer={layer} />
        ) : tab === "display properties" ? (
          <DisplayTable layer={layer} props={properties} />
        ) : null}
        <div className="bt flex fw6">
          <span
            className="db pointer bn pa2 hover-bg-light-blue"
            onClick={() => popupRemoveLayer(layer)}
          >
            Delete feature
          </span>
        </div>
      </div>
    );
  }
}

const Metadata = ({ layer }) => {
  const { geometry } = layer.toGeoJSON();
  if (geometry.type === "Point") {
    const {
      coordinates: [longitude, latitude]
    } = geometry;
    return (
      <Table
        obj={{
          Latitude: latitude.toFixed(4),
          Longitude: longitude.toFixed(4)
        }}
      />
    );
  } else if (geometry.type === "Polygon") {
    const area = geometryArea(geometry);
    return (
      <Table
        obj={{
          "Sq. Meters": area.toFixed(2),
          "Sq. Kilometers": (area / 1000000).toFixed(2),
          "Sq. Feet": (area / 0.092903).toFixed(2),
          Acres: (area / 4046.86).toFixed(2),
          "Sq. Miles": (area / 2589990).toFixed(2)
        }}
      />
    );
  } else if (geometry.type === "LineString") {
    const { coordinates } = geometry;
    let total = 0;
    for (var i = 0; i < coordinates.length - 1; i++) {
      const a = coordinates[i];
      const b = coordinates[i + 1];
      total += L.latLng(a[1], a[0]).distanceTo(L.latLng(b[1], b[0]));
    }
    return (
      <Table
        obj={{
          Meters: total.toFixed(2),
          Kilometers: (total / 1000).toFixed(2),
          Feet: (total / 0.3048).toFixed(2),
          Yards: (total / 0.9144).toFixed(2),
          Miles: (total / 1609.34).toFixed(2)
        }}
      />
    );
  }
  return null;
};

const Table = ({ obj }) => {
  return (
    <table className="collapse w-100">
      <tbody>
        {Object.entries(obj).map(([key, value], i) => {
          return (
            <tr key={i} className="striped--light-gray">
              <th className="pa1">{key}</th>
              <td className="pa1">{value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const DisplayContent = ({layer, props}) => {
  if (layer.feature && layer.feature.geometry){
    if (layer.feature.geometry.type === 'Point' || layer.feature.geometry.type === 'MultiPoint') {
      return (
        <tbody>
          <tr className="style-row">
            <th>marker-color</th>
            <td>
              <input onChange={(event) => {
                props["marker-color"] = event.currentTarget.value;
                const newIcon = icon(props);
                layer.setIcon(newIcon);
                }} type="color" defaultValue="#2B82CB"></input>
            </td>
          </tr>
          <tr className="style-row">
            <th>marker-size</th>
            <td>
              <select value={props['marker-size'] ? props['marker-size'] : 'medium'} onChange={(event) => {
                props["marker-size"] = event.currentTarget.value;
                layer.setIcon(icon(props));
              }}>
                <option value="small">small</option>
                <option value="medium">medium</option>
                <option value="large">large</option>
              </select>
            </td>
          </tr> 
          <tr className="style-row">
            <th>marker-symbol</th>
            <td>
              <input type="text" list="marker-symbol" value={props['marker-symbol']} />
              <datalist id="marker-symbol"></datalist>
            </td>
          </tr>
        </tbody>
      );
    }
    if (layer.feature.geometry.type === 'LineString' || layer.feature.geometry.type === 'MultiLineString') {              
      return (
        <tbody>
          <tr className="style-row">
            <th>stroke</th>
            <td>
              <input type="color" defaultValue="#2B82CB"
                onChange={(event) => {
                  props["stroke"] = event.currentTarget.value;
                  layer.setStyle({color: event.currentTarget.value});
                }}>
              </input>
            </td>
          </tr>
          <tr className="style-row">
            <th>stroke-width</th>
            <td>
              <input type="number" defaultValue="1" min="1" max="8"
                onChange={()=> {
                  props["stroke-width"] = event.target.value;
                  layer.setStyle({weight: event.target.value});
                }}
              ></input>
            </td>
          </tr>
          <tr className="style-row">
            <th>stroke-opacity</th>
            <td>
              <input type="number" defaultValue="1" min="0" max="1" step="0.1"
                onChange={()=> {
                  props["stroke-opacity"] = event.target.value;
                  layer.setStyle({opacity: event.target.value});
                }}
              ></input>
            </td>
          </tr>  
        </tbody>
      );
    }
    if (layer.feature.geometry.type === 'Polygon' || layer.feature.geometry.type === 'MultiPolygon') {              
      return (
        <tbody>
          <tr className="style-row">
            <th>stroke</th>
            <td>
              <input type="color" defaultValue="#2B82CB"
                onChange={(event) => {
                  props["stroke"] = event.currentTarget.value;
                  layer.setStyle({color: event.currentTarget.value});
                }}>
              </input>
            </td>
          </tr>
          <tr className="style-row">
            <th>stroke-width</th>
            <td>
              <input type="number" defaultValue="1" min="1" max="8"
                onChange={()=> {
                  props["stroke-width"] = event.target.value;
                  layer.setStyle({weight: event.target.value});
                }}
              ></input>
            </td>
          </tr>
          <tr className="style-row">
            <th>fill</th>
            <td>
              <input type="checkbox" defaultValue="false"
                onChange={()=> {
                  props["fill"] = event.target.value;
                  layer.setStyle({fill: event.currentTarget.value});
                }}
              ></input>
            </td>
          </tr>  
          <tr className="style-row">
            <th>fill-color</th>
            <td>
              <input type="color" defaultValue="#2B82CB"
                onChange={()=> {
                  props["fill-color"] = event.currentTarget.value;
                  layer.setStyle({fillColor: event.target.value});
                }}
              ></input>
            </td>
          </tr>
          <tr className="style-row">
            <th>fill-opacity</th>
            <td>
            <input type="number" defaultValue="0.2" min="0" max="1" step="0.1"
                onChange={()=> {
                  props["fill-opacity"] = event.target.value;
                  layer.setStyle({fillOpacity: event.target.value});
                }}
              ></input>
            </td>
          </tr>      
        </tbody>
      );
    }    
  }
  return null;
};

const DisplayTable = ({layer, props}) => {
  return <table className="space-bottom0 marker-properties">
    <DisplayContent layer={layer} props={props} />
  </table>
};
