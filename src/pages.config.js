/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
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