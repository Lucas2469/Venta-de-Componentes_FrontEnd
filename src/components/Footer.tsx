import React from "react";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "./ui/button";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-8 border-t" style={{ backgroundColor: '#9d0045', color: '#ffffff' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <h3 className="text-base font-semibold">ELECTROMARKET</h3>
            <p className="text-white/80 text-xs leading-relaxed">
              El marketplace de electrónicos más confiable de Bolivia.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-1.5">
                <Facebook className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-1.5">
                <Twitter className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-1.5">
                <Instagram className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Enlaces Rápidos</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('catalog')} className="text-white/80 hover:text-white transition-colors">
                  Catálogo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('security')} className="text-white/80 hover:text-white transition-colors">
                  Seguridad
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="text-white/80 hover:text-white transition-colors">
                  Centro de Ayuda
                </button>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Vendedores</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('create-ad')} className="text-white/80 hover:text-white transition-colors">
                  Publicar Anuncio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('buy-credits')} className="text-white/80 hover:text-white transition-colors">
                  Comprar Créditos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-guide')} className="text-white/80 hover:text-white transition-colors">
                  Guía del Vendedor
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Contacto</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3 text-teal-200" />
                <span className="text-white/80">soporte@electromarket.bo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3 text-teal-200" />
                <span className="text-white/80">+591 2 123-4567</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-3 w-3 text-teal-200 mt-0.5" />
                <span className="text-white/80">La Paz, Bolivia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs">
            <div className="text-white/60">
              © 2024 ELECTROMARKET. Todos los derechos reservados.
            </div>
            <div className="flex space-x-4">
              <button onClick={() => onNavigate('privacy')} className="text-white/60 hover:text-white transition-colors">
                Privacidad
              </button>
              <button onClick={() => onNavigate('terms')} className="text-white/60 hover:text-white transition-colors">
                Términos
              </button>
              <button onClick={() => onNavigate('cookies')} className="text-white/60 hover:text-white transition-colors">
                Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}