import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const SIZES = [
  { size: "2.2", cm: "5.4 cm", inch: "2 1/8 in" },
  { size: "2.4", cm: "5.7 cm", inch: "2 1/4 in" },
  { size: "2.6", cm: "6.0 cm", inch: "2 3/8 in" },
  { size: "2.8", cm: "6.4 cm", inch: "2 1/2 in" },
];

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Find your bangle size" size="md" footer={<Button onClick={onClose}>Got it</Button>}>
      <div className="space-y-5">
        <svg viewBox="0 0 170 80" role="img" aria-label="A bangle with its inner diameter marked" className="mx-auto h-28 w-auto text-gold-dark">
          <circle cx="60" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" />
          <line x1="28" y1="40" x2="92" y2="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M28 36v8M92 36v8" stroke="currentColor" strokeWidth="1.5" />
          <text x="102" y="44" fontSize="9" fill="currentColor">
            inner diameter
          </text>
        </svg>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink/75">
          <li>Bring your thumb and little finger together and measure across the widest part of your closed hand.</li>
          <li>Or measure the inner diameter of a bangle that already fits you comfortably, and match it below.</li>
        </ul>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Standard Indian bangle sizes by inner diameter</caption>
          <thead>
            <tr className="border-b border-sand text-xs uppercase tracking-wider text-ink/55">
              <th scope="col" className="py-2">
                Size
              </th>
              <th scope="col" className="py-2">
                Inner diameter
              </th>
              <th scope="col" className="py-2">
                Inches
              </th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map((s) => (
              <tr key={s.size} className="border-b border-sand/60">
                <th scope="row" className="py-2 font-semibold text-ink">
                  {s.size}
                </th>
                <td className="py-2">{s.cm}</td>
                <td className="py-2">{s.inch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
