import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import {ProductEdit, ProductList} from "./Products";
import {ProductProvider} from "./Products/ProductProvider";

const App: React.FC = () => (
  <IonApp>
      <ProductProvider>
        <IonReactRouter>
            <IonRouterOutlet>
                <Route path="/products" component={ProductList} exact={true} />
                <Route path="/product" component={ProductEdit} exact={true} />
                <Route path="/product/:id" component={ProductEdit} exact={true} />
                <Route exact path="/" render={() => <Redirect to="/products" />} />
            </IonRouterOutlet>
        </IonReactRouter>
      </ProductProvider>
  </IonApp>
);

export default App;
