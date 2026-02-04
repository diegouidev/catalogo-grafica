import { Instagram, MessageCircle, MapPin } from "lucide-react";

export default function Footer({ config }: { config: any }) {
    return (
        <footer className="bg-white dark:bg-brand-navy border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Coluna 1: Sobre */}
                    <div>
                        <h3 className="text-xl font-black mb-4">Cloud Design</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Sua gráfica rápida com qualidade premium e agilidade no Ceará.
                        </p>
                    </div>

                    {/* Coluna 2: Contato */}
                    <div className="space-y-4">
                        <h4 className="font-bold">Contatos</h4>
                        <a href={`https://wa.me/${config?.whatsapp}`} className="flex items-center gap-3 text-gray-500 hover:text-brand-blue">
                            <MessageCircle size={20} /> {config?.whatsapp || "(85) 99853-2868"}
                        </a>
                        <a href={`https://instagram.com/${config?.instagram}`} className="flex items-center gap-3 text-gray-500 hover:text-brand-blue">
                            <Instagram size={20} /> @{config?.instagram || "cloudgraficarapida"}
                        </a>
                    </div>

                    {/* Coluna 3: Localização */}
                    <div className="rounded-2xl overflow-hidden h-40 border border-gray-200 dark:border-gray-800">
                        {config?.map_iframe ? (
                            <div dangerouslySetInnerHTML={{ __html: config?.map_iframe }} className="w-full h-full" />
                        ) : (
                            <div className="bg-gray-100 w-full h-full flex items-center justify-center"><MapPin /></div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Cloud Design Gráfica Rápida. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}