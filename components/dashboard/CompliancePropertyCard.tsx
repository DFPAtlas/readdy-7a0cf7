"use client";

interface CompliancePropertyCardProps {
  property: {
    propertyId: string;
    propertyName: string;
    address: string;
    overallStatus: string;
    criticalCount: number;
    expiredCount: number;
    expiringSoonCount: number;
    validCount: number;
    totalCount: number;
    nextDeadline: string;
    image: string;
  };
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  Critical: "text-[#C46868] bg-[#C46868]/10 border-[#C46868]/20",
  Attention: "text-[#D4A85C] bg-[#D4A85C]/10 border-[#D4A85C]/20",
  Compliant: "text-[#7A9A7E] bg-[#7A9A7E]/10 border-[#7A9A7E]/20",
};

export default function CompliancePropertyCard({ property, onClick }: CompliancePropertyCardProps) {
  const statusClass = statusColors[property.overallStatus] || statusColors.Compliant;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-[#D5D9D5] p-4 text-left hover:shadow-md hover:border-[#C28A78] transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <img src={property.image} alt={property.propertyName} className="w-full h-full object-cover object-top" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#3A3F3A] truncate">{property.propertyName}</p>
          <p className="text-xs text-[#687068] truncate">{property.address}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${statusClass}`}>
          {property.overallStatus}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {property.criticalCount > 0 && (
          <span className="flex items-center gap-1 text-[#C46868]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C46868]"></span>
            {property.criticalCount} critical
          </span>
        )}
        {property.expiredCount > 0 && (
          <span className="flex items-center gap-1 text-[#C46868]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C46868]"></span>
            {property.expiredCount} expired
          </span>
        )}
        {property.expiringSoonCount > 0 && (
          <span className="flex items-center gap-1 text-[#D4A85C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A85C]"></span>
            {property.expiringSoonCount} expiring
          </span>
        )}
        {property.validCount > 0 && (
          <span className="flex items-center gap-1 text-[#7A9A7E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A9A7E]"></span>
            {property.validCount} valid
          </span>
        )}
      </div>
      <p className="text-xs text-[#687068] mt-2">
        Next deadline: <span className="font-medium text-[#3A3F3A]">{property.nextDeadline}</span>
      </p>
    </button>
  );
}