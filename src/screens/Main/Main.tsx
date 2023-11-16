import React from "react";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

import Header from "../Header";
import Assets from "pages/Assets";
import Exchange from "pages/Exchange";
import Futures from "pages/Futures";
import Bridge from "pages/Bridge";
import Loading from "components/loading";
import { setLoading } from "reducers/loading/loading";

const Main = () => {
    // const { isConnect } = useSelector((state: RootState) => state.wallet);

    return (
        <div className="text-sm dark:text-inherent dark:bg-black-900 font-Montserrat font-normal">
            <Loading></Loading>
            <div className="container mx-auto p-5 min-h-screen space-y-7 lg:space-y-10">
                <Router>
                    <Header></Header>
                    <Switch>
                        <Route path="/assets">
                            <Assets />
                        </Route>
                        <Route path="/exchange">
                            <Exchange />
                        </Route>
                        <Route path="/futures">
                            <Futures />
                        </Route>
                        <Route exact path="/bridge">
                            <Redirect to="/bridge/submit"></Redirect>
                        </Route>
                        <Route exact path="/bridge/submit">
                            <Bridge />
                        </Route>
                        <Route exact path="/bridge/receive">
                            <Bridge />
                        </Route>

                        <Route path="/">
                            <Redirect to="/exchange"></Redirect>
                        </Route>
                    </Switch>
                </Router>
            </div>
        </div>
    );
};
export default Main;
