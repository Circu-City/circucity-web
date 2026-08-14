'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function FollowShopButton({ shopId, initialCount }: { shopId: string; initialCount: number }) {
  const [followed, setFollowed] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch(`/api/shops/${shopId}/follow`).then((response) => response.json()).then((result) => {
      setFollowed(!!result.followed);
      if (typeof result.count === 'number') setCount(result.count);
    }).catch(() => undefined);
  }, [shopId]);

  const toggle = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/shops/${shopId}/follow`, { method: followed ? 'DELETE' : 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update follow status');
      setFollowed((value) => !value);
      setCount((value) => Math.max(0, value + (followed ? -1 : 1)));
      toast.success(followed ? 'Store unfollowed' : 'You will see new listing alerts from this store');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update follow status');
    } finally {
      setPending(false);
    }
  };

  return (
    <button onClick={toggle} disabled={pending} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${followed ? 'bg-[#F4D35E] text-[#173D2A]' : 'border border-white/30 bg-white/10 text-white hover:bg-white/20'}`}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : followed ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {followed ? 'Following' : 'Follow store'} <span className="opacity-70">{count}</span>
    </button>
  );
}
