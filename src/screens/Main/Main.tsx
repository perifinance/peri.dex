import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import Header from '../Header'
import Assets from 'pages/Assets'
import Exchage from 'pages/Exchage'
import Home from 'pages/Home'

const Main = () => {
    return <div className="dark:bg-gray-900">
        <div className="container mx-auto px-4">
            <Router>
                <Header></Header>
                <Switch>
                    <Route path="/assets">
                        <Assets />
                    </Route>
                    <Route path="/exchage">
                        <Exchage />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </Router>
        
        </div>
</div>
}
export default Main;