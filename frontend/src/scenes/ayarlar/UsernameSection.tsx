// Path: @/scenes/ayarlar/UsernameSection.tsx
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import { changeUsername } from "@/redux/actions/authActions";

export default function UsernameSection() {
  const dispatch = useDispatch();
  const user = useSelector((s: any) => s.auth?.user);
  const currentUsername = useMemo(() => String(user?.username ?? ""), [user]);

  const [nextUsername, setNextUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const trimmed = String(nextUsername || "").trim();
    if (!trimmed) return;

    try {
      setSaving(true);
      await dispatch<any>(changeUsername(trimmed));
      setNextUsername("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm text-foreground">
      <div className="text-lg font-semibold mb-4">Kullanıcı Adı Değiştir</div>

      <div className="grid gap-4 max-w-md">
        <div className="grid gap-1">
          <label className="text-sm opacity-80">Mevcut kullanıcı adı</label>
          <input
            readOnly
            value={currentUsername}
            className="w-full bg-background/50 border border-border/60 rounded-xl px-4 py-2.5 outline-none text-sm opacity-90 cursor-not-allowed"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm opacity-80">Yeni kullanıcı adı</label>
          <input
            value={nextUsername}
            onChange={(e) => setNextUsername(e.target.value)}
            className="w-full bg-background/50 border border-border/60 hover:border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            placeholder="örn: bayi_admin_ankara"
          />
        </div>

        <div className="flex justify-end">
          <AppButton
            onClick={onSave}
            disabled={saving || !String(nextUsername || "").trim()}
            variant="kurumsalmavi"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </AppButton>
        </div>
      </div>
    </section>
  );
}
