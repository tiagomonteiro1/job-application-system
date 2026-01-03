import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  showBackButton?: boolean;
  backTo?: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  icon,
  showBackButton = true,
  backTo = "/",
  children
}: PageHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="text-primary">{icon}</div>}
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {description && <p className="text-sm text-gray-400">{description}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {children}
            {showBackButton && (
              <Link href={backTo}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
