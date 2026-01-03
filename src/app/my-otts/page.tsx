
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const ottPlatforms = [
  { name: 'JioHotstar', logo: 'https://play-lh.googleusercontent.com/1-hPxafOxdYpYZEOKzNIkSP43HXCNftVJVttoo4ucl7rsMASXW3Xr6GlXURCubE1tA=w240-h480-rw' },
  { name: 'SonyLIV', logo: 'https://images.livemint.com/img/2021/06/23/1600x900/SonyLIV2021_1624438348330_1624438371391.png' },
  { name: 'LIONSGATE PLAY', logo: 'https://play-lh.googleusercontent.com/d_S-40FjAAXo2s6B3YJ5z9yX67571naQz-w4_G8G0I6L_2O_5C-3c9Tj5iP_4F0XyA' },
  { name: 'aha', logo: 'https://play-lh.googleusercontent.com/h5o23nS8fUv-y5nN0dYm2vbxay8XG_aR3K-AnkP6f9I-9Ff8pbyq_BQm2v8j82I-6w' },
  { name: 'ZEE5', logo: 'https://play-lh.googleusercontent.com/9CbmB_2y0Ihdj1n21B-w-dE-i3rW-1y7W4sO_3B-H0-hV2-ogO3p_KaS3A' },
  { name: 'FanCode', logo: 'https://play-lh.googleusercontent.com/tS2oF9l_x8-0cvp_31s1j_2s0-3n0w3gSAU_x3A_7b19hQj0NQ4qjW4_P6Q-y5VwYg' },
  { name: 'Discovery+', logo: 'https://play-lh.googleusercontent.com/6Jaq2zZzZf3m612j1sMh1wQ35a9h7_G-9wCH3uTf23r3tksMpcqaqM-j3ey4" alt="Discovery+' },
  { name: 'Times Play', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6s8dY7dJ_nZpS5d_lF2Q8b-rJ-4J2qZJqg&s' },
  { name: 'CHAUPAL', logo: 'https://play-lh.googleusercontent.com/9dYJgXL_8_yQhfs27WJ2TjBw-4XdoL2y_3g-L3-Kq_8H_to5F1zXkYh-gGk=w240-h480-rw' },
  { name: 'Fridaay', logo: 'https://play-lh.googleusercontent.com/wPddW20mp_E0g6d2_5h2J7_bG20q6iJg31wz8k_fD7-Y8-2H-f6D-dY1xQ=w240-h480-rw' },
  { name: 'ShemarooMe', logo: 'https://play-lh.googleusercontent.com/j6fQYg3N-2-21s2p_4t4o-yJjI-NbkHj_a0-yns2M09Q925_9l3E-wIqE_L-fJgYJg=w240-h480-rw' },
  { name: 'ShemarooMe Gujarati', logo: 'https://play-lh.googleusercontent.com/0iK0-yLwhs-x27F6p-f5hXB-Y2jIOQk2i52f-c4y3B-l-OBu0iQsX5i_J4Q-zF-e7A=w240-h480-rw' },
  { name: 'Sun NXT', logo: 'https://play-lh.googleusercontent.com/nCI-j4v14c-19FhZ8Zz3Qp-NaGvScOEh5Y2u812soJ8R-VqGvQ_X33N0-k-V_8aLYg=w240-h480-rw' },
  { name: 'DistroTV', logo: 'https://play-lh.googleusercontent.com/QkNBCLk3S2eX1bINL7P6a9I0bVjq-2-p_y-8b-U-hC-d_f-z-g-Rk_c-1w=w240-h480-rw' },
];

export default function MyOttsPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <header className="mb-8">
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">My OTTs</h1>
          <p className="text-muted-foreground">Browse your favorite streaming channels.</p>
        </header>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
          {ottPlatforms.map((platform) => (
            <div key={platform.name} className="flex flex-col items-center gap-2">
              <Card className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                <CardContent className="p-0 aspect-square relative w-full h-full">
                  <Image src={platform.logo} alt={platform.name} fill className="object-cover" />
                </CardContent>
              </Card>
              <p className="text-sm font-medium text-center truncate w-full">{platform.name}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
