import Home from './pages/Home';
import Profile from './pages/Profile';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import HowItWorks from './pages/HowItWorks';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Profile": Profile,
    "About": About,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "HowItWorks": HowItWorks,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};