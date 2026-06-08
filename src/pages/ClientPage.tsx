import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, AlertTriangle, ArrowRight, Zap, Shield, Clock, Trash2 } from 'lucide-react';
import DataFlow from '@/components/DataFlow';
import { useNotifications } from '@/hooks/useNotifications';

export default function ClientPage() {
  const {
    isSupported,
    permission,
    isSubscribing,
    notifications,
    error,
    subscribe,
    unsubscribe,
    clearHistory
  } = useNotifications();

  const [statusText, setStatusText] = useState('STATUS: AWAITING_PERMISSION');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (permission === 'granted') {
      setStatusText('STATUS: SUBSCRIBED_ACTIVE');
    } else if (permission === 'denied') {
      setStatusText('STATUS: PERMISSION_DENIED');
    } else {
      setStatusText('STATUS: AWAITING_PERMISSION');
    }
  }, [permission]);

  const handleSubscribe = async () => {
    if (permission === 'granted') {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-[#ff6600] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Browser Not Supported</h1>
          <p className="text-[#8a8f98]">
            Your browser does not support push notifications.
            <br />
            Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] relative overflow-hidden">
      {/* WebGL Background */}
      <div className="absolute inset-0 pointer-events-none">
        <DataFlow />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Visual (60%) */}
        <div className="hidden lg:block lg:w-[60%] relative">
          <div className="absolute top-8 left-8">
            <div className="flex items-center gap-3">
              <img src="/icon-192x192.png" alt="Express Notify" className="w-10 h-10" />
              <span className="text-white font-bold text-lg tracking-wider">EXPRESS NOTIFY</span>
            </div>
          </div>
        </div>

        {/* Right side - UI Panel (40%) */}
        <div className="w-full lg:w-[40%] min-h-screen bg-[#0a0c10]/95 backdrop-blur-sm border-l border-[#8a8f98]/20 flex flex-col">
          {/* Mobile header */}
          <div className="lg:hidden p-6 flex items-center gap-3">
            <img src="/icon-192x192.png" alt="Express Notify" className="w-8 h-8" />
            <span className="text-white font-bold tracking-wider">EXPRESS NOTIFY</span>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center px-8 lg:px-12">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight mb-4">
                STAY
                <br />
                <span className="text-[#ff6600]">CONNECTED</span>.
              </h1>
              <p className="text-[#8a8f98] text-lg">
                Receive instant updates. Zero configuration required.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <Zap className="w-6 h-6 text-[#ff6600] mx-auto mb-2" />
                <span className="text-[#8a8f98] text-xs font-mono">INSTANT</span>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-[#ff6600] mx-auto mb-2" />
                <span className="text-[#8a8f98] text-xs font-mono">SECURE</span>
              </div>
              <div className="text-center">
                <Clock className="w-6 h-6 text-[#ff6600] mx-auto mb-2" />
                <span className="text-[#8a8f98] text-xs font-mono">24/7</span>
              </div>
            </div>

            {/* Main Action Button */}
            <div className="mb-8">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-red-400 text-sm font-mono">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className={`cyber-button w-full flex items-center justify-center gap-3 ${
                  isSubscribing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubscribing ? (
                  <span className="font-mono text-sm">PROCESSING...</span>
                ) : permission === 'granted' ? (
                  <>
                    <BellOff className="w-5 h-5" />
                    <span>DISABLE NOTIFICATIONS</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    <span>ENABLE NOTIFICATIONS</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Panel */}
            <div className="terminal-panel mb-6">
              <div className="flex items-center gap-3">
                <div className="status-dot" />
                <span className="text-[#ff6600] text-xs font-mono tracking-wider">
                  {statusText}
                </span>
              </div>
            </div>

            {/* Notification History Toggle */}
            {notifications.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-[#8a8f98] text-sm font-mono hover:text-[#ff6600] transition-colors flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  NOTIFICATION HISTORY ({notifications.length})
                  <ArrowRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                </button>

                {showHistory && (
                  <div className="mt-4 space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#8a8f98] text-xs font-mono">RECENT NOTIFICATIONS</span>
                      <button
                        onClick={clearHistory}
                        className="text-red-400 text-xs font-mono hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        CLEAR
                      </button>
                    </div>
                    {notifications.map((notif, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#0d1016] border border-[#1a1d26] hover:border-[#ff6600]/30 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-white text-sm font-medium">{notif.title}</span>
                          <span className="text-[#8a8f98] text-xs font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[#8a8f98] text-xs">{notif.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-[#1a1d26]">
            <Link
              to="/provider"
              className="text-[#8a8f98] text-sm font-mono hover:text-[#ff6600] transition-colors flex items-center gap-2 group"
            >
              <span>Provider Access</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
