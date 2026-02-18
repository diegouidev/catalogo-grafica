import { Metadata } from 'next';
import { getKitBySlug, getImageUrl, getCompanyConfig } from "@/services/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/cart/FloatingCart";
import KitDetails from "./KitDetails"; // Vamos criar este Client Component rapidinho

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const kit = await getKitBySlug(resolvedParams.slug);
    if (!kit) return { title: 'Kit não encontrado | Cloud Design' };
    return {
        title: `${kit.name} | Cloud Gráfica Rápida`,
        description: kit.description?.substring(0, 160),
        openGraph: { images: [getImageUrl(kit.image)] },
    };
}

export default async function KitPage({ params }: Props) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const [kit, companyConfig] = await Promise.all([
        getKitBySlug(slug),
        getCompanyConfig()
    ]);

    if (!kit) {
        return (
            <div className="min-h-screen bg-[#05060a] flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-3xl font-black mb-4">Combo não encontrado 😕</h1>
                <a href="/" className="bg-brand-blue px-6 py-3 rounded-full font-bold">Voltar ao Catálogo</a>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-[#05060a]">
            <Header />
            <section className="max-w-7xl mx-auto px-4 py-10 md:py-16 flex-grow w-full">
                <nav className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">
                    <a href="/" className="hover:text-brand-blue transition-colors">Início</a>
                    <span className="mx-2">/</span>
                    <span className="text-white">{kit.name}</span>
                </nav>
                <KitDetails kit={kit} />
            </section>
            <Footer config={companyConfig} />
            <FloatingCart />
        </main>
    );
}