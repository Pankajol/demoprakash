// components/WhoAmI.tsx
'use client';

import { useEffect, useState } from 'react';

interface MePayload {
  type: 'company' | 'user';
  companyCode?: string;
  companyName?: string;
  username?: string;
}

export default function WhoAmI() {
  const [me, setMe] = useState<MePayload | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data: MePayload) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  if (me === null) {
    return <div className="text-sm text-gray-500">Not logged in</div>;
  }

  return (
    <div className="text-sm text-gray-700">
      {me.type === 'company'
        ? `Company: ${me.companyName!} (${me.companyCode!})`
        : `User: ${me.username}`}
    </div>
  );
}
