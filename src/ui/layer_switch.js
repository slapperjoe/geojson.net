import React from "react";

export default ({ layer, layers, setLayer }) => {
  return (  
  <div className="flex">
    <select defaultValue={layer} onChange={(selectEvent) => {
      setLayer(selectEvent.currentTarget.value)}}>
      {layers.map(({id, title}) => (
        <option key={id} value={id}>{title}</option>
      ))}
    </select>
  </div>
)};
