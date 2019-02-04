import React from 'react';
import { render } from 'react-dom';
import App from './containers/App';

import 'bootstrap/dist/css/bootstrap.min.css';
// Now we can render our application into it
render( <App />, document.getElementById('app') );
