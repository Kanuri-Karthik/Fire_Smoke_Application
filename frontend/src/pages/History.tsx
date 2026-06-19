import { useEffect, useMemo, useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Input, Select } from '../components/Common/Input';
import { Download, Search, Calendar, History as HistoryIcon } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/Common/Table';
import { Badge } from '../components/Common/Badge';
import { useToast } from '../components/ui/Toast';
import { getHistory, exportHistoryCsv, exportHistoryPdf, type HistoryType, type HistoryStatus, type HistoryItem } from '../services/historyService';

const toDateLocalInput = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const History = () => {
  const { toast } = useToast();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const pages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const load = async () => {
    try {
      const res = await getHistory({
        page,
        page_size: pageSize,
        search: search || undefined,
        status: (status || undefined) as HistoryStatus | undefined,
        type: (type || undefined) as HistoryType | undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
      toast('Failed to load history', 'error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, status, type, startDate, endDate]);

  const doExportCsv = async () => {
    try {
      const blob = await exportHistoryCsv({
        search: search || undefined,
        status: (status || undefined) as HistoryStatus | undefined,
        type: (type || undefined) as HistoryType | undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `history_${toDateLocalInput(new Date())}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast('CSV export failed', 'error');
    }
  };

  const doExportPdf = async () => {
    try {
      const blob = await exportHistoryPdf({
        search: search || undefined,
        status: (status || undefined) as HistoryStatus | undefined,
        type: (type || undefined) as HistoryType | undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `history_${toDateLocalInput(new Date())}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast('PDF export failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Historical Data</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and export past incidents.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={doExportCsv}>
            <Download size={18} className="mr-2" /> Export CSV
          </Button>
          <Button variant="outline" onClick={doExportPdf}>
            <Download size={18} className="mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by ID, camera, or location..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="date"
              className="pl-10"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="date"
              className="pl-10"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Select
            label="Status"
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Acknowledged', value: 'acknowledged' },
              { label: 'Resolved', value: 'resolved' },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          <Select
            label="Type"
            options={[
              { label: 'All Types', value: '' },
              { label: 'Fire', value: 'fire' },
              { label: 'Smoke', value: 'smoke' },
            ]}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />

          <Select
            label="Page Size"
            options={[
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '50', value: 50 },
            ]}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon size={18} className="text-primary" />
            Incidents
          </CardTitle>
          <div className="text-sm text-gray-500">Total: {total}</div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-full mb-4">
                <HistoryIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No incidents found</h3>
              <p className="text-gray-500 max-w-md">Adjust filters to view records.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location / Camera</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-mono text-xs text-gray-500">{it.id.split('-')[0]}</TableCell>
                    <TableCell>
                      <Badge type={it.detection_type}>{it.detection_type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{it.location || it.camera_id || 'Unknown'}</TableCell>
                    <TableCell>{(it.confidence * 100).toFixed(1)}%</TableCell>
                    <TableCell>{new Date(it.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge type={it.status as any}>{it.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <div className="text-sm text-gray-500">
              Page {page} of {pages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;

