import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getLibrary, updateLibrary } from "@/lib/db";
import { unlink } from 'fs/promises';

export async function GET() {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const library = await getLibrary(session.user.id);
  return Response.json(library);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 👈 نستخدم trackPath بدلاً من trackId
  const { action, trackPath, newName } = await req.json();
  const userId = session.user.id;
  let library = await getLibrary(userId);

  // البحث عن الملف باستخدام المسار (Path) لأنه فريد
  const index = library.findIndex(t => t.path === trackPath);

  if (index !== -1) {
    if (action === "EDIT") {
      library[index].name = newName;
    } 
    else if (action === "DELETE") {
      try {
        await unlink(library[index].path);
      } catch (e) {
        console.warn("File already gone from disk");
      }
      library.splice(index, 1);
    }
    
    await updateLibrary(userId, library);
    return Response.json({ success: true });
  }

  return Response.json({ error: "File not found" }, { status: 404 });
}