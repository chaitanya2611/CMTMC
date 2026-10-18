import { Link } from 'react-router-dom';
import { PageHead } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <>
      <PageHead title="Page not found" intro="That address doesn’t match any page on this site." />
      <div className="shell band"><Link className="btn btn--forest" to="/">Go to the home page</Link></div>
    </>
  );
}
