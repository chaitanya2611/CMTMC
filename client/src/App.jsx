import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Research from './pages/Research.jsx';
import ResearchDetail from './pages/ResearchDetail.jsx';
import Gallery from './pages/Gallery.jsx';
import People from './pages/People.jsx';
import Publications from './pages/Publications.jsx';
import News from './pages/News.jsx';
import NewsItem from './pages/NewsItem.jsx';
import Openings from './pages/Openings.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

// The admin panel loads only when someone visits /admin
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="research" element={<Research />} />
        <Route path="research/:id" element={<ResearchDetail />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="people" element={<People />} />
        <Route path="publications" element={<Publications />} />
        <Route path="news" element={<News />} />
        <Route path="news/:id" element={<NewsItem />} />
        <Route path="openings" element={<Openings />} />
        <Route path="contact" element={<Contact />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin/*" element={<Suspense fallback={<div className="adm-boot">Loading admin…</div>}><AdminApp /></Suspense>} />
    </Routes>
  );
}
