import "./admin/aziadashboard/template/css/azia.css";
import "./admin/css/style.scss";

import React from "react";
import ReactDOM from "react-dom";

import {App} from "./admin/App";
// import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
if (module.hot) {
    // eslint-disable-line no-undef
    module.hot.accept(); // eslint-disable-line no-undef
}
