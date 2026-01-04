import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function Login() {
  useEffect(() => {
    // Redireciona automaticamente para o OAuth do Manus
    window.location.href = getLoginUrl();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-purple-950 to-pink-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">Redirecionando para login...</p>
      </div>
    </div>
  );
}
