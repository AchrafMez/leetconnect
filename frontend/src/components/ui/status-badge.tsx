import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toUpperCase() || 'UNKNOWN';
  
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let customColorClasses = "";
  
  switch (normalizedStatus) {
    case "OPEN":
    case "PENDING":
      customColorClasses = "border-transparent bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10";
      break;
    case "IN_PROGRESS":
      customColorClasses = "border-transparent bg-blue-500/10 text-blue-500 hover:bg-blue-500/10";
      break;
    case "ACCEPTED":
    case "COMPLETED":
    case "PAID":
    case "SUCCESS":
      customColorClasses = "border-transparent bg-primary/10 text-primary hover:bg-primary/10";
      break;
    case "REJECTED":
    case "CANCELLED":
    case "CLOSED":
    case "FAILED":
      variant = "destructive";
      customColorClasses = "bg-destructive/10 text-destructive hover:bg-destructive/10 border-transparent shadow-none";
      break;
    default:
      variant = "secondary";
      break;
  }

  return (
    <Badge 
      variant={variant} 
      className={cn("uppercase tracking-wider font-semibold text-[10px] px-2 py-0.5", customColorClasses, className)}
    >
      {normalizedStatus.replace(/_/g, " ")}
    </Badge>
  );
}
