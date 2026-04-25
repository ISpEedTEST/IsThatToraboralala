import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getLibrary, updateLibrary } from "@/lib/db";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as any;
  if (!session?.user?.id) return Response.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const data = await req.formData();
    const file = data.get('file') as File;
    const customName = data.get('customName') as string;

    // 1. التحقق من أن الاسم موجود وإجباري
    if (!customName || customName.trim() === "") {
      return Response.json({ error: "الاسم إلزامي للمقطع" }, { status: 400 });
    }

    if (!file) return Response.json({ error: "لم يتم اختيار ملف" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 2. تحديد المجلد والاسم (المسار المطلوب خارج مجلد الموقع)
    const audioDirectory = '/home/user/ee/saved_audio';
    const fileName = `${session.user.id}_${Date.now()}.mp3`;
    const absolutePath = path.join(audioDirectory, fileName);

    // التأكد من وجود مجلد الأغاني
    await mkdir(audioDirectory, { recursive: true });
    
    // 3. كتابة الملف الفعلي
    await writeFile(absolutePath, buffer);

    // 4. تحديث JSON بالبنية الجديدة (name و path فقط)
    const library = await getLibrary(session.user.id);
    
    library.push({
      name: customName.trim(),
      path: absolutePath // 👈 المسار المطلق الكامل كما طلبت
    });
    
    await updateLibrary(session.user.id, library);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Upload Error:", error);
    return Response.json({ error: "فشل في عملية الرفع" }, { status: 500 });
  }
}