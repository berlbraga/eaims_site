import Image from "next/image";

type OrbitalLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "blue" | "white";
};

export function OrbitalLogo({ className = "", priority = false, variant = "blue" }: OrbitalLogoProps) {
  return (
    <Image
      src={variant === "white" ? "/brand/eaims-orbital-white.png" : "/brand/eaims-orbital-blue.png"}
      alt=""
      width={1415}
      height={1463}
      className={className}
      aria-hidden
      priority={priority}
    />
  );
}
