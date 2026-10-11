import Image from "next/image";
import Link from "next/link";
import {
  LuCrown as Crown,
  LuGem as Gem,
  LuHeartHandshake as HeartHandshake,
  LuStore as Store,
  LuEye as Eye,
  LuCompass as Compass,
  LuArrowRight as ArrowRight,
  LuShieldCheck as ShieldCheck,
  LuAward as Award,
  LuUsers as Users,
  LuMapPin as MapPin,
  LuCircleCheck as CheckCircle2,
  LuClock as Clock,
  LuHeart as Heart,
  LuPhone as Phone,
  LuBriefcase as Briefcase,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import Testimonials from "@/components/Testimonials";

const features = [
  {
    icon: Crown,
    title: "Custom Stitching",
    badge: "Custom Fit",
    body: "Tailored ethnic wear and custom fits crafted to suit you perfectly with careful attention to detail.",
  },
  {
    icon: Gem,
    title: "Handcrafted Quality",
    badge: "Pure Quality",
    body: "Hand-picked pure silks, soft fabrics, and delicate embroidery ensuring traditional elegance that lasts.",
  },
  {
    icon: HeartHandshake,
    title: "Friendly Customer Care",
    badge: "Personal Touch",
    body: "Warm, dedicated styling support from our Dubai store, easy exchanges, and fast doorstep delivery.",
  },
  {
    icon: Store,
    title: "Boutique & Online Store",
    badge: "Shop Anywhere in UAE",
    body: "Visit our physical Dubai boutique or enjoy 2-4 day express delivery across all seven Emirates.",
  },
];

const milestones = [
  { number: "2013", label: "Founded in Dubai", desc: "Starting as a passionate boutique store" },
  { number: "50K+", label: "Customers Styled", desc: "Happy customers across UAE & GCC" },
  { number: "100%", label: "Pure Fabric Quality", desc: "Original fabrics & verified quality" },
  { number: "7", label: "Emirates Reached", desc: "Fast express doorstep delivery" },
];

const WHATSAPP_LINK = "https://wa.me/971504715912";

const leadershipTeam = [
  {
    name: "ASHRAF THALASSERY",
    role: "MANAGER",
    tag: "UAE Operations",
    image: "/manager.png",
  },
  {
    name: "BASHEER KOVVAL",
    role: "FLOOR MANAGER DUBAI, UAE",
    tag: "Dubai Boutique",
    image: "/Floor%20Manager%20DubaiUAE.png",
  },
  {
    name: "RENEESH KOYYERI",
    role: "FLOOR MANAGER ABU DHABI, UAE",
    tag: "Abu Dhabi Boutique",
    image: "/Floor%20Manager%20Abu%20Dhabi,UAE.png",
  },
  {
    name: "SHABAB VN",
    role: "SHARJAH FLOOR MANAGER",
    tag: "Sharjah Boutique",
    image: "/Sharjah%20floor%20manager.png",
  },
];

export default function OurStoryPage() {
  return (
    <main className="bg-gradient-to-b from-[#faf6f2] via-[#f7f1eb] to-[#f3ece3] text-[#240821] relative overflow-hidden">
      
      {/* ── Ambient Radial Lighting Backgrounds (Site-wide Luxury Theme) ── */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-[radial-gradient(ellipse_at_top,_rgba(92,26,82,0.07),_transparent_70%)]" />
      <div className="pointer-events-none absolute top-40 -left-24 w-96 h-96 bg-[#c49a45]/6 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-[900px] -right-24 w-96 h-96 bg-[#5c1a52]/5 rounded-full blur-3xl" />

      {/* ── 1. Hero Section: Rich Heritage Banner ── */}
      <section className="relative overflow-hidden border-b border-[#ebdcd0] select-none">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?q=80&w=1400&auto=format&fit=crop"
            alt="Mulberries Dubai Couture Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.85] contrast-[1.05] transition-transform duration-1000 scale-105"
          />
          {/* Multi-stop gradient luxury tint */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a0c27]/85 via-[#3d1238]/75 to-[#1c081a]/95 backdrop-blur-[1px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center text-white">
          
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#f5d796] text-xs uppercase tracking-[0.2em] font-semibold mb-6 shadow-sm animate-in fade-in duration-500">
            <span>Our Heritage & Story &bull; Since 2013</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-playfair font-normal leading-[1.15] max-w-3xl mx-auto tracking-tight drop-shadow-sm mb-6">
            UAE&apos;s Finest Ethnic Wear, <br className="hidden sm:inline" />
            <span className="italic font-playfair font-light text-[#f9df9e]">Crafted with Timeless Love</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            From an inspired Dubai boutique to a cherished destination for discerning women across the Emirates, discovering the poetry of traditional handcraft and modern grace.
          </p>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/90">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full">
              <ShieldCheck size={14} className="text-[#f5d796]" /> Authentic Handlooms
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full">
              <Award size={14} className="text-[#f5d796]" /> Designed in Dubai
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full">
              <Users size={14} className="text-[#f5d796]" /> 50,000+ Cherished Clients
            </span>
          </div>

        </div>

        {/* Ambient bottom curve glow */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#faf6f2] to-transparent pointer-events-none" />
      </section>

      {/* ── 2. Milestones & Heritage Stats Row ── */}
      <section className="relative -mt-6 z-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {milestones.map((m, idx) => (
            <div
              key={m.label}
              className="group bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 text-center shadow-[0_4px_20px_rgba(92,26,82,0.05)] hover:shadow-[0_8px_25px_rgba(92,26,82,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle top accent gradient */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#5c1a52]/40 to-transparent group-hover:via-[#5c1a52] transition-colors" />
              <div className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold text-[#5c1a52] mb-1 group-hover:scale-105 transition-transform duration-300">
                {m.number}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#240821] tracking-wide mb-1">
                {m.label}
              </div>
              <div className="text-[11px] text-[#735e4d] font-light">
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. The Mulberries Genesis (Story Split Section) ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#c49a45]" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#b8843f]">
                Our Journey
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-playfair font-bold text-[#240821] leading-tight">
              A Passion for Heritage, <span className="italic font-playfair text-[#5c1a52]">Reimagined</span> for the Modern Woman
            </h2>

            <p className="text-sm sm:text-base text-[#6b5849] leading-relaxed">
              It all started in <b>2013</b> when <b>Geethy Sobin</b>, a passionate fashion designer and founder, saw a distinctive opportunity to bring authentic, high-quality ethnic wear to the vibrant women of the United Arab Emirates.
            </p>

            <p className="text-sm sm:text-base text-[#6b5849] leading-relaxed">
              What began as a boutique online label quickly set a new standard in Indian fashion: <span className="text-[#5c1a52] font-semibold">accessible, beautifully made, and comfortable</span> in every thread. By listening attentively to our customers, Mulberries grew into a beloved home of ethnic fashion across Dubai and the Emirates.
            </p>

            {/* Founder Quote Card */}
            <div className="bg-white/90 backdrop-blur-xs border-l-4 border-[#5c1a52] border-y border-r border-[#ebdcd0] rounded-r-2xl p-5 shadow-xs relative">
              <p className="font-playfair italic text-[#3a1034] text-sm sm:text-base leading-relaxed mb-3">
                &ldquo;We set out with one humble conviction: every saree, gown, and dress should make a woman feel special, celebrating timeless traditions while embracing modern effortless comfort.&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#240821] block">Geethy Sobin</span>
                  <span className="text-[#8c7766]">Founder & Creative Director</span>
                </div>
                <div className="text-[11px] text-[#5c1a52] font-semibold bg-[#5c1a52]/10 px-3 py-1 rounded-full">
                  Dubai Store
                </div>
              </div>
            </div>

          </div>

          {/* Right Image Frame Column with Luxury Border & Floating Accents */}
          <div className="lg:col-span-6 relative">
            
            {/* Ambient Background Aura */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#5c1a52]/10 via-[#c49a45]/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative group overflow-hidden rounded-3xl border border-[#ebdcd0] bg-white p-2.5 shadow-[0_8px_30px_rgba(92,26,82,0.08)]">
              <div className="relative aspect-[4/5] sm:aspect-[4/4.5] w-full rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src="/mulberries-our-story.png"
                  alt="Mulberries Heritage Boutique Showcase"
                  fill
                  sizes="(min-width: 1024px) 550px, 100vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>

              {/* Floating Verified Badge */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#5c1a52] text-white flex items-center justify-center shrink-0">
                  <Award size={20} className="text-[#f5d796]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#240821]">Pure Sarees & Fabrics</p>
                  <p className="text-[11px] text-[#735e4d]">Handpicked directly from India&apos;s finest weavers</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 4. What Sets Us Apart ("We Are Special") ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-[#ebdcd0] bg-white/60 relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-6 h-[1px] bg-[#c49a45]" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#b8843f]">
                The Mulberries Experience
              </span>
              <span className="w-6 h-[1px] bg-[#c49a45]" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-playfair font-bold text-[#240821] mb-3">
              Why Women <span className="italic font-playfair text-[#5c1a52]">Love Shopping With Us</span>
            </h2>
            <p className="text-sm text-[#735e4d]">
              Bringing timeless traditional fabrics together with friendly customer care and custom tailoring.
            </p>
          </div>

          {/* 4 Feature Cards with Liquid Sheen & Hover Lift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-[#ebdcd0] bg-white/95 backdrop-blur-sm p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#b8843f]/60 hover:shadow-[0_12px_30px_rgba(92,26,82,0.08)] flex flex-col justify-between"
                >
                  {/* Sheen sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#f5d796]/15 to-transparent pointer-events-none" />

                  {/* Icon watermark in bottom right */}
                  <Icon
                    size={120}
                    strokeWidth={0.8}
                    className="pointer-events-none select-none absolute -right-6 -bottom-6 text-[#5c1a52] opacity-[0.04] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500"
                  />

                  <div>
                    {/* Top row: Icon Capsule & Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#faf5f9] border border-[#ebdcd0] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#5c1a52] group-hover:border-[#5c1a52] shadow-xs">
                        <Icon
                          size={22}
                          className="text-[#5c1a52] transition-colors duration-300 group-hover:text-[#f5d796]"
                        />
                      </div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-[#b8843f] bg-[#faf6f2] border border-[#ebdcd0] px-2.5 py-0.5 rounded-full">
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-playfair font-bold text-[#240821] mb-2 group-hover:text-[#5c1a52] transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed">
                      {f.body}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#ebdcd0]/60 flex items-center gap-1 text-xs font-semibold text-[#5c1a52] group-hover:translate-x-1 transition-transform">
                    <span>Explore Quality</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 5. Flagship Boutique Experience (Dubai) ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Boutique Image Frame */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="relative group overflow-hidden rounded-3xl border border-[#ebdcd0] bg-white p-2.5 shadow-[0_8px_30px_rgba(92,26,82,0.08)]">
              <div className="relative aspect-[4/3] sm:aspect-[4/3.5] w-full rounded-2xl overflow-hidden bg-gray-100">
                <Image
                  src="/shop.jpg"
                  alt="Mulberries Dubai Boutique Interior"
                  fill
                  sizes="(min-width: 1024px) 550px, 100vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* In-store Badge */}
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md border border-[#ebdcd0] rounded-xl px-3 py-1.5 shadow-md flex items-center">
                <span className="text-xs font-bold text-[#240821]">Boutique Open in Dubai</span>
              </div>
            </div>
          </div>

          {/* Right Text Column */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            
            <div className="inline-flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#c49a45]" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#b8843f]">
                Our Dubai Store
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-playfair font-bold text-[#240821] leading-tight">
              A Welcoming Store for <span className="italic font-playfair text-[#5c1a52]">Sarees & Dresses</span>
            </h2>

            <p className="text-sm sm:text-base text-[#6b5849] leading-relaxed">
              Step into our Dubai boutique to feel the soft touch of pure Kanchipuram silks, lightweight fabrics, and handcrafted bridal lehengas in person. Our friendly stylists provide personal assistance to help you find the outfit that truly fits your style.
            </p>

            {/* Checklist of services */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#3a1034] font-medium">
                <CheckCircle2 size={16} className="text-[#5c1a52] shrink-0" />
                <span>Private bridal & festive styling appointments</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#3a1034] font-medium">
                <CheckCircle2 size={16} className="text-[#5c1a52] shrink-0" />
                <span>On-site fall, pico & made-to-measure blouse alterations</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#3a1034] font-medium">
                <CheckCircle2 size={16} className="text-[#5c1a52] shrink-0" />
                <span>Same-day styling consultations via WhatsApp</span>
              </div>
            </div>

            {/* Contact Button */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-bold shadow-md shadow-[#25D366]/20 transition-all hover:scale-102 active:scale-98"
              >
                <FaWhatsapp size={17} />
                <span>Chat with Dubai Stylist</span>
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#5c1a52] hover:underline"
              >
                <span>Browse Online Catalog</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. Vision & Mission — Split Majestic Panels ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-[#ebdcd0] bg-gradient-to-b from-[#f7f2eb] to-[#f4edf2]">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* 01: Vision Card */}
            <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-[#ebdcd0] shadow-[0_4px_25px_rgba(92,26,82,0.04)] hover:shadow-lg transition-all duration-300 overflow-hidden">
              <span className="absolute -top-4 -right-4 font-playfair text-[6.5rem] leading-none text-[#5c1a52]/8 select-none pointer-events-none">
                01
              </span>

              <div className="w-14 h-14 rounded-2xl bg-[#faf5f9] border border-[#ebdcd0] flex items-center justify-center mb-6 text-[#5c1a52] shadow-xs">
                <Eye size={24} />
              </div>

              <h3 className="text-2xl font-playfair font-bold text-[#240821] mb-4">
                Our <span className="italic font-playfair text-[#5c1a52]">Vision</span>
              </h3>

              <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed mb-4">
                To be the leading traditional Indian fashion destination in the UAE, blending classic craft with modern style so every woman feels confident and beautiful.
              </p>
              <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed">
                We envision a future where authentic craftsmanship is easily accessible, honest, and loved for festive celebrations and everyday wear alike.
              </p>
            </div>

            {/* 02: Mission Card */}
            <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-[#ebdcd0] shadow-[0_4px_25px_rgba(92,26,82,0.04)] hover:shadow-lg transition-all duration-300 overflow-hidden">
              <span className="absolute -top-4 -right-4 font-playfair text-[6.5rem] leading-none text-[#5c1a52]/8 select-none pointer-events-none">
                02
              </span>

              <div className="w-14 h-14 rounded-2xl bg-[#faf5f9] border border-[#ebdcd0] flex items-center justify-center mb-6 text-[#5c1a52] shadow-xs">
                <Compass size={24} />
              </div>

              <h3 className="text-2xl font-playfair font-bold text-[#240821] mb-4">
                Our <span className="italic font-playfair text-[#5c1a52]">Mission</span>
              </h3>

              <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed mb-4">
                To offer high-quality traditional sarees and dresses with honest pricing, reliable quality, and warm customer care.
              </p>
              <p className="text-xs sm:text-sm text-[#6b5849] leading-relaxed">
                By building strong relationships with weavers and offering smooth online shopping, we deliver a wonderful experience from our Dubai store right to your home.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 7. Meet Our Team (Leadership & Floor Managers) ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#ebdcd0] bg-white relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-6 h-[1px] bg-[#5c1a52]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#5c1a52] uppercase">
                Boutique Leadership
              </span>
              <span className="w-6 h-[1px] bg-[#5c1a52]" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-[#240821] tracking-tight mb-2">
              Meet Our <span className="italic font-playfair text-[#5c1a52]">Team</span>
            </h2>
            <p className="text-sm sm:text-base text-[#6b5849] font-light">
              Teamwork makes the dream work &bull; Store leadership across Dubai, Abu Dhabi & Sharjah
            </p>
          </div>

          {/* 4 Modern Luxury Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadershipTeam.map((member) => (
              <div
                key={member.name}
                className="group bg-white rounded-2xl overflow-hidden border border-[#ebdcd0] shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Full-bleed Portrait Photo */}
                <div className="relative aspect-[4/5] w-full bg-[#faf6f2] overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#5c1a52] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#ebdcd0]/60 shadow-xs">
                    {member.tag}
                  </span>
                </div>

                {/* Typography info */}
                <div className="p-4 text-center flex-1 flex flex-col justify-center bg-white border-t border-[#f2e7de]">
                  <h3 className="text-sm font-bold tracking-wide text-[#240821] uppercase mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[11px] font-semibold tracking-wider text-[#5c1a52] uppercase leading-snug">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── See More Button ── */}
          <div className="mt-12 text-center">
            <Link
              href="/team"
              className="inline-flex items-center gap-2 bg-[#5c1a52] hover:bg-[#43123b] text-white px-8 py-3 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm transition-all duration-300 hover:scale-105"
            >
              <span>See More Team Details</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* ── 8. Client Testimonials & Endorsements ── */}
      <Testimonials />

    </main>
  );
}
