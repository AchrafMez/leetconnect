import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, ShieldCheck, Lock } from "lucide-react";

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
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );

  if (!payment)
    return (
      <div className="text-center py-20 text-sm text-muted-foreground">
        Transaction record not found
      </div>
    );

  const isPaid = payment.status === "PAID";

  return (
    <div className="max-w-md mx-auto space-y-6 sm:space-y-8 pb-16 pt-4 sm:pt-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <Card className="border-border/50 bg-background-elevated shadow-none overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-border/50 bg-secondary/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto relative overflow-hidden">
            <span className="absolute inset-0 bg-primary/10" />
            <Lock size={20} className="text-primary relative" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Checkout</h1>
            <p className="text-xs text-muted-foreground mt-1">Secure Project Funding</p>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Amount */}
          <div className="flex justify-between items-end gap-3">
            <p className="text-sm text-muted-foreground font-medium">Amount Due</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-primary text-xl font-bold">$</span>
              <span className="text-3xl sm:text-4xl font-bold text-foreground">{payment.amount}</span>
            </div>
          </div>

          {/* Details */}
          <div className="border border-border/50 rounded-lg p-4 space-y-3 bg-background">
            <div className="flex justify-between items-center text-sm gap-3">
              <span className="text-muted-foreground shrink-0">Project</span>
              <span className="font-medium truncate text-right">
                {payment.proposal?.job?.title || "Project Funding"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Network Fee</span>
              <Badge variant="secondary" className="text-[11px]">Waived</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={payment.status} />
            </div>
          </div>

          <Separator />

          {/* Security note */}
          <div className="flex items-start gap-2.5 text-xs text-primary bg-primary/5 border border-primary/10 rounded-lg p-3">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Funds are protected by LeetConnect Escrow and only released upon verified completion.
            </p>
          </div>

          {/* Pay Button */}
          <Button
            onClick={payNow}
            disabled={isPaying || isPaid}
            className="w-full"
            size="lg"
          >
            {isPaying ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPaid ? (
              "Project Funded"
            ) : (
              "Confirm Transaction"
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            By confirming, you agree to release funds only upon verified project completion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;
