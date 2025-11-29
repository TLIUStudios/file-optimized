import Home from './pages/Home';
import Profile from './pages/Profile';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Profile": Profile,
    "About": About,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "HowItWorks": HowItWorks,
    "Contact": Contact,
    "FAQ": FAQ,
    "Pricing": Pricing,
    "Blog": Blog,
    "BlogArticle": BlogArticle,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};