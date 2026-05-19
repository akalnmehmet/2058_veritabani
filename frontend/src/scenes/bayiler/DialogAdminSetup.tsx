// Path: @/scenes/bayiler/DialogAdminSetup.tsx
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

export default function DialogAdminSetup({
  open,
  onOpenChange,
  dealer,
  onSubmit, // ({ username, password, send_email }) => Promise<{username,password}>
}) {
  const dealerName = useMemo(() => dealer?.name || "Bayi", [dealer]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // Response (yalnızca modal içinde gösterilecek)
  const [created, setCreated] = useState(null); // {username,password}
  const [copiedU, setCopiedU] = useState(false);
  const [copiedP, setCopiedP] = useState(false);

  useEffect(() => {
    if (!open) {
      // ✅ modal kapanınca her şeyi sıfırla (R3.3)
      setUsername("");
      setPassword("");
      setShowPw(false);
      setSendEmail(true);
      setSubmitting(false);
      setCreated(null);
      setCopiedU(false);
      setCopiedP(false);
    }
  }, [open]);

  const canSubmit = dealer?.id && username.trim() && password;

  const handleSubmit = async () => {
    if (!canSubmit || typeof onSubmit !== "function") return;

    try {
      setSubmitting(true);
      const res = await onSubmit({
        username: username.trim(),
        password: String(password),
        send_email: !!sendEmail,
      });

      const u = res?.username ?? username.trim();
      const p = res?.password ?? password;

      setCreated({ username: String(u || ""), password: String(p || "") });
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = async (text, kind) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      if (kind === "u") {
        setCopiedU(true);
        setTimeout(() => setCopiedU(false), 1500);
      } else {
        setCopiedP(true);
        setTimeout(() => setCopiedP(false), 1500);
      }
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>Kullanıcı Oluştur</DialogTitle>
          <DialogDescription>
            {dealerName} için bayi admin hesabı bilgilerini tanımlayın.
          </DialogDescription>
        </DialogHeader>

        {!created ? (
          <div className="grid gap-4">
            <div className="grid gap-1">
              <label className="text-sm opacity-80">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-bordered"
                placeholder="örn: bayi_ankara"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm opacity-80">Password</label>
              <div className="flex gap-2">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                />
                <AppButton
                  variant="neutral"
                  onClick={() => setShowPw((v) => !v)}
                  className="shrink-0"
                >
                  {showPw ? "Gizle" : "Göster"}
                </AppButton>
              </div>
            </div>

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
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
              >
                {submitting ? "Oluşturuluyor..." : "Oluştur"}
              </AppButton>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="text-sm text-muted-foreground">
              Bu bilgiler yalnızca bu modal açıkken gösterilir. Kapatınca tekrar görüntülenmez.
            </div>

            <div className="grid gap-2">
              <label className="text-sm opacity-80">Username</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input readOnly value={created.username} className="input input-bordered w-full font-mono text-sm" />
                <AppButton
                  variant="kurumsalmavi"
                  onClick={() => copyText(created.username, "u")}
                  className="w-full sm:w-auto"
                  disabled={!created.username}
                >
                  {copiedU ? "Kopyalandı" : "Kopyala"}
                </AppButton>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm opacity-80">Password</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input readOnly value={created.password} className="input input-bordered w-full font-mono text-sm" />
                <AppButton
                  variant="kurumsalmavi"
                  onClick={() => copyText(created.password, "p")}
                  className="w-full sm:w-auto"
                  disabled={!created.password}
                >
                  {copiedP ? "Kopyalandı" : "Kopyala"}
                </AppButton>
              </div>
            </div>
          </div>
        )}

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
