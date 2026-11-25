import { Clock, Gem, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Sawariya Jewels concierge for consultations and order support.",
};

/** Store details shown beside the form. Keep in sync with the real business details. */
const details = [
  { icon: MapPin, title: "Jaipur Atelier & Vault", text: "42, Johari Palace, Near City Palace, Jaipur, Rajasthan 302001" },
  { icon: Phone, title: "Concierge Line", text: "+91 (0141) 256-8800 / +91 98290 12345" },
  { icon: Mail, title: "Direct Correspondence", text: "concierge@sawariyajewels.com" },
  { icon: Clock, title: "Salon Viewing Hours", text: "Monday – Saturday: 10:30 AM – 8:00 PM IST" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-parchment px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-dark">
          <Gem className="h-3.5 w-3.5" aria-hidden /> Jewellery Concierge
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">Private Client Services & Consultation</h1>
        <p className="text-sm leading-relaxed text-ink/60">Whether you desire a custom solitaire ring, a bespoke bridal set, or guidance on an heirloom, our team is at your service.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="space-y-6 rounded-3xl border border-gold-dark/30 bg-ink-deep p-8 text-white shadow-xl lg:col-span-5">
          <h2 className="font-serif text-xl font-bold tracking-tight">Visit Our Salon</h2>
          <p className="text-xs leading-relaxed text-white/70">Schedule a private appointment to experience the collection in person.</p>
          <ul className="space-y-4 pt-2 text-xs">
            {details.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <div>
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="text-white/60">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 rounded-3xl border border-sand bg-white p-8 shadow-sm sm:p-10 lg:col-span-7">
          <h2 className="font-serif text-lg font-bold text-ink">Schedule a Consultation or Inquiry</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
