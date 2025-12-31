import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
}

export default function LogoutButton({ 
  variant = "outline", 
  size = "sm",
  showIcon = false 
}: LogoutButtonProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logout realizado com sucesso!");
      // Redirecionar para landing page após logout
      setTimeout(() => {
        window.location.href = '/landing';
      }, 500);
    } catch (error) {
      toast.error("Erro ao fazer logout");
      console.error("Erro no logout:", error);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleLogout}
      className="border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      Sair
    </Button>
  );
}
