"use client";

// src/app/contact/page.tsx
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  LuMapPin as MapPin,
  LuMail as Mail,
  LuPhone as Phone,
  LuClock as Clock,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { submitContact } from "@/lib/api";

const font = { fontFamily: "Arial, sans-serif" };

const locations = [
  {
    city: "Dubai",
    address: "1-65, First Floor, Madina Mall, Muhaisnah, near Lulu Village, Dubai, UAE",
  },
  {
    city: "Abu Dhabi",
    address: "F-26, First Floor, Mazyad Mall, MBZ, Abu Dhabi, UAE",
  },
  {
    city: "Sharjah",
    address: "1st Floor, Mega Mall, Bu Daniq, Sharjah, UAE",
  },
];

const shops = [
  {
    name: "Mulberries Boutique — Dubai",
    address: "1-65, First Floor, Madina Mall, Muhaisnah, near Lulu Village, Dubai, UAE",
    phone: "+971 04 273 7543",
    whatsapp: "+971 050 471 5912",
    mapQuery: "Madina Mall Muhaisnah Dubai",
  },
  {
    name: "Mulberries Boutique — Abu Dhabi",
    address: "F-26, First Floor, Mazyad Mall, MBZ, Abu Dhabi, UAE",
    phone: "+971 02 627 8591",
    whatsapp: "+971 50 295 2714",
    mapQuery: "Mazyad Mall Abu Dhabi",
  },
  {
    name: "Mulberries Boutique — Sharjah",
    address: "Mega Mall, First Floor, Bu Daniq, Sharjah, UAE",
    phone: "+971 50 688 9394",
    whatsapp: "+971 050 688 9394",
    mapQuery: "Mega Mall Sharjah",
  },
];

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "Arial, sans-serif" };

const EMAIL = "geethy@gmail.com";
const CALL_NUMBER = "+971 4 273 7543";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const response = await submitContact({
        name: String(formData.get("name") || ""),
        company: String(formData.get("company") || ""),
        phone: String(formData.get("phone") || ""),
        email: String(formData.get("email") || ""),
        subject: String(formData.get("subject") || ""),
        message: String(formData.get("message") || ""),
      });
      form.reset();
      setFormMessage({ type: "success", text: response.message || "Your message has been sent." });
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to send your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={font} className="bg-[#faf5ef] text-[#2a1228]">
      {/* Get in touch */}

         <section className="relative overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1499159058454-75067059248a?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#2a1228]/60" />
              </div>
      
              <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 pt-28 pb-24 text-center">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#f5d796] mb-4">Contact Us</p>
                <h1
                  className="font-playfair text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-white max-w-3xl mx-auto"
                >
                  Get in touch with our team to stay updated on the <span className="italic font-playfair text-[#f5d796]">latest fashion.</span>
                </h1>
              </div>
            </section>
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: info */}
          <div>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#2a1228] mb-3">
              Get In <span className="italic font-playfair text-[#5c1a52]">Touch</span>
            </h2>
            <p className="text-base text-gray-600 mb-8 max-w-md">
              Reach out to us for any inquiries or assistance — we&apos;re here to help.
            </p>
            <div className="border-t border-[#e7dccf] mb-8" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              {locations.map((loc) => (
                <div key={loc.city} className="flex gap-3">
                  <MapPin size={20} className="text-[#5c1a52] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-base font-bold text-[#2a1228] mb-1">{loc.city}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{loc.address}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-3">
                <Mail size={20} className="text-[#5c1a52] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-[#2a1228] mb-1">Email Us</h3>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-sm text-gray-600 hover:text-[#5c1a52] transition-colors"
                  >
                    {EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone size={20} className="text-[#5c1a52] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-[#2a1228] mb-1">Call Us</h3>
                  <a
                    href={`tel:${CALL_NUMBER}`}
                    className="text-sm text-gray-600 hover:text-[#5c1a52] transition-colors"
                  >
                    {CALL_NUMBER}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: image with opening hours overlay */}
          <div className="relative w-full aspect-[4/3]">
            <Image
              src="/shope1.png"
              alt="Mulberries boutique interior"
              fill
              sizes="(min-width: 1024px) 500px, 100vw"
              className="object-cover"
            />
            <div className="absolute left-4 bottom-4 right-4 sm:right-auto sm:w-72 bg-[#2a1228]/90 text-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-[#e3b567]" />
                <h3 className="font-playfair text-base font-bold">Opening <span className="italic font-playfair text-[#f5d796]">Hours</span></h3>
              </div>
              <ul className="text-sm space-y-1 text-gray-200">
                <li className="flex justify-between"><span>Mon – Fri</span><span>10 – 10pm</span></li>
                <li className="flex justify-between"><span>Sat – Sun</span><span>10 – 12pm</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Shops */}
      <section className="bg-[#f4edf2] border-y border-[#e7dccf]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[#2a1228] mb-3">
              Our <span className="italic font-playfair text-[#5c1a52]">Shops</span>
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Visit us at Madina Mall, Mazyad Mall, or Mega Mall for the latest
              trends and personal styling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.name}
                className="bg-white border border-[#e7dccf] rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <h3 className="font-playfair text-lg font-bold text-[#2a1228] mb-3">{shop.name}</h3>

                  <div className="flex gap-2 mb-3">
                    <MapPin size={16} className="text-[#5c1a52] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-relaxed">{shop.address}</p>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <Phone size={16} className="text-[#5c1a52] flex-shrink-0" />
                    <a href={`tel:${shop.phone}`} className="text-sm text-gray-600 hover:text-[#5c1a52]">
                      {shop.phone}
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <FaWhatsapp size={16} className="text-[#5c1a52] flex-shrink-0" />
                    <a
                      href={`https://wa.me/${shop.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      className="text-sm text-gray-600 hover:text-[#5c1a52]"
                    >
                      {shop.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="relative w-full aspect-[4/3] border-t border-[#e7dccf]">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(shop.mapQuery)}&output=embed`}
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    title={`${shop.name} map`}
                  />
                </div>

                <Link
                  href="/"
                  className="block text-center bg-[#5c1a52] text-white text-sm font-medium tracking-wide py-3 hover:bg-[#4a1543] transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Contact Form */}
<section className="bg-white border-y border-[#e7dccf]">
  <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

      {/* Left: Images */}
      <div className="grid grid-cols-2 gap-3 h-[500px]">
        <div className="relative h-full overflow-hidden">
          <Image
            src="/shope1.png"
            alt="Mulberries Boutique"
            fill
            sizes="(min-width: 1024px) 300px, 50vw"
            className="object-cover"
          />
        </div>

        <div className="relative h-full overflow-hidden">
          <Image
            src="/muberrise-about.jpg"
            alt="Mulberries Boutique"
            fill
            sizes="(min-width: 1024px) 300px, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Right: Contact Form */}
      <div>
        <p className="text-sm tracking-[0.18em] uppercase text-[#5c1a52] mb-3">
          Contact Us
        </p>

        <h2
          className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2a1228] leading-tight mb-4"
        >
          Send Us a <span className="italic font-playfair text-[#5c1a52]">Message</span>
        </h2>

        <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-lg">
          Get in touch with our team to stay updated about the latest
          fashion trends, collections, and boutique updates.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Name + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold tracking-wider uppercase text-[#2a1228] mb-2"
              >
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Name"
                required
                className="w-full h-12 px-4 bg-[#f8f4f4] border border-transparent text-sm text-[#2a1228] placeholder:text-gray-400 outline-none focus:border-[#5c1a52] focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="company"
                className="block text-xs font-semibold tracking-wider uppercase text-[#2a1228] mb-2"
              >
                Company
              </label>

              <input
                id="company"
                name="company"
                type="text"
                placeholder="Company"
                className="w-full h-12 px-4 bg-[#f8f4f4] border border-transparent text-sm text-[#2a1228] placeholder:text-gray-400 outline-none focus:border-[#5c1a52] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold tracking-wider uppercase text-[#2a1228] mb-2"
              >
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone"
                required
                className="w-full h-12 px-4 bg-[#f8f4f4] border border-transparent text-sm text-[#2a1228] placeholder:text-gray-400 outline-none focus:border-[#5c1a52] focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold tracking-wider uppercase text-[#2a1228] mb-2"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full h-12 px-4 bg-[#f8f4f4] border border-transparent text-sm text-[#2a1228] placeholder:text-gray-400 outline-none focus:border-[#5c1a52] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-xs font-semibold tracking-wider uppercase text-[#2a1228] mb-2"
            >
              Subject
            </label>

            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Subject"
              required
              className="w-full h-12 px-4 bg-[#f8f4f4] border border-transparent text-sm text-[#2a1228] placeholder:text-gray-400 outline-none focus:border-[#5c1a52] focus:bg-white transition"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-xs font-semibold tracking-wider uppercase text-[#2a1228] mb-2"
            >
              Message
            </label>

            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Message"
              required
              className="w-full px-4 py-3 bg-[#f8f4f4] border border-transparent text-sm text-[#2a1228] placeholder:text-gray-400 outline-none focus:border-[#5c1a52] focus:bg-white transition resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#5c1a52] text-white text-xs font-semibold tracking-[0.18em] uppercase hover:bg-[#4a1543] transition-colors"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
          {formMessage && (
            <p
              role="status"
              className={`text-sm ${formMessage.type === "success" ? "text-green-700" : "text-red-600"}`}
            >
              {formMessage.text}
            </p>
          )}
        </form>
      </div>
    </div>
  </div>
</section>
    </main>
  );
}
