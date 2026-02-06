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
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4939.715571227582!2d-38.58576492412366!3d-3.8532483438218366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c753627cb76715%3A0x254dc1fcbedeaa31!2sGr%C3%A1fica%20R%C3%A1pida%20-%20Cloud%20Design!5e1!3m2!1spt-BR!2sbr!4v1770399942262!5m2!1spt-BR!2sbr" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Cloud Design Gráfica Rápida. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}