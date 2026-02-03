import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col justify-center px-8 py-10 lg:px-12 xl:px-24">
        {children}
      </div>

      {/* Right side - Decorative image */}
      <div className="hidden lg:block relative bg-muted">
        <Image src="/images/login-image.png" alt="" fill className="w-fit" priority />
      </div>
    </div>
  );
}
