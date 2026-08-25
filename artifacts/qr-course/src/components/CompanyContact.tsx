import zhiLogo from "../../../../attached_assets/zhi_logoc_1787651807972.png";

type CompanyContactProps = {
  compact?: boolean;
  className?: string;
};

export function CompanyContact({
  compact = false,
  className = "",
}: CompanyContactProps) {
  return (
    <a
      href="https://zhisystems.org"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 rounded-md text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      aria-label="Contact ZHI Systems"
    >
      <img
        src={zhiLogo}
        alt="ZHI Systems"
        className={compact ? "h-7 w-7 shrink-0" : "h-8 w-8 shrink-0"}
      />
      <span className="leading-tight">
        <span
          className={`block font-semibold tracking-[0.12em] text-foreground ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          ZHI SYSTEMS
        </span>
        <span className="block text-xs underline decoration-border underline-offset-2 group-hover:decoration-foreground">
          Contact us
        </span>
      </span>
    </a>
  );
}