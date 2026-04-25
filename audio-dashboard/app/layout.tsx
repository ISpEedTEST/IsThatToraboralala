import "./globals.css";
import { AuthProvider } from "./Providers";

export const metadata = {
  title: "منصة الصوتيات",
  description: "مكتبتك الصوتية الخاصة لربطها مع ديسكورد",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-900 text-white min-h-screen">
        {/* وضعنا الغلاف هنا لكي يعمل في كل الموقع */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}