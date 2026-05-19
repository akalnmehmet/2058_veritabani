// Path: @/scenes/bayiler/DialogResendInvite.tsx
// Path Alias: src/scenes/bayiler/DialogResendInvite.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

export default function DialogResendInvite({
  open,
  onOpenChange,
  dealer,
  onSubmit, // (sendEmail:boolean) => Promise<string>  -> inviteLink
}) {
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const dealerName = useMemo(() => dealer?.name || "Bayi", [dealer]);

  useEffect(() => {
    if (!open) {
      // modal kapanınca reset
      setSendEmail(true);
      setSubmitting(false);
      setInviteLink("");
      setCopied(false);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!dealer?.id || typeof onSubmit !== "function") return;
    try {
      setSubmitting(true);
      const link = await onSubmit(sendEmail);
      setInviteLink(String(link || ""));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // sessiz
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>Tekrar Davet Gönder</DialogTitle>
          <DialogDescription>
            {dealerName} için yeni davet oluşturabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="flex items-center gap-3 select-none">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            <span className="text-sm">E-posta gönder</span>
          </label>

          <div className="flex justify-end">
            <AppButton
              variant="kurumsalmavi"
              onClick={handleCreate}
              disabled={submitting || !dealer?.id}
            >
              {submitting ? "Oluşturuluyor..." : "Davet Oluştur"}
            </AppButton>
          </div>

          <div className="grid gap-2">
            <label className="text-sm opacity-80">Davet Bağlantısı</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={inviteLink}
                className="input input-bordered w-full font-mono text-sm"
                placeholder="Davet oluşturunca burada görünecek."
              />
              <AppButton
                variant="kurumsalmavi"
                onClick={handleCopy}
                className="w-full sm:w-auto"
                disabled={!inviteLink}
              >
                {copied ? "Kopyalandı" : "Kopyala"}
              </AppButton>
            </div>

            {!sendEmail && inviteLink && (
              <p className="text-sm text-muted-foreground">
                Mail gönderilmedi. Bu linki bayi ile manuel paylaşabilirsiniz.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <DialogClose asChild>
            <AppButton variant="neutral" className="w-full sm:w-auto">
              Kapat
            </AppButton>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
