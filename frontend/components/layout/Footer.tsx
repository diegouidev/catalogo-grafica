"use client";
import { Instagram, Phone, MapPin } from "lucide-react";
import { getImageUrl } from "@/services/api";

interface FooterProps {
    config: any;
}

export default function Footer({ config }: FooterProps) {
    // Dados de fallback caso a API demore ou falhe
    const companyName = config?.name || "Cloud Design Gráfica Rápida";
    const phone = config?.whatsapp || "(85) 99853-2868";
    const instagram = config?.instagram || "@cloudgraficarapida";
    const address = config?.address || "Pajuçara, Maracanaú - CE";
    
    // Tratamento dos Links
    // Remove caracteres não numéricos do telefone para o link
    const phoneLink = phone.replace(/\D/g, ""); 
    const instagramLink = instagram.startsWith("http") 
        ? instagram 
        : `https://instagram.com/${instagram.replace("@", "")}`;

    return (
        <footer className="bg-[#0a0b14] border-t border-white/5 pt-16 pb-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    
                    {/* COLUNA 1: SOBRE */}
                    <div className="space-y-4">
                        <h3 className="text-white font-black text-xl tracking-tighter">{companyName}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Sua gráfica rápida na Pajuçara, unindo qualidade premium, agilidade e confiança para impulsionar o seu negócio.
                        </p>
                    </div>

                    {/* COLUNA 2: CONTATOS */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest text-brand-blue">Contatos</h3>
                        <div className="space-y-3">
                            <a 
                                href={`https://wa.me/${phoneLink}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-green-500/20 transition-colors">
                                    <Phone size={18} className="group-hover:text-green-500" />
                                </div>
                                <span className="text-sm font-medium">{phone}</span>
                            </a>

                            <a 
                                href={instagramLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-pink-500/20 transition-colors">
                                    <Instagram size={18} className="group-hover:text-pink-500" />
                                </div>
                                <span className="text-sm font-medium">{instagram}</span>
                            </a>
                            
                            <div className="flex items-center gap-3 text-gray-400 group">
                                <div className="p-2 rounded-lg bg-white/5">
                                    <MapPin size={18} />
                                </div>
                                <span className="text-sm font-medium">{address}</span>
                            </div>
                        </div>
                    </div>

                    {/* COLUNA 3: LOGO (Correção de Tamanho) */}
                    <div className="flex flex-col items-center md:items-end justify-center">
                        {/* Se tiver logo na API usa ela, senão usa a local */}
                        <img 
                            src={config?.logo ? getImageUrl(config.logo) : "/logo-oficial.png"} 
                            alt="Logo Cloud Design" 
                            className="w-48 h-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center">
                    <p className="text-gray-600 text-xs font-medium">
                        © {new Date().getFullYear()} {companyName}. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
