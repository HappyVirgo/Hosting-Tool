import React from "react";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";

import Header from "./components/Header";
import UserProvider from "./providers/UserProvider";

const MultiCalendar = React.lazy(() => import("./components/MultiCalendar"));
const Turnovers = React.lazy(() => import("./components/Turnovers"));
const Footer = React.lazy(() => import("./components/Footer"));
const Billing = React.lazy(() => import("./components/Billing"));
const FAQ = React.lazy(() => import("./components/FAQ"));
const Listings = React.lazy(() => import("./components/Listings"));
const Messaging = React.lazy(() => import("./components/Messaging"));
const Pricing = React.lazy(() => import("./components/Pricing"));
const Settings = React.lazy(() => import("./components/Settings"));
const Inbox = React.lazy(() => import("./components/Inbox"));

function WaitingComponent(Component) {
    return props => (
        <React.Suspense fallback={<div />}>
            <Component {...props} />
        </React.Suspense>
    );
}

export const App = () => (
    <UserProvider>
        <BrowserRouter>
            <div className="az-minimal">
                <Header />
                <Switch>
                    <Route exact path="/" component={WaitingComponent(MultiCalendar)} />
                    <Route path="/inbox/:reservationID?" component={WaitingComponent(Inbox)} />

                    <Route path="/turnovers" component={WaitingComponent(Turnovers)} />
                    <Route
                        path="/messaging/:airbnbUserID/:airbnbListingID?"
                        component={WaitingComponent(Messaging)}
                    />
                    <Route
                        path="/pricing/:airbnbUserID/:airbnbListingID?"
                        component={WaitingComponent(Pricing)}
                    />
                    <Route path="/listings" component={WaitingComponent(Listings)} />
                    <Route path="/settings" component={WaitingComponent(Settings)} />
                    <Route path="/billing" component={WaitingComponent(Billing)} />
                    <Route path="/faq" component={WaitingComponent(FAQ)} />
                    <Redirect to="/" />
                </Switch>
                <React.Suspense fallback={<div />}>
                    <Footer />
                </React.Suspense>
            </div>
        </BrowserRouter>
    </UserProvider>
);

export default App;
