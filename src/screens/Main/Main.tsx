import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import { useSelector } from "react-redux"
import { RootState } from 'reducers'

import Header from '../Header'
import Assets from 'pages/Assets'
import Exchange from 'pages/Exchange'
import Futures from 'pages/Futures'
import Bridge from 'pages/Bridge'

const Main = () => {
    // const { isConnect } = useSelector((state: RootState) => state.wallet);
    return <div className="text-sm dark:text-white dark:bg-gray-900">
        {/* <Loading></Loading> */}
        <div className="container mx-auto px-5 pt-5 pb-6 min-h-screen">
            <Router>
                <Header></Header>
                <Switch>
                    <Route path="/assets">
                        <Assets/>
                    </Route>
                    <Route path="/exchange">
                        <Exchange />
                    </Route>
                    <Route path="/futures">
                        <Futures/>
                    </Route>
                    <Route path="/bridge">
                        <Bridge/>
                    </Route>
                    <Route path="/">
                        <Redirect to="/exchange"></Redirect>
                    </Route>
                    
                </Switch>
            </Router>
        
        </div>
</div>
}
export default Main;