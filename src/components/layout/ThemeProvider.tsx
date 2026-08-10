"use client";

interface Tenant {
  primaryColor: string;
  secondaryColor: string;
  radius: string;
  logoUrl: string;
  storeName: string;
}

export function ThemeProvider({ tenant, children }: { tenant: Tenant; children: React.ReactNode }) {
  return (
    <>
      <style>{`
        :root {
          --primary: ${tenant.primaryColor};
          --secondary: ${tenant.secondaryColor};
          --radius: ${tenant.radius};
        }
      `}</style>
      {children}
    </>
  );
}
