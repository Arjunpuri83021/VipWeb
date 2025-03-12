import './App.css';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/partials/Navbar';
import Video from './components/Video/Video';
import StarsVideo from './components/Video/StarsVideo';
import Indian from './components/Indians';
import Muslim from './components/Muslim';
import TopVideo from './components/TopVideos';
import NewContent from './components/NewContente';
import MostLiked from './components/MostLiked';
import PornStars from './components/PornStars';
import NotFound from './components/partials/NotFound';
import Scout69 from './components/Category/scout69';
import Lesbify from './components/Category/Lesbify';
import Milf from './components/Category/Milf';
import Sister from './components/Category/Sister';
import Desi from './components/Category/Desi';
import Dehati from './components/Category/Dehati';
import Boobs from './components/Category/Boobs';
import Blueflim from './components/Category/Blueflim';
import Family from './components/Category/Family';
import Teen from './components/Category/Teen';
import SmallTits from './components/Category/SmallTits';
import Network from './components/Networks';
import Comxxx from './components/Category/Comxxx';
import Badwap from './components/Category/Badwap';
import Chochox from './components/Category/Chochox';
import Sex18 from './components/Category/Sex18';
import Aunt from './components/Category/Aunt';
import Fullporner from './components/Category/Fullporner';

function App() {
    return (
        <Router>
            <Routes>
            <Route path='/:page' element={<Home />} />
            <Route path='/' element={<Home />} />
            <Route path='/video/:id' element={<Video />} />
                <Route path='/pornstar/:name' element={<StarsVideo />} />
                <Route path='/indian' element={<Indian />} />
                <Route path='/muslim' element={<Muslim />} />
                <Route path='/top-videos' element={<TopVideo />} />
                <Route path='/new-content' element={<NewContent />} />
                <Route path='/most-liked' element={<MostLiked />} />
                <Route path='/pornstars' element={<PornStars />} />
                <Route path='/our-network' element={<Network/>} />
                
                <Route path='/category/scout69' element={<Scout69 />} />
                <Route path='/category/scout69/:page' element={<Scout69 />} />

                <Route path='/category/comxxx' element={<Comxxx/>} />
                <Route path='/category/comxxx/:page' element={<Comxxx/>} />

                <Route path='/category/badwap' element={<Badwap/>} />
                <Route path='/category/badwap/:page' element={<Badwap/>} />

                <Route path='/category/chochox' element={<Chochox/>} />
                <Route path='/category/chochox/:page' element={<Chochox/>} />

                <Route path='/category/sex18' element={<Sex18/>} />
                <Route path='/category/sex18/:page' element={<Sex18/>} />

                <Route path='/category/aunt-sex' element={<Aunt/>} />
                <Route path='/category/aunt-sex/:page' element={<Aunt/>} />

                <Route path='/category/fullporner' element={<Fullporner/>} />
                <Route path='/category/fullporner/:page' element={<Fullporner/>} />

                <Route path='/category/lesbify' element={<Lesbify />} />
                <Route path='/category/lesbify/:page' element={<Lesbify />} />

                <Route path='/category/milfnut' element={<Milf />} />
                <Route path='/category/milfnut/:page' element={<Milf />} />

                <Route path='/category/sex-sister' element={<Sister />} />
                <Route path='/category/sex-sister/:page' element={<Sister />} />


                <Route path='/category/desi49' element={<Desi />} />
                <Route path='/category/desi49/:page' element={<Desi />} />

                <Route path='/category/dehati-sex' element={<Dehati />} />
                <Route path='/category/dehati-sex/:page' element={<Dehati />} />

                <Route path='/category/boobs-pressing' element={<Boobs />} />
                <Route path='/category/boobs-pressing/:page' element={<Boobs />} />


                <Route path='/category/blueflim/:page' element={<Blueflim />} />
                <Route path='/category/blueflim' element={<Blueflim />} />

                <Route path='/category/famili-sex-com' element={<Family />} />
                <Route path='/category/famili-sex-com/:page' element={<Family />} />

                <Route path='/category/teen-sex' element={<Teen />} />
                <Route path='/category/teen-sex/:page' element={<Teen />} />

                
                <Route path='/category/small-tits' element={<SmallTits />} />
                <Route path='/category/small-tits/:page' element={<SmallTits />} />


                {/* Catch-all route for unmatched URLs */}
                <Route path='*' element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
