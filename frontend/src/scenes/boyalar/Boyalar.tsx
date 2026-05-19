// src/scenes/boyalar/Boyalar.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProfileColorFromApi,
  getGlassColorFromApi,
  addColorToApi,
  editColorInApi,
  deleteColorFromApi,
  makeDefaultColorOne,
  makeDefaultColorTwo,
} from "@/redux/actions/actions_boyalar";
import Header from "@/components/mycomponents/Header";
import AppButton from "@/components/ui/AppButton";
import { useModal } from "@/shared/modals/ModalProvider";
import { useConfirm } from "@/shared/modals/ConfirmProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const EMPTY_PAGE = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const Boyalar = () => {
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const confirm = useConfirm();

  const profileData = useSelector((s: any) => s.getProfileColorsFromApiReducer) || EMPTY_PAGE;
  const glassData = useSelector((s: any) => s.getGlassColorsFromApiReducer) || EMPTY_PAGE;
  const [profileSearch, setProfileSearch] = useState("");
  const [glassSearch, setGlassSearch] = useState("");

  const [profilePage, setProfilePage] = useState(1);
  const [glassPage, setGlassPage] = useState(1);

  const [profileLimit, setProfileLimit] = useState(10);
  const [glassLimit, setGlassLimit] = useState(10);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingGlass, setLoadingGlass] = useState(false);

  /**
   * UUIDv4 id kullanıldığı için deletingId string olmalı.
   */
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [defaultOpen, setDefaultOpen] = useState(false);
  const [defaultTarget, setDefaultTarget] = useState<any>(null);
  const [defaultLoading, setDefaultLoading] = useState(false);

  useEffect(() => {
    setLoadingProfile(true);
    const safeLimit = Math.min(50, Math.max(1, Number(profileLimit) || 10));
    dispatch(getProfileColorFromApi(profilePage, profileSearch, safeLimit)).finally(() => setLoadingProfile(false));
  }, [dispatch, profilePage, profileSearch, profileLimit]);

  useEffect(() => {
    setLoadingGlass(true);
    const safeLimit = Math.min(50, Math.max(1, Number(glassLimit) || 10));
    dispatch(getGlassColorFromApi(glassPage, glassSearch, safeLimit)).finally(() => setLoadingGlass(false));
  }, [dispatch, glassPage, glassSearch, glassLimit]);

  const refetchProfiles = useCallback(async () => {
    setLoadingProfile(true);
    const safeLimit = Math.min(50, Math.max(1, Number(profileLimit) || 10));
    try {
      await dispatch(getProfileColorFromApi(profilePage, profileSearch, safeLimit));
    } finally {
      setLoadingProfile(false);
    }
  }, [dispatch, profilePage, profileSearch, profileLimit]);

  const refetchGlasses = useCallback(async () => {
    setLoadingGlass(true);
    const safeLimit = Math.min(50, Math.max(1, Number(glassLimit) || 10));
    try {
      await dispatch(getGlassColorFromApi(glassPage, glassSearch, safeLimit));
    } finally {
      setLoadingGlass(false);
    }
  }, [dispatch, glassPage, glassSearch, glassLimit]);

  /**
   * Backend contract gereği create + edit işlemlerinde unit_cost her zaman 0 gönderilmeli.
   * Create tarafında da unit_cost ekliyoruz.
   */
  const handleAddProfile = useCallback(
    async (data: { name: string }) => {
      setLoadingProfile(true);
      try {
        await dispatch(addColorToApi({ ...data, type: "profile", unit_cost: 0 }));
        await refetchProfiles();
      } finally {
        setLoadingProfile(false);
      }
    },
    [dispatch, refetchProfiles]
  );

  /**
   * UUIDv4 id kullanıldığı için id: string
   * PUT body: { name, unit_cost } (type gönderilmez)
   */
  const handleEditProfile = useCallback(
    async (data: { id: string; name: string }) => {
      setLoadingProfile(true);
      try {
        await dispatch(editColorInApi({ id: data.id, name: data.name, unit_cost: 0 }));
        await refetchProfiles();
      } finally {
        setLoadingProfile(false);
      }
    },
    [dispatch, refetchProfiles]
  );

  const handleAddGlass = useCallback(
    async (data: { name: string }) => {
      setLoadingGlass(true);
      try {
        await dispatch(addColorToApi({ ...data, type: "glass", unit_cost: 0 }));
        await refetchGlasses();
      } finally {
        setLoadingGlass(false);
      }
    },
    [dispatch, refetchGlasses]
  );

  /**
   * UUIDv4 id kullanıldığı için id: string
   * PUT body: { name, unit_cost } (type gönderilmez)
   */
  const handleEditGlass = useCallback(
    async (data: { id: string; name: string }) => {
      setLoadingGlass(true);
      console.log({ id: data.id, name: data.name, unit_cost: 0 }, { data });

      try {
        await dispatch(editColorInApi({ id: data.id, name: data.name, unit_cost: 0 }));
        await refetchGlasses();
      } finally {
        setLoadingGlass(false);
      }
    },
    [dispatch, refetchGlasses]
  );

  const openCreateProfile = () => {
    openModal("boya.upsert", {
      mode: "create",
      kind: "profile",
      onSave: async (payload: any) => {
        await handleAddProfile({ name: payload.name });
      },
    });
  };

  const openEditProfile = (color: any) => {
    openModal("boya.upsert", {
      mode: "edit",
      kind: "profile",
      color,
      onSave: async (payload: any) => {
        // UUIDv4 -> string; Number(...) dönüşümü kaldırıldı
        await handleEditProfile({ id: String(payload.id), name: payload.name });
      },
    });
  };

  const openCreateGlass = () => {
    openModal("boya.upsert", {
      mode: "create",
      kind: "glass",
      onSave: async (payload: any) => {
        await handleAddGlass({ name: payload.name });
      },
    });
  };

  const openEditGlass = (color: any) => {
    openModal("boya.upsert", {
      mode: "edit",
      kind: "glass",
      color,
      onSave: async (payload: any) => {
        // UUIDv4 -> string; Number(...) dönüşümü kaldırıldı
        await handleEditGlass({ id: String(payload.id), name: payload.name });
      },
    });
  };

  const askDelete = async (kind: "profile" | "glass", color: any) => {
    if (!color?.id) return;
    if (deletingId != null) return;

    const ok = await confirm({
      title: "Silmek istediğinize emin misiniz?",
      description: `'${color.name}' silinecek. Bu işlem geri alınamaz.`,
      confirmText: "Evet, sil",
      cancelText: "Vazgeç",
      confirmVariant: "kirmizi",
    });

    if (!ok) return;

    try {
      const id = String(color.id);
      setDeletingId(id);
      await dispatch(deleteColorFromApi(id));
      if (kind === "profile") await refetchProfiles();
      else await refetchGlasses();
    } finally {
      setDeletingId(null);
    }
  };

  const askSetDefaultGlass = (color: any) => {
    setDefaultTarget(color);
    setDefaultOpen(true);
  };

  const handleSetDefaultOne = async () => {
    if (!defaultTarget) return;
    try {
      setDefaultLoading(true);
      await dispatch(makeDefaultColorOne(String(defaultTarget.id)));
      await refetchGlasses();
      setDefaultOpen(false);
    } finally {
      setDefaultLoading(false);
    }
  };

  const handleSetDefaultTwo = async () => {
    if (!defaultTarget) return;
    try {
      setDefaultLoading(true);
      await dispatch(makeDefaultColorTwo(String(defaultTarget.id)));
      await refetchGlasses();
      setDefaultOpen(false);
    } finally {
      setDefaultLoading(false);
    }
  };

  const renderDefaultBadge = (color: any) => {
    if (color?.is_default && color?.is_default_2) {
      return <span className="badge badge-success ml-2 whitespace-nowrap">Varsayılan 1 ve 2 Olarak Atandı</span>;
    }
    if (color?.is_default) {
      return <span className="badge badge-success ml-2 whitespace-nowrap">Varsayılan 1 Olarak Atandı</span>;
    }
    if (color?.is_default_2) {
      return <span className="badge badge-success ml-2 whitespace-nowrap">Varsayılan 2 Olarak Atandı</span>;
    }
    return null;
  };

  const profileTotalPages = profileData.total_pages || 1;
  const glassTotalPages = glassData.total_pages || 1;

  return (
    <div className="grid grid-rows-[60px_1fr] min-h-screen">
      <Header title="Boyalar" />

      <div className="space-y-8">
        <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl space-y-5 text-foreground">
          {/* ÜST ARAÇ ÇUBUĞU (GLASSMORPHISM) */}
          <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
            <h2 className="text-xl md:text-2xl font-semibold whitespace-nowrap">Profil Boyaları</h2>

            <div className="relative w-full md:max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={profileSearch}
                onChange={(e) => {
                  setProfileSearch(e.target.value);
                  setProfilePage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="Profil Boyası Ara.."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto bg-background/40 px-3 py-2 rounded-xl border border-border/50">
                <label className="text-sm opacity-80 whitespace-nowrap">Kayıt/Sayfa:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={profileLimit}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10);
                    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
                    setProfileLimit(clamped);
                    setProfilePage(1);
                  }}
                  className="w-16 bg-transparent text-center outline-none text-sm font-medium"
                  title="Sayfa Başına Kayıt (min:1 / max:50)"
                />
              </div>

              <div className="w-full md:w-auto md:ml-auto">
                <AppButton shape="md" variant="kurumsalmavi" size="mdtxtlg" className="w-full md:w-44 shadow-sm" onClick={openCreateProfile}>
                  + Boya Ekle
                </AppButton>
              </div>
            </div>
          </div>

          {loadingProfile ? (
            <Spinner />
          ) : (
            <>
              <div className="hidden md:block flex-grow overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-4 font-semibold tracking-wider">Boya İsmi</th>
                      <th className="px-4 py-4 font-semibold tracking-wider text-center">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.items?.length > 0 ? (
                      profileData.items.map((color: any) => {
                        const isDeleting = deletingId === String(color.id);
                        return (
                          <tr key={color.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors group">
                            <td className="px-4 py-3.5 font-bold text-primary/90">{color.name}</td>
                            <td className="px-4 py-3.5 text-center space-x-2">
                              <AppButton shape="md" size="sm" variant="sari" onClick={() => openEditProfile(color)}>
                                Düzenle
                              </AppButton>
                              <AppButton shape="md"
                                size="sm"
                                variant="kirmizi"
                                onClick={() => askDelete("profile", color)}
                                disabled={isDeleting}
                                loading={isDeleting}
                              >
                                Sil
                              </AppButton>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center text-muted-foreground py-10">
                          Veri bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden flex flex-col gap-3">
                {profileData.items?.length > 0 ? (
                  profileData.items.map((color: any) => {
                    const isDeleting = deletingId === String(color.id);
                    return (
                      <div key={color.id} className="border border-border rounded-2xl p-4 bg-card shadow-sm flex flex-col gap-3">
                        <div className="text-base font-semibold">{color.name}</div>

                        <div className="grid grid-cols-2 gap-2">
                          <AppButton shape="md" variant="sari" size="md" className="w-full" onClick={() => openEditProfile(color)}>
                            Düzenle
                          </AppButton>

                          <AppButton shape="md"
                            variant="kirmizi"
                            size="md"
                            className="w-full"
                            onClick={() => askDelete("profile", color)}
                            disabled={isDeleting}
                            loading={isDeleting}
                          >
                            Sil
                          </AppButton>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">Veri bulunamadı.</div>
                )}
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
                <AppButton shape="md" size="sm" variant="kurumsalmavi" onClick={() => setProfilePage(1)} disabled={profileData.page === 1}>
                  « İlk
                </AppButton>

                <AppButton shape="md"
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setProfilePage((p) => Math.max(p - 1, 1))}
                  disabled={!profileData.has_prev}
                >
                  ‹ Önceki
                </AppButton>

                <form
                  onSubmit={(e: any) => {
                    e.preventDefault();
                    const val = parseInt(e.target.elements.pageNum.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= profileTotalPages) setProfilePage(val);
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="pageNum"
                    min={1}
                    max={profileTotalPages}
                    value={profileData.page || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) return setProfilePage(1);
                      setProfilePage(Math.min(Math.max(1, val), profileTotalPages));
                    }}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  <span className="text-sm">/ {profileTotalPages}</span>
                </form>

                <AppButton shape="md"
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setProfilePage((p) => Math.min(profileTotalPages, p + 1))}
                  disabled={!profileData.has_next}
                >
                  Sonraki ›
                </AppButton>

                <AppButton shape="md"
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setProfilePage(profileTotalPages)}
                  disabled={profileData.page === profileTotalPages || profileTotalPages <= 1}
                >
                  Son »
                </AppButton>
              </div>
            </>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl space-y-5 text-foreground">
          {/* ÜST ARAÇ ÇUBUĞU (GLASSMORPHISM) */}
          <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
            <h2 className="text-xl md:text-2xl font-semibold whitespace-nowrap">Cam Boyaları</h2>

            <div className="relative w-full md:max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={glassSearch}
                onChange={(e) => {
                  setGlassSearch(e.target.value);
                  setGlassPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="Cam Boyası Ara.."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto bg-background/40 px-3 py-2 rounded-xl border border-border/50">
                <label className="text-sm opacity-80 whitespace-nowrap">Kayıt/Sayfa:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={glassLimit}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10);
                    const clamped = isNaN(raw) ? 10 : Math.min(50, Math.max(1, raw));
                    setGlassLimit(clamped);
                    setGlassPage(1);
                  }}
                  className="w-16 bg-transparent text-center outline-none text-sm font-medium"
                  title="Sayfa Başına Kayıt (min:1 / max:50)"
                />
              </div>

              <div className="w-full md:w-auto md:ml-auto">
                <AppButton shape="md" variant="kurumsalmavi" size="mdtxtlg" className="w-full md:w-44 shadow-sm" onClick={openCreateGlass}>
                  + Boya Ekle
                </AppButton>
              </div>
            </div>
          </div>

          {loadingGlass ? (
            <Spinner />
          ) : (
            <>
              <div className="hidden md:block flex-grow overflow-x-auto rounded-xl border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-4 font-semibold tracking-wider">Boya İsmi</th>
                      <th className="px-4 py-4 font-semibold tracking-wider text-center">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glassData.items?.length > 0 ? (
                      glassData.items.map((color: any) => {
                        const isDeleting = deletingId === String(color.id);
                        return (
                          <tr key={color.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors group">
                            <td className="px-4 py-3.5 flex items-center gap-1 font-bold text-primary/90">
                              <span>{color.name}</span>
                              {renderDefaultBadge(color)}
                            </td>
                            <td className="px-4 py-3.5 text-center space-x-2">
                              <AppButton shape="md" size="sm" variant="sari" onClick={() => openEditGlass(color)}>
                                Düzenle
                              </AppButton>
                              <AppButton shape="md" size="sm" variant="yesil" onClick={() => askSetDefaultGlass(color)}>
                                Varsayılan Ata
                              </AppButton>
                              <AppButton shape="md"
                                size="sm"
                                variant="kirmizi"
                                onClick={() => askDelete("glass", color)}
                                disabled={isDeleting}
                                loading={isDeleting}
                              >
                                Sil
                              </AppButton>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={2} className="border-b border-base-500 border-gray-500 text-center text-muted-foreground py-4">
                          Veri bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden flex flex-col gap-3">
                {glassData.items?.length > 0 ? (
                  glassData.items.map((color: any) => {
                    const isDeleting = deletingId === String(color.id);
                    return (
                      <div key={color.id} className="border border-border rounded-2xl p-4 bg-card shadow-sm flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-base font-semibold">{color.name}</div>
                          <div className="shrink-0">{renderDefaultBadge(color)}</div>
                        </div>

                        <AppButton shape="md" variant="yesil" size="md" className="w-full" onClick={() => askSetDefaultGlass(color)}>
                          Varsayılan Ata
                        </AppButton>

                        <div className="grid grid-cols-2 gap-2">
                          <AppButton shape="md" variant="sari" size="md" className="w-full" onClick={() => openEditGlass(color)}>
                            Düzenle
                          </AppButton>

                          <AppButton shape="md"
                            variant="kirmizi"
                            size="md"
                            className="w-full"
                            onClick={() => askDelete("glass", color)}
                            disabled={isDeleting}
                            loading={isDeleting}
                          >
                            Sil
                          </AppButton>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-border rounded-2xl p-6 text-center text-muted-foreground">Veri bulunamadı.</div>
                )}
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4">
                <AppButton shape="md" size="sm" variant="kurumsalmavi" onClick={() => setGlassPage(1)} disabled={glassData.page === 1}>
                  « İlk
                </AppButton>

                <AppButton shape="md"
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setGlassPage((p) => Math.max(p - 1, 1))}
                  disabled={!glassData.has_prev}
                >
                  ‹ Önceki
                </AppButton>

                <form
                  onSubmit={(e: any) => {
                    e.preventDefault();
                    const val = parseInt(e.target.elements.pageNum.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= glassTotalPages) setGlassPage(val);
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="number"
                    name="pageNum"
                    min={1}
                    max={glassTotalPages}
                    value={glassData.page || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) return setGlassPage(1);
                      setGlassPage(Math.min(Math.max(1, val), glassTotalPages));
                    }}
                    className="input input-bordered input-sm w-16 text-center"
                  />
                  <span className="text-sm">/ {glassTotalPages}</span>
                </form>

                <AppButton shape="md"
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setGlassPage((p) => Math.min(glassTotalPages, p + 1))}
                  disabled={!glassData.has_next}
                >
                  Sonraki ›
                </AppButton>

                <AppButton shape="md"
                  size="sm"
                  variant="kurumsalmavi"
                  onClick={() => setGlassPage(glassTotalPages)}
                  disabled={glassData.page === glassTotalPages || glassTotalPages <= 1}
                >
                  Son »
                </AppButton>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={defaultOpen} onOpenChange={setDefaultOpen}>
        <DialogContent className="w-[94vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Varsayılan Ata</DialogTitle>
          </DialogHeader>

          <div className="mt-2 text-sm opacity-80">
            {defaultTarget ? (
              <p>
                <b>{defaultTarget.name}</b> rengi için varsayılan atama yapın.
              </p>
            ) : (
              <p>Bir renk seçin.</p>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <AppButton shape="md"
              variant="kurumsalmavi"
              onClick={handleSetDefaultOne}
              loading={defaultLoading}
              disabled={!defaultTarget || defaultLoading}
              className="w-full sm:w-auto"
            >
              Varsayılan 1 ata
            </AppButton>

            <AppButton shape="md"
              variant="mor"
              onClick={handleSetDefaultTwo}
              loading={defaultLoading}
              disabled={!defaultTarget || defaultLoading}
              className="w-full sm:w-auto"
            >
              Varsayılan 2 ata
            </AppButton>

            <DialogClose asChild>
              <AppButton shape="md" variant="gri" className="w-full sm:w-auto">
                Vazgeç
              </AppButton>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Boyalar;
