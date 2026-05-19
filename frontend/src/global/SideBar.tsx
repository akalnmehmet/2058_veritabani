// Path: @/global/SideBar.tsx
import { useContext } from "react";
import { ReactComponent as ChevronFirst } from "../icons/chevron-first.svg";
import { ReactComponent as ChevronLast } from "../icons/chevron-last.svg";
import { ReactComponent as Clipboardlist } from "../icons/clipboard-list.svg";
import { ReactComponent as Grid2x2 } from "../icons/grid-2x2.svg";
import { ReactComponent as Layoutdashboard } from "../icons/layout-dashboard.svg";
import { ReactComponent as Package } from "../icons/package.svg";
import { ReactComponent as Pencilruler } from "../icons/pencil-ruler.svg";
import { ReactComponent as Remote } from "../icons/git-pull-request-draft.svg";
import { ReactComponent as Offer } from "../icons/hand-coins.svg";
import { ReactComponent as Store } from "../icons/store.svg";
import { ReactComponent as User } from "../icons/user.svg";
import { ReactComponent as Wrench } from "../icons/wrench.svg";
import { ReactComponent as Settings } from "../icons/settings.svg";
import { SidebarContext } from "./SideBarContext";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Paintbrush } from "../icons/paintbrush.svg";
import { useSelector } from "react-redux";

function SidebarShema({ children }) {
  const { expanded, setExpanded } = useContext(SidebarContext);

  return (
    <>
      {/* 🔹 Mobilde sidebar açıldığında arka planı karartan overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setExpanded(false)}
        />
      )}

      <nav
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out
          bg-card/95 backdrop-blur-md border-r border-border/50 shadow-sm
          ${expanded ? "w-64" : "w-20"}
          md:translate-x-0
          ${expanded ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* 🔹 Desktop için üstteki toggle butonu (md ve üzeri görünsün) */}
        <div className={`p-4 pb-2 hidden md:flex items-center ${expanded ? "justify-between" : "justify-center"}`}>
          {expanded && (
            <div className="flex items-center justify-center overflow-hidden px-1">
              <img 
                src="/yazisiz_logo.png" 
                alt="Tümen Logo" 
                className="h-8 md:h-10 w-auto object-contain select-none dark:brightness-110 drop-shadow-sm" 
                draggable={false}
              />
            </div>
          )}
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 cursor-pointer rounded-lg transition-all duration-300 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {expanded ? <ChevronFirst className="w-5 h-5" /> : <ChevronLast className="w-5 h-5" />}
          </button>
        </div>

        <ul className="flex-1 px-3 mt-6 space-y-1.5 overflow-y-auto no-scrollbar pb-4">{children}</ul>
      </nav>
    </>
  );
}

// 🔧 Tema-dostu item
function SidebarItem({ icon, text, active, alert, onClick }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      onClick={onClick}
      className={`
        relative flex items-center h-12 py-2 px-3
        font-medium rounded-xl cursor-pointer transition-all duration-200 group overflow-hidden
        ${
          active
            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
        }
      `}
    >
      {/* Active state indicator line on the left */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md"></div>
      )}

      {/* ikonlar temada da rahat görünsün diye opak */}
      <span className={`transition-transform duration-200 ${active ? "opacity-100 scale-110" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"}`}>
        {icon}
      </span>

      <span
        className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "w-48 ml-3 opacity-100" : "w-0 opacity-0"
        }`}
      >
        {text}
      </span>

      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] ${
            expanded ? "" : "top-2 right-2"
          }`}
        />
      )}

      {/* dar modda title tooltip'i */}
      {!expanded && (
        <div
          className={`
            absolute left-full rounded-lg px-3 py-1.5 ml-4 z-50 whitespace-nowrap
            bg-popover text-popover-foreground border border-border shadow-md text-sm font-semibold
            invisible opacity-0 -translate-x-3 transition-all duration-200
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}

const SideBar = () => {
  const navigate = useNavigate();

  /**
   * 🔑 Yine tek kaynak: state.auth.isAdmin
   *  - deriveIsAdmin sayesinde boolean garantili
   */
  const isAdmin = useSelector((s) => s.auth?.isAdmin === true);
  const bootstrapped = useSelector((s) => !!s.auth?.bootstrapped);
  // const isAdmin = true;
  const { expanded, setExpanded } = useContext(SidebarContext);

  // Admin değilse sadece bu 4 sayfa görünsün
  const allowedForNonAdmin = new Set([
    "musteriler",
    "projeler",
    "teklifler",
    "ayarlar",
  ]);

  const items = [
    { key: "bayiler",        icon: <Store className="w-10" />,        text: "Bayiler" },
    { key: "musteriler",     icon: <User className="w-10" />,         text: "Müşteriler" },
    { key: "projeler",       icon: <Clipboardlist className="w-10" />,text: "Projeler" },
    { key: "teklifler",      icon: <Offer className="w-10" />,        text: "Teklifler" },
    { key: "sistemler",      icon: <Wrench className="w-10" />,       text: "Sistemler" },
    { key: "profiller",      icon: <Pencilruler className="w-10" />,  text: "Profiller" },
    { key: "camlar",         icon: <Grid2x2 className="w-10" />,      text: "Camlar" },
    { key: "digermalzemeler",icon: <Package className="w-10" />,      text: "Diğer Malzemeler" },
    { key: "boyalar",        icon: <Paintbrush className="w-7" />,    text: "Boyalar" },
    { key: "kumandalar",     icon: <Remote className="w-8" />,        text: "Kumandalar" },
    { key: "ayarlar",        icon: <Settings className="w-8" />,      text: "Ayarlar" },
  ];

  let visibleItems = [];
  if (!bootstrapped) {
    // Yükleniyor iskeleti: 6 sahte satır
    visibleItems = Array.from({ length: 6 }, (_, i) => ({
      key: `skeleton-${i}`,
      icon: <div className="w-8 h-8 rounded bg-muted-foreground/20" />,
      text: "Yükleniyor...",
    }));
  } else {
    visibleItems = isAdmin
      ? items
      : items.filter((it) => allowedForNonAdmin.has(it.key));
  }

  return (
    <>
      {/* 🔹 Mobil için sol üstte sabit floating toggle butonu */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="
          fixed top-3 left-3 z-50 md:hidden
          p-2 rounded-md bg-secondary border border-border
          shadow-md
        "
      >
        {expanded ? (
          <ChevronFirst className="w-5 h-5" />
        ) : (
          <ChevronLast className="w-5 h-5" />
        )}
      </button>

      <SidebarShema>
        {visibleItems.map((it) => (
          <SidebarItem
            key={it.key}
            onClick={() => {
              // skeleton satırları tıklanamaz
              if (!it.key.startsWith?.("skeleton-")) {
                navigate(it.key);

                // 🔹 Sadece MOBİLDE tıklandıktan sonra sidebar'ı kapat
                if (
                  typeof window !== "undefined" &&
                  window.innerWidth < 768 // Tailwind "md" breakpointi
                ) {
                  setExpanded(false);
                }
              }
            }}
            icon={it.icon}
            text={it.text}
          />
        ))}
      </SidebarShema>
    </>
  );
};

export default SideBar;
