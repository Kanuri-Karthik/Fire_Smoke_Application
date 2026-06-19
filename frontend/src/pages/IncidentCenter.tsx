import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/Common/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Common/Table';
import { Badge } from '../components/Common/Badge';
import { Button } from '../components/Common/Button';
import { Input, Select } from '../components/Common/Input';
import { Drawer } from '../components/Common/Drawer';
import { Search, Eye, AlertTriangle, Video } from 'lucide-react';
import { useIncidentStore } from '../store/incidentStore';
import { useToast } from '../components/ui/Toast';
import { updateAlertStatus } from '../services/api';
import type { Alert } from '../store/dashboardStore';

type Incident = Alert;



// Constrain to store's Alert type shape.




const IncidentCenter = () => {
  const { incidents, isLoading, filters, setFilters, setIncidents, setLoading, updateIncidentStatus } = useIncidentStore();
  const { toast } = useToast();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);



  const acknowledgeStatus = 'acknowledged' as const;



  const reloadIncidents = async () => {
    setLoading(true);
    setTimeout(() => {
      setIncidents([
        { id: '1', detection_type: 'fire', location: 'Warehouse A', confidence: 0.92, timestamp: new Date(Date.now() - 1000*60*5).toISOString(), status: 'active', camera_id: 'CAM-01' },
        { id: '2', detection_type: 'smoke', location: 'Loading Dock', confidence: 0.85, timestamp: new Date(Date.now() - 1000*60*15).toISOString(), status: 'acknowledged', camera_id: 'CAM-04' },
        { id: '3', detection_type: 'smoke', location: 'Lobby', confidence: 0.76, timestamp: new Date(Date.now() - 1000*60*45).toISOString(), status: 'resolved', camera_id: 'CAM-02' },
      ]);
      setLoading(false);
    }, 500);
  };

  const acknowledgeIncident = async (alertId: string) => {
    try {
      updateIncidentStatus(alertId, 'acknowledged');
      if (selectedIncident) setSelectedIncident({ ...selectedIncident, status: 'acknowledged' });
      toast('Incident acknowledged', 'success');
    } catch (e: unknown) {
      console.error(e);
      toast('Failed to acknowledge incident', 'error');
    }
  };

  const resolveIncident = async (alertId: string) => {
    try {
      updateIncidentStatus(alertId, 'resolved');
      if (selectedIncident) setSelectedIncident({ ...selectedIncident, status: 'resolved' });
      toast('Incident resolved', 'success');
    } catch (e: unknown) {
      console.error(e);
      toast('Failed to resolve incident', 'error');
    }
  };


  useEffect(() => {
    reloadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (filters.status && inc.status !== filters.status) return false;
    if (filters.detection_type && inc.detection_type !== filters.detection_type) return false;
    if (filters.search && !inc.location?.toLowerCase().includes(filters.search.toLowerCase()) && !inc.id.includes(filters.search)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search by ID or location..." 
              className="pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select 
              value={filters.detection_type}
              onChange={(e) => setFilters({ detection_type: e.target.value })}
              options={[
                { label: 'All Types', value: '' },
                { label: 'Fire', value: 'fire' },
                { label: 'Smoke', value: 'smoke' }
              ]} 
              className="w-40"
            />
            <Select 
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Active', value: 'active' },
                { label: 'Acknowledged', value: 'acknowledged' },
                { label: 'Resolved', value: 'resolved' }
              ]}
              className="w-44"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Incident ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location / Camera</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">Loading incidents...</TableCell>
              </TableRow>
            ) : filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <AlertTriangle size={32} className="mb-2 opacity-50" />
                    <p>No incidents found matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-mono text-xs text-gray-500">{incident.id.split('-')[0]}</TableCell>
                  <TableCell>
                    <Badge type={incident.detection_type}>{incident.detection_type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{incident.location || incident.camera_id || 'Unknown'}</TableCell>
                  <TableCell>{(incident.confidence * 100).toFixed(1)}%</TableCell>
                  <TableCell>{new Date(incident.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge type={incident.status}>{incident.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(incident)}>
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Drawer
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title="Incident Details"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedIncident(null)}>Close</Button>
            <Button
              variant="primary"
              onClick={() => selectedIncident && acknowledgeIncident(selectedIncident.id)}
              disabled={!selectedIncident || selectedIncident.status !== 'active'}
            >
              Acknowledge
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedIncident && resolveIncident(selectedIncident.id)}
              disabled={!selectedIncident || selectedIncident.status !== 'acknowledged'}
            >
              Resolve
            </Button>
          </>
        }
      >
        {selectedIncident && (
          <div className="space-y-6">
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative">
              {selectedIncident.evidence_path ? (
                <img 
                  src={`/evidence/${selectedIncident.evidence_path.split('/').pop()}`} 

                  alt="Evidence" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Video size={32} />
                  <span className="ml-2 font-medium">No Image Evidence</span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                 <Badge type={selectedIncident.detection_type}>{selectedIncident.detection_type}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                <Badge type={selectedIncident.status}>{selectedIncident.status}</Badge>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Confidence</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{(selectedIncident.confidence * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedIncident.location || selectedIncident.camera_id || 'Unknown'}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Detected At</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default IncidentCenter;
