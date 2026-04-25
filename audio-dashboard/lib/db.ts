import fs from 'fs/promises';
import path from 'path';
import { Track, UserDatabase } from '@/types';

const DB_PATH = '/home/user/ee/database.json';

export async function getLibrary(userId: string): Promise<Track[]> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    if (!data.trim()) return []; // إذا كان الملف فارغاً تماماً
    
    const db: UserDatabase = JSON.parse(data);
    return db[userId] || [];
  } catch (error) {
    console.error("خطأ في قراءة قاعدة البيانات:", error);
    return []; 
  }
}

export async function updateLibrary(userId: string, newLibrary: Track[]): Promise<void> {
  try {
    // 1. قراءة البيانات الحالية أولاً لضمان عدم مسح بيانات المستخدمين الآخرين
    let db: UserDatabase = {};
    try {
      const data = await fs.readFile(DB_PATH, 'utf8');
      db = JSON.parse(data || '{}');
    } catch (e) {
      db = {}; // إذا فشل الملف تماماً، نبدأ من جديد مع الحذر
    }

    // 2. تحديث بيانات هذا المستخدم فقط
    db[userId] = newLibrary;

    // 3. (كتابة ذرية): الكتابة في ملف مؤقت أولاً ثم استبداله بالأصلي
    // هذا يمنع مسح الملف إذا انقطع السيرفر أثناء الكتابة
    const tempPath = `${DB_PATH}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(db, null, 2));
    await fs.rename(tempPath, DB_PATH);
    
    console.log("✅ تم الحفظ بنجاح وأمان.");
  } catch (error) {
    console.error("⚠️ خطأ فادح: فشل الحفظ، تم إلغاء العملية لحماية البيانات.", error);
    throw new Error("فشل حفظ البيانات");
  }
}