import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(request, response) {
  // 1. TERIMA DATA DARI SAWERIA (WEBHOOK)
  if (request.method === 'POST') {
    const data = request.body;
    // Simpan ke database antrian
    await redis.rpush('donations', JSON.stringify({
      donator: data.donator_name,
      amount: data.amount_raw,
      message: data.message
    }));
    return response.status(200).json({ status: 'ok' });
  }

  // 2. KIRIM DATA KE ROBLOX (POLLING)
  if (request.method === 'GET') {
    // Ambil 1 data terlama & hapus dari antrian
    const donation = await redis.lpop('donations');

    if (donation) {
      return response.status(200).json(donation); 
    } else {
      return response.status(200).json(null);
    }
  }

  return response.status(405).send('Method Not Allowed');
}
