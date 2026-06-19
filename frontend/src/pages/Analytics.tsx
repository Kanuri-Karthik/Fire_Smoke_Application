import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAnalyticsStore } from '../store/analyticsStore';

import { getAnalyticsIncidentTrends, getAnalyticsFireSmokeDistribution } from '../services/api';

type WeeklyTrendPoint = { day: string; fire: number; smoke: number };

type FireSmokeBreakdownPoint = { name: string; value: number; color: string };



const Analytics = () => {
  const { setAnalyticsData, weeklyTrend, typeBreakdown } = useAnalyticsStore();


  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [incidentTrends, fireSmoke] = await Promise.all([
        getAnalyticsIncidentTrends(),
        getAnalyticsFireSmokeDistribution(),
      ]);

      if (cancelled) return;

      setAnalyticsData({
        weeklyTrend: incidentTrends as unknown as WeeklyTrendPoint[],
        typeBreakdown: fireSmoke as unknown as FireSmokeBreakdownPoint[],
      });
    };

    load().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [setAnalyticsData]);



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed metrics and insights on detected incidents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Incident Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)' }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--surface-2)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
                  />
                  <Bar dataKey="fire" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="smoke" stackId="a" fill="#f97316" radius={[0, 0, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fire vs Smoke Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {typeBreakdown.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
