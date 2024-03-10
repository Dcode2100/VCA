import React from "react";
import "./App.css";
import WebSocketTest from "../src/components/appComponents/WebSocketTest";
import WebRtcComponent from "../src/components/appComponents/WebRTCComponent"
const App = () => {
  return (
    <div className="flex justify-center items-center h-full w-full m-auto">
      <WebRtcComponent />
      {/* <WebSocketTest /> */}
      <div className="text-8xl">hEllowwoasdlfk</div>
    </div>
  );
};

export default App;
