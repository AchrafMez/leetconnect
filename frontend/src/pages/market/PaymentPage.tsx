import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2 } from "lucide-react";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setIsLoading(true);
        const data = await api<{ payment: any }>(`/market/jobs/payments/${id}`);
        setPayment(data.payment);
      } catch (err) {
        console.error("Failed to fetch payment:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  const payNow = async () => {
    try {
      setIsPaying(true);
      await api(`/market/jobs/payments/${id}/pay`, { method: "POST" });
      navigate("/market/dashboard");
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Transaction could not be completed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );

  if (!payment)
    return (
      <div className="text-center py-20 text-sm text-muted-foreground">
        Transaction record not found
      </div>
    );

  return (
    <div className="max-w-md mx-auto space-y-8 pb-16 pt-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-border bg-muted/20 text-center space-y-3">
          <h1 className="text-xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-xs text-muted-foreground">Secure Project Funding</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Amount */}
          <div className="flex justify-between items-end">
            <p className="text-sm text-muted-foreground font-medium">Amount Due</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-primary text-xl font-bold">$</span>
              <span className="text-4xl font-bold text-foreground">{payment.amount}</span>
            </div>
          </div>

          {/* Details */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Project</span>
              <span className="font-medium truncate max-w-[180px]">
                {payment.proposal?.job?.title || "Project Funding"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee</span>
              <Badge variant="secondary" className="text-[11px]">Waived</Badge>
            </div>
          </div>

          <Separator />

          {/* Status & Security */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/10 rounded-lg p-3">
              Funds are protected by LeetConnect Escrow
            </div>

            <div className="flex items-center justify-center">
              <StatusBadge status={payment.status} />
            </div>
          </div>

          {/* Pay Button */}
          <Button
            onClick={payNow}
            disabled={isPaying || payment.status === "PAID"}
            className="w-full"
            size="lg"
          >
            {isPaying ? (
              <Loader2 size={16} className="animate-spin" />
            ) : payment.status === "PAID" ? (
              "Project Funded"
            ) : (
              "Confirm Transaction"
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            By confirming, you agree to release funds
            <br />
            only upon verified project completion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
