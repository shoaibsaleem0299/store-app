import Link from "next/link";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/categories", label: "Categories" },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r p-4 space-y-1">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="block px-3 py-2 rounded-md hover:bg-secondary">
          {l.label}
        </Link>
      ))}
    </aside>
  );
}
