import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import Header from '../Header'
import Assets from 'pages/Assets'
import Exchage from 'pages/Exchage'
import Futures from 'pages/Futures'
import Home from 'pages/Home'

const Main = () => {
    return <div className="dark:bg-gray-900">
        <div className="container mx-auto p-4">
            <Router>
                <Header></Header>
                <Switch>
                    <Route path="/assets">
                        <Assets />
                    </Route>
                    <Route path="/exchage">
                        <Exchage />
                    </Route>
                    <Route path="/futures">
                        <Futures/>
                    </Route>
                    <Route path="/">
                        <Redirect to="/exchage"></Redirect>
                    </Route>
                </Switch>
            </Router>
        
        </div>
</div>
}
export default Main;