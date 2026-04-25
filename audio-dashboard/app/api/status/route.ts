import fs from 'fs/promises';

export async function GET() {
  try {
    const data = await fs.readFile('/home/user/ee/status.json', 'utf8');
    return Response.json(JSON.parse(data));
  } catch (error) {
    return Response.json({ isPlaying: false, trackName: "", loopMode: "off" });
  }
}