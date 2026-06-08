import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Server,
  Radio,
  Clock,
  FileText,
  Image,
  Loader2,
  BarChart3
} from 'lucide-react';
import HolographicCard from '@/components/HolographicCard';
import CyclicTextCipher from '@/components/CyclicTextCipher';

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  image: string | null;
  sentAt: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  status: string;
}

interface Stats {
  totalSubscribers: number;
  inactiveSubscribers: number;
  invalidTokens: number;
  totalNotifications: number;
}

export default function ProviderPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSubscribers: 0,
    inactiveSubscribers: 0,
    invalidTokens: 0,
    totalNotifications: 0
  });
  const [activeTab, setActiveTab] = useState('compose');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch stats and logs
  useEffect(() => {
    fetchStats();
    fetchLogs();
    const interval = setInterval(() => {
      fetchStats();
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/notifications/history');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          image: image.trim() || undefined,
          data: { type: 'general', timestamp: Date.now().toString() }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({ type: 'success', data });
        setTitle('');
        setBody('');
        setImage('');
        fetchLogs();
        fetchStats();
      } else {
        setSendResult({ type: 'error', message: data.error || 'Failed to send' });
      }
    } catch (error) {
      setSendResult({ type: 'error', message: 'Network error' });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  const sidebarItems = [
    { id: 'compose', icon: Send, label: 'COMPOSE' },
    { id: 'analytics', icon: BarChart3, label: 'ANALYTICS' },
    { id: 'logs', icon: FileText, label: 'LOGS' }
  ];

  const deliveryRate = stats.totalSubscribers > 0
    ? ((stats.totalNotifications * 100) / (stats.totalNotifications + stats.invalidTokens || 1)).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-[#0a0c10] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0d1016] border-r border-[#1a1d26] flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3">
          <img src="/icon-192x192.png" alt="Express Notify" className="w-8 h-8" />
          <span className="text-white font-bold text-sm tracking-wider">EXPRESS NOTIFY</span>
        </div>

        <nav className="flex-1 px-4">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-mono transition-all ${
                activeTab === item.id
                  ? 'text-[#ff6600] bg-[#ff6600]/10 border-l-2 border-[#ff6600]'
                  : 'text-[#8a8f98] hover:text-white hover:bg-[#1a1d26]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1a1d26]">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#8a8f98] text-sm font-mono hover:text-[#ff6600] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            CLIENT SPACE
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">PROVIDER DASHBOARD</h1>
              <p className="text-[#8a8f98] text-sm font-mono mt-1">
                NOTIFICATION DELIVERY SYSTEM v1.0
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="status-dot" />
                <span className="text-[#ff6600] text-xs font-mono">SYSTEM ONLINE</span>
              </div>
            </div>
          </div>
        </header>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Compose Panel */}
            <div>
              <div className="bg-[#0d1016] border border-[#1a1d26] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Send className="w-5 h-5 text-[#ff6600]" />
                  <h2 className="text-white font-bold text-lg">COMPOSE PAYLOAD</h2>
                </div>

                {/* Recipients */}
                <div className="mb-6">
                  <label className="text-[#8a8f98] text-xs font-mono mb-2 block">RECIPIENTS</label>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#ff6600] text-white text-xs font-mono font-bold">
                      ALL CLIENTS
                    </button>
                    <button className="px-4 py-2 bg-[#1a1d26] text-[#8a8f98] text-xs font-mono hover:text-white transition-colors">
                      SEGMENT
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div className="mb-6">
                  <label className="text-[#8a8f98] text-xs font-mono mb-2 block">PAYLOAD_TITLE</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter notification title..."
                    className="cyber-input"
                    maxLength={100}
                  />
                </div>

                {/* Body Input */}
                <div className="mb-6">
                  <label className="text-[#8a8f98] text-xs font-mono mb-2 block">PAYLOAD_BODY</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter notification message..."
                    className="cyber-input resize-none"
                    rows={4}
                    maxLength={500}
                  />
                </div>

                {/* Image URL Input */}
                <div className="mb-6">
                  <label className="text-[#8a8f98] text-xs font-mono mb-2 flex items-center gap-2">
                    <Image className="w-3 h-3" />
                    IMAGE_URL (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="cyber-input"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={isSending || !title.trim() || !body.trim()}
                  className={`cyber-button w-full flex items-center justify-center gap-3 ${
                    isSending || !title.trim() || !body.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-mono">TRANSMITTING...</span>
                    </>
                  ) : (
                    <CyclicTextCipher
                      text="INITIATE DELIVERY"
                      className="text-sm font-bold"
                    />
                  )}
                </button>

                {/* Result */}
                {sendResult && (
                  <div className={`mt-4 p-4 border ${
                    sendResult.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    {sendResult.type === 'success' ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-green-400 text-sm font-mono">DELIVERY SUCCESSFUL</p>
                          <p className="text-[#8a8f98] text-xs font-mono mt-1">
                            SENT: {sendResult.data.details.totalSent} |
                            SUCCESS: {sendResult.data.details.successCount} |
                            FAILED: {sendResult.data.details.failureCount}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400 text-sm font-mono">{sendResult.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            <div>
              <div className="bg-[#0d1016] border border-[#1a1d26] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Radio className="w-5 h-5 text-[#ff6600]" />
                  <h2 className="text-white font-bold text-lg">PREVIEW</h2>
                </div>

                {/* Mobile Preview */}
                <div className="max-w-sm mx-auto">
                  <div className="bg-[#1a1d26] rounded-2xl p-4 border border-[#2a2d36]">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-4 px-2">
                      <span className="text-[#8a8f98] text-xs font-mono">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-[#8a8f98] rounded-sm" />
                        <div className="w-3 h-2 bg-[#8a8f98] rounded-sm" />
                      </div>
                    </div>

                    {/* Notification Preview */}
                    <div className="bg-[#0a0c10] rounded-xl p-4 border border-[#2a2d36]">
                      <div className="flex items-start gap-3">
                        <img src="/icon-192x192.png" alt="" className="w-10 h-10 rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="text-white text-sm font-bold">Express Notify</span>
                            <span className="text-[#8a8f98] text-xs">now</span>
                          </div>
                          <p className="text-white text-sm font-medium mt-1 truncate">
                            {title || 'Notification Title'}
                          </p>
                          <p className="text-[#8a8f98] text-xs mt-1 line-clamp-2">
                            {body || 'Notification body message will appear here...'}
                          </p>
                        </div>
                      </div>
                      {image && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt=""
                            className="w-full h-32 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>

                    {/* App Icons */}
                    <div className="grid grid-cols-4 gap-4 mt-6 px-2">
                      {['Messages', 'Mail', 'Calendar', 'Photos'].map((app) => (
                        <div key={app} className="text-center">
                          <div className="w-12 h-12 bg-[#2a2d36] rounded-xl mx-auto mb-1" />
                          <span className="text-[#8a8f98] text-xs">{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <HolographicCard className="bg-[#0d1016] border border-[#1a1d26] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-[#ff6600]" />
                  <span className="text-[#8a8f98] text-xs font-mono">TOTAL_SUBSCRIBERS</span>
                </div>
                <p className="text-3xl font-bold text-white font-mono">
                  {stats.totalSubscribers.toLocaleString()}
                </p>
              </HolographicCard>

              <HolographicCard className="bg-[#0d1016] border border-[#1a1d26] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-[#6a00ff]" />
                  <span className="text-[#8a8f98] text-xs font-mono">DELIVERY_RATE</span>
                </div>
                <p className="text-3xl font-bold text-white font-mono">
                  {deliveryRate}%
                </p>
              </HolographicCard>

              <HolographicCard className="bg-[#0d1016] border border-[#1a1d26] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-[#ff6600]" />
                  <span className="text-[#8a8f98] text-xs font-mono">AVG_LATENCY</span>
                </div>
                <p className="text-3xl font-bold text-white font-mono">
                  24<span className="text-lg text-[#8a8f98]">ms</span>
                </p>
              </HolographicCard>

              <HolographicCard className="bg-[#0d1016] border border-[#1a1d26] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Server className="w-5 h-5 text-green-400" />
                  <span className="text-[#8a8f98] text-xs font-mono">QUEUE_STATUS</span>
                </div>
                <p className="text-3xl font-bold text-green-400 font-mono">STABLE</p>
              </HolographicCard>
            </div>

            {/* Activity Chart */}
            <div className="bg-[#0d1016] border border-[#1a1d26] p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-[#ff6600]" />
                <h2 className="text-white font-bold text-lg">DELIVERY ACTIVITY</h2>
              </div>

              <div className="h-64 flex items-end gap-2">
                {Array.from({ length: 24 }, (_, i) => {
                  const height = Math.random() * 80 + 10;
                  const isOrange = i % 3 === 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className={`w-full rounded-t ${isOrange ? 'bg-[#ff6600]' : 'bg-[#6a00ff]'}`}
                        style={{ height: `${height}%`, opacity: 0.7 }}
                      />
                      {i % 4 === 0 && (
                        <span className="text-[#8a8f98] text-xs font-mono">{i}h</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <div className="bg-[#0d1016] border border-[#1a1d26] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#ff6600]" />
                  <h2 className="text-white font-bold text-lg">SYSTEM LOGS</h2>
                </div>
                <span className="text-[#8a8f98] text-xs font-mono">
                  {logs.length} ENTRIES
                </span>
              </div>

              {/* Terminal */}
              <div className="terminal-panel h-96 overflow-y-auto scrollbar-hide">
                {logs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#8a8f98] text-sm font-mono">NO LOG ENTRIES FOUND</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 py-2 border-b border-[#1a1d26] last:border-0">
                        <Clock className="w-4 h-4 text-[#8a8f98] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#ff6600] text-xs font-mono">
                              {new Date(log.sentAt).toLocaleTimeString()}
                            </span>
                            <span className="text-green-400 text-xs font-mono">
                              [{log.status.toUpperCase()}]
                            </span>
                          </div>
                          <p className="text-white text-sm truncate">{log.title}</p>
                          <p className="text-[#8a8f98] text-xs truncate">{log.body}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-[#8a8f98] text-xs font-mono">
                              RECIPIENTS: {log.totalRecipients}
                            </span>
                            <span className="text-green-400 text-xs font-mono">
                              OK: {log.successCount}
                            </span>
                            {log.failureCount > 0 && (
                              <span className="text-red-400 text-xs font-mono">
                                FAIL: {log.failureCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
