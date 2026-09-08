import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DU CMC Result System';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(to bottom, #7c3aed, #4c1d95)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 40,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 20 }}>
          DU CMC Result System
        </div>
        <div style={{ fontSize: 28, opacity: 0.9 }}>
          Dhaka University Constituent Engineering College and Medical College
        </div>
        <div style={{ fontSize: 20, marginTop: 30, opacity: 0.7 }}>
          Batch Result Lookup • Check Your Results Online
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}