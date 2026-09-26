import L from 'leaflet';

// Ensure L is available on window for leaflet plugins in the browser
if (typeof window !== 'undefined') {
  (window as any).L = L;
}

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

export default L;
export { L };
