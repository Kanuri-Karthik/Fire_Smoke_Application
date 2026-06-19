import { useEffect, useMemo, useState } from 'react';

import { Card, CardContent, CardHeader } from '../components/Common/Card';

import { Button } from '../components/Common/Button';
import { Input, Select } from '../components/Common/Input';
import { Badge } from '../components/Common/Badge';

import { Modal } from '../components/Common/Modal';
import { useToast } from '../components/ui/Toast';
import { Video, Plus, Search, Settings2, Trash2, AlertTriangle } from 'lucide-react';

import { useCameraStore } from '../store/cameraStore';



type Camera = {
  id: string;
  name: string;

  location: string;
  zone: string;
  status: CameraStatus;
  stream_url?: string;
  description?: string | null;
};


import {
  listCameras,
  createCamera,
  patchCamera,
  deleteCamera,
  patchCameraStatus,
  patchCameraZone,
  type CameraStatus,
} from '../services/cameraService';

const DEFAULT_FORM = {
  name: '',
  location: '',
  zone: '',
  stream_url: '',
  description: '',
};

type Mode = 'create' | 'edit';

const Cameras = () => {
  const { cameras, setCameras, isLoading, setLoading } = useCameraStore();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState({ ...DEFAULT_FORM });

  const [zoneAction, setZoneAction] = useState<string>('');

  const zones = useMemo(() => {
    const s = new Set<string>();
    cameras.forEach((c) => {
      if (c.zone) s.add(c.zone);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [cameras]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cameras.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q) ||
        (c.zone || '').toLowerCase().includes(q);
      const matchesZone = !zoneFilter || c.zone === zoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [cameras, search, zoneFilter]);

  const refresh = async () => {
    try {
      setLoading(true);
      const list = await listCameras();
      setCameras(
        list.map((c) => ({
          id: c.id,
          name: c.name,
          location: (c.location ?? '') as any,
          zone: (c.zone ?? '') as any,
          status: c.status as any,
          stream_url: c.stream_url ?? undefined,
        }))
      );
    } catch (e) {
      console.error(e);
      toast('Failed to load cameras', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setMode('create');
    setSelectedId(null);
    setForm({ ...DEFAULT_FORM });
    setModalOpen(true);
  };

  const openEdit = (cam: Camera) => {
    setMode('edit');
    setSelectedId(cam.id);
    setForm({
      name: cam.name ?? '',
      location: cam.location ?? '',
      zone: cam.zone ?? '',
      stream_url: cam.stream_url ?? '',
      description: (cam as any).description ?? '',
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Camera name is required';
    return null;
  };

  const submit = async () => {
    if (modalOpen === false) return;

    const err = validateForm();
    if (err) {
      toast(err, 'error');
      return;
    }

    const payload: any = {
      name: form.name.trim(),
      location: form.location.trim() || null,
      zone: form.zone.trim() || null,
      stream_url: form.stream_url.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      setLoading(true);
      if (mode === 'create') {
        await createCamera({
          name: payload.name,
          location: payload.location ?? undefined,
          zone: payload.zone ?? undefined,
          stream_url: payload.stream_url ?? undefined,
        } as any);
        toast('Camera added', 'success');
      } else {
        if (!selectedId) throw new Error('Missing camera id');
        await patchCamera(selectedId, payload);
        toast('Camera updated', 'success');
      }

      setModalOpen(false);
      await refresh();
    } catch (e: any) {
      console.error(e);
      toast(e?.message ? String(e.message) : 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (camera: Camera) => {
    try {
      setLoading(true);
      await deleteCamera(camera.id);
      toast('Camera deleted', 'success');
      await refresh();
    } catch (e: any) {
      console.error(e);
      toast(e?.message ? String(e.message) : 'Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (camera: Camera, next: CameraStatus) => {
    try {
      setLoading(true);
      await patchCameraStatus(camera.id, { status: next });
      toast(`Status updated: ${next}`, 'success');
      await refresh();
    } catch (e: any) {
      console.error(e);
      toast(e?.message ? String(e.message) : 'Status update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const assignZone = async (camera: Camera) => {
    try {
      const z = zoneAction.trim();
      if (!z) {
        toast('Zone is required', 'error');
        return;
      }
      setLoading(true);
      await patchCameraZone(camera.id, { zone: z });
      toast(`Zone assigned: ${z}`, 'success');
      setZoneAction('');
      await refresh();
    } catch (e: any) {
      console.error(e);
      toast(e?.message ? String(e.message) : 'Zone assignment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Camera Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage RTSP streams and camera configurations.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus size={18} className="mr-2" /> Add Camera
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex gap-4 flex-wrap items-end">
          <div className="flex-1 relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search cameras..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            label="Zone"
            options={[
              { label: 'All Zones', value: '' },
              ...zones.map((z) => ({ label: z, value: z })),
            ]}
            className="w-48"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((camera) => (
          <Card key={camera.id} className="flex flex-col">
            <CardHeader className="pb-0">
              <div className="aspect-video bg-gray-100 dark:bg-slate-800 relative flex items-center justify-center rounded-xl">
                {camera.status === 'online' ? (
                  <Video size={48} className="text-gray-300 dark:text-gray-600" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Video size={48} className="mx-auto mb-2 opacity-50" />
                    <span className="text-sm font-medium">
                      {camera.status === 'maintenance' ? 'Maintenance' : 'Offline'}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge
                    type={
                      camera.status === 'online' ? 'safe' : camera.status === 'maintenance' ? 'default' : 'default'
                    }

                  >
                    {camera.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white leading-tight">{camera.name}</h3>
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {camera.id}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {camera.location || '—'} • {camera.zone || 'Unassigned'}
                </p>
                {camera.stream_url ? (
                  <p className="text-xs text-gray-400 mt-2 font-mono break-all">{camera.stream_url}</p>
                ) : null}
              </div>

              <div className="space-y-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(camera)}>
                    <Settings2 size={16} className="mr-2" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => confirmDelete(camera)}
                    aria-label={`Delete ${camera.name}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant={camera.status === 'online' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => changeStatus(camera, 'online')}
                    disabled={camera.status === 'online' || isLoading}
                  >
                    Online
                  </Button>
                  <Button
                    variant={camera.status === 'offline' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => changeStatus(camera, 'offline')}
                    disabled={camera.status === 'offline' || isLoading}
                  >
                    Offline
                  </Button>
                  <Button
                    variant={camera.status === 'maintenance' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => changeStatus(camera, 'maintenance')}
                  >
                    Maint.
                  </Button>

                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Zone (e.g. A)"
                    value={selectedId === camera.id ? zoneAction : ''}
                    onChange={(e) => {
                      setSelectedId(camera.id);
                      setZoneAction(e.target.value);
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => assignZone(camera)}>
                    Assign
                  </Button>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <AlertTriangle size={14} className="text-gray-400 mt-[2px]" />
                  <span>
                    Status & zone changes persist immediately.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Add Camera' : 'Edit Camera'}
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void submit()} isLoading={false}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Front Gate"
            />
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="Building A"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Zone"
              value={form.zone}
              onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))}
              placeholder="A"
            />
            <Input
              label="Stream URL"
              value={form.stream_url}
              onChange={(e) => setForm((p) => ({ ...p, stream_url: e.target.value }))}
              placeholder="rtsp://..."
            />
          </div>

          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Optional notes"
          />

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => void submit()}>
              {mode === 'create' ? 'Create Camera' : 'Update Camera'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cameras;

