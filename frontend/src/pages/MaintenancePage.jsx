import Icon from '../components/Icon';

export default function MaintenancePage() {
  return <section>
    <div className="page-header"><div><h1>Maintenance</h1><p>Aircraft maintenance and alerts.</p></div></div>
    <div className="empty-state maintenance-empty"><Icon name="maintenance" size={60} /><h2>Maintenance records are not connected yet</h2><p>This page will show maintenance records once connected.</p></div>
  </section>;
}
