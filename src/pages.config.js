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
import Features from './pages/Features';
import Formats from './pages/Formats';
import AdminContent from './pages/AdminContent';
import Changelog from './pages/Changelog';
import Accessibility from './pages/Accessibility';
import Admin from './pages/Admin';
import Security from './pages/Security';
import Tutorials from './pages/Tutorials';
import Glossary from './pages/Glossary';
import Comparisons from './pages/Comparisons';
import Performance from './pages/Performance';
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
    "Features": Features,
    "Formats": Formats,
    "AdminContent": AdminContent,
    "Changelog": Changelog,
    "Accessibility": Accessibility,
    "Admin": Admin,
    "Security": Security,
    "Tutorials": Tutorials,
    "Glossary": Glossary,
    "Comparisons": Comparisons,
    "Performance": Performance,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};