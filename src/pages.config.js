import About from './pages/About';
import Accessibility from './pages/Accessibility';
import Admin from './pages/Admin';
import AdminContent from './pages/AdminContent';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import Comparisons from './pages/Comparisons';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Features from './pages/Features';
import Formats from './pages/Formats';
import Glossary from './pages/Glossary';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Performance from './pages/Performance';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import ReportBug from './pages/ReportBug';
import Security from './pages/Security';
import TermsOfService from './pages/TermsOfService';
import Tutorials from './pages/Tutorials';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Accessibility": Accessibility,
    "Admin": Admin,
    "AdminContent": AdminContent,
    "Blog": Blog,
    "BlogArticle": BlogArticle,
    "Comparisons": Comparisons,
    "Contact": Contact,
    "FAQ": FAQ,
    "Features": Features,
    "Formats": Formats,
    "Glossary": Glossary,
    "Home": Home,
    "HowItWorks": HowItWorks,
    "Performance": Performance,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "ReportBug": ReportBug,
    "Security": Security,
    "TermsOfService": TermsOfService,
    "Tutorials": Tutorials,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};