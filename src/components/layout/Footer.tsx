import Link from "next/link";

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

type Props = {
  brandName: string;
  brandTagline: string;
  description: string;
  columns: FooterColumn[];
  legalLinks: { label: string; href: string }[];
  appTitle: string;
  appIos: string;
  appAndroid: string;
};

export function Footer({
  brandName,
  brandTagline,
  description,
  columns,
  legalLinks,
  appTitle,
  appIos,
  appAndroid,
}: Props) {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white">
                FM
              </span>
              <div className="leading-tight">
                <p className="text-base font-bold text-slate-900">{brandName}</p>
                <p className="text-xs text-slate-500">{brandTagline}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-slate-900">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-emerald-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {appTitle && (
            <div>
              <p className="text-sm font-semibold text-slate-900">{appTitle}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-emerald-600 shadow">
                    📱
                  </span>
                  {appIos}
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-emerald-600 shadow">
                    🤖
                  </span>
                  {appAndroid}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brandName}. Crafted for the hackathon.
          </p>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-emerald-700">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
