import Link from "next/link";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/categories", label: "Categories" },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="w-full h-full md:w-64 border-r bg-card p-4 flex flex-col">
      <div className="px-3 py-4 mb-4 hidden md:block">
        <h2 className="text-xl font-bold tracking-tight">Admin</h2>
      </div>
      <div className="space-y-1 flex-1">
        {links.map((l) => (
          <Link 
            key={l.href} 
            href={l.href} 
            onClick={onNavigate}
            className="block px-3 py-2.5 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
