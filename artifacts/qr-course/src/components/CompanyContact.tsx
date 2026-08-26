import zhiLogo from "../../../../attached_assets/zhi_logoc_1787770845488.png";

type CompanyContactProps = {
  compact?: boolean;
  className?: string;
};

export function CompanyContact({
  compact = false,
  className = "",
}: CompanyContactProps) {
  return (
    <div className={`inline-flex items-center gap-2 text-left ${className}`}>
      <a
        href="https://zhisystems.ai/"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Visit ZHI Systems"
      >
        <img
          src={zhiLogo}
          alt="ZHI Systems"
          className={compact ? "h-7 w-7" : "h-8 w-8"}
        />
      </a>
      <span className="leading-tight">
        <span
          className={`block font-semibold tracking-[0.12em] text-foreground ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          ZHI SYSTEMS
        </span>
        <a
          href="mailto:johnmichaelkuczynski@gmail.com"
          className="block rounded-sm text-xs underline decoration-border underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Contact us
        </a>
      </span>
    </div>
  );
}