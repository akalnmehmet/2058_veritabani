// Path: @/scenes/projeekle/ProjeDuzenle.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import DialogMusteriSec from '@/scenes/projeekle/DialogMusteriSec';
import DialogCamRenkSec from '@/scenes/projeekle/DialogCamRenkSec';
import DialogProfilRenkSec from '@/scenes/projeekle/DialogProfilRenkSec';

import * as actions_projeler from '@/redux/actions/actions_projeler';
import { getProfilImageFromApi } from '@/redux/actions/actions_profiller';
import Header from '@/components/mycomponents/Header';
import SistemTable from './SistemTable';
import MalzemeTable from '@/scenes/projeekle/MalzemeTable';
import { ReactComponent as Paintbrush } from '../../icons/paintbrush.svg';
import { ReactComponent as User } from '../../icons/user_v2.svg';
import { ReactComponent as Pencilruler } from "../../icons/pencil-ruler.svg";
import { generateCamCiktisiPdf } from './pdf/pdfGlass';
import { generateOrderPdf } from './pdf/pdfOrder';
import { generatePaintPdf } from './pdf/pdfPaint';
import { generateOptimizeProfilesPdf } from './pdf/pdfOptimizeProfiles';
import { getPdfBrandByKey, getPdfTitleByKey } from '@/redux/actions/actionsPdf';
import AppButton from '@/components/ui/AppButton';

// ✅ Tema uyumlu spinner
const Spinner = () => (
  <div className="flex justify-center items-center py-10 w-full h-full">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
  </div>
);

const ProjeDuzenle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [showOptChoice, setShowOptChoice] = useState(false);

  const [openMusteri, setOpenMusteri] = useState(false);
  const [openCamRenk, setOpenCamRenk] = useState(false);
  const [openProfilRenk, setOpenProfilRenk] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedGlassColor, setSelectedGlassColor] = useState('');
  const [selectedProfileColor, setSelectedProfileColor] = useState('');
  const [selectedGlassName, setSelectedGlassName] = useState('');
  const [selectedProfileName, setSelectedProfileName] = useState('');
  const [pressPrice, setPressPrice] = useState(0);
  const [paintedPrice, setPaintedPrice] = useState(0);
  const [paintStatus, setPaintStatus] = useState('string');
  const [glassStatus, setGlassStatus] = useState('string');
  const [productionStatus, setProductionStatus] = useState('string');

  const BOYA_DURUMLAR = ['Durum Belirtilmedi', 'Boyanacak', 'Boyada', 'Boyadan Geldi'];
  const CAM_DURUMLAR = ['Durum Belirtilmedi', 'Cam Çekildi', 'Cam Geldi', 'Cam Çekilecek'];
  const URETIM_DURUMLAR = ['Durum Belirtilmedi', 'Üretimde', 'Sevk Edildi'];

  const normalizeStatus = (s) => (s && s !== 'string' ? s : 'string');
  const proje = useSelector(state => state.getProjeFromApiReducer) || null;
  const requirements = useSelector(state => state.getProjeRequirementsFromApiReducer) || {
    systems: [],
    extra_requirements: [],
    extra_profiles: [],
    extra_glasses: [],
    extra_remotes: [],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(actions_projeler.getProjeFromApi(id));
        await dispatch(actions_projeler.getProjeRequirementsFromApi(id));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, id]);

  useEffect(() => {
    if (!proje) return;
    setProjectCode(proje.project_kodu || '');
    setProjectName(proje.project_name || '');

    if (proje.created_at) {
      const d = new Date(proje.created_at);
      if (!isNaN(d.getTime())) {
        setProjectDate(
          `${String(d.getDate()).padStart(2, '0')}/` +
          `${String(d.getMonth() + 1).padStart(2, '0')}/` +
          d.getFullYear()
        );
      } else {
        setProjectDate('');
      }
    } else {
      setProjectDate('');
    }

    setPressPrice(proje?.press_price ? proje.press_price : 0);
    setPaintedPrice(proje?.painted_price ? proje.painted_price : 0);
    setPaintStatus(normalizeStatus(proje?.paint_status));
    setGlassStatus(normalizeStatus(proje?.glass_status));
    setProductionStatus(normalizeStatus(proje?.production_status));
  }, [proje]);

  const handleNumberChange = (setter) => (e) => {
    const v = e.target.value;
    if (v === '') {
      setter(0);
    } else {
      const n = parseFloat(v);
      setter(Number.isFinite(n) ? n : 0);
    }
  };

  const handleNumberBlur = (val, setter) => {
    if (val === 0 || val === '' || isNaN(val)) {
      setter(0);
    }
  };

  useEffect(() => {
    if (!requirements) return;
    if (requirements.glass_color) {
      setSelectedGlassColor(requirements.glass_color.id);
      setSelectedGlassName(requirements.glass_color.name || '');
    }
    if (requirements.profile_color) {
      setSelectedProfileColor(requirements.profile_color.id);
      setSelectedProfileName(requirements.profile_color.name || '');
    }
    if (requirements.customer) {
      setSelectedCustomer(requirements.customer);
    }
  }, [requirements]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const profileId = selectedProfileColor === '' ? null : selectedProfileColor;
      const glassId = selectedGlassColor === '' ? null : selectedGlassColor;
      await dispatch(actions_projeler.editProjeOnApi(id, {
        project_code: projectCode,
        customer_id: selectedCustomer?.id,
        project_name: projectName,
        profile_color_id: profileId,
        glass_color_id: glassId,
        press_price: pressPrice,
        painted_price: paintedPrice,
        paint_status: paintStatus,
        glass_status: glassStatus,
        production_status: productionStatus
      }));
    } finally {
      setLoading(false);
    }
  };

  const StatusDropdown = ({ label, value, options, onChange }) => {
    const show = (s) => (s && s !== 'string' ? s : 'durum belirtilmedi');

    return (
      <div className="flex font-semibold items-center gap-2 w-full sm:w-auto">
        <span className="whitespace-nowrap">{label}:</span>
        <div className="dropdown w-full sm:w-auto">
          <button
            tabIndex={0}
            className="select select-bordered min-w-60 w-full cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 active:border-primary transition"
            title="Durum seç"
          >
            {show(value)}
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-card border border-border text-foreground rounded-box w-52"
          >
            {options.map((opt) => {
              const isActive = value === opt;
              return (
                <li
                  key={opt}
                  className={`${isActive ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-neutral-800'}`}
                >
                  <button
                    disabled={isActive}
                    onClick={() => !isActive && onChange(opt)}
                    className="text-left"
                  >
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  if (loading) return <Spinner />;

  return (
    <div className="grid grid-rows-[auto_1fr] min-h-screen">
      {/* Üst Başlık ve Butonlar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-3 sm:px-5 gap-2 mb-2">
        <Header title={`${projectCode} – ${projectName}`} />

        {/* ✅ mobilde wrap + gerekirse alt satıra düşsün */}
        <div className="flex flex-wrap gap-2 items-start md:justify-end">
          {/* Profil Aksesuar Listesi */}
          <div className="dropdown w-full sm:w-auto">
            <AppButton
              tabIndex={0}
              role="button"
              variant="kurumsalmavi"
              size="sm"
              shape="none"
              className="!min-h-0 w-full sm:w-auto"
              title="Profil Aksesuar Listesi"
            >
              Profil Aksesuar Listesi
            </AppButton>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-card border border-border text-foreground rounded-box w-52"
            >
              <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                <a onClick={() => navigate(`/profilaksesuar/edit/${id}?mode=press`)}>Press</a>
              </li>
              <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                <a onClick={() => navigate(`/profilaksesuar/edit/${id}?mode=painted`)}>Boyalı</a>
              </li>
            </ul>
          </div>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            className="w-full sm:w-auto"
            onClick={async () => {
              const brandCfgold = await dispatch(getPdfBrandByKey());
              const brandCfg = brandCfgold.config_json;
              const paintCfgold = await dispatch(getPdfTitleByKey('pdf.paint0'));
              const paintCfg = paintCfgold.config_json;
              await generatePaintPdf(
                { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                paintCfg,
                brandCfg
              );
            }}
            title="Boya çıktısı oluştur"
          >
            Boya Çıktısı
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            className="w-full sm:w-auto"
            onClick={async () => {
              const brandCfgold = await dispatch(getPdfBrandByKey());
              const brandCfg = brandCfgold.config_json;
              const glassCfgold = await dispatch(getPdfTitleByKey('pdf.glass0'));
              const glassCfg = glassCfgold.config_json;

              await generateCamCiktisiPdf(
                { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                glassCfg,
                brandCfg
              );
            }}
            title="Cam çıktısı oluştur"
          >
            Cam Çıktısı
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            className="w-full sm:w-auto"
            onClick={async () => {
              const brandCfgold = await dispatch(getPdfBrandByKey());
              const brandCfg = brandCfgold.config_json;
              const orderCfgold = await dispatch(getPdfTitleByKey('pdf.order0'));
              const orderCfg = orderCfgold.config_json;
              await generateOrderPdf(
                { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                orderCfg,
                brandCfg
              );
            }}
            title="Üretim çıktısı oluştur"
          >
            Üretim Çıktısı
          </AppButton>

          {/* Optimizasyon */}
          <div className="dropdown w-full sm:w-auto">
            <AppButton
              tabIndex={0}
              role="button"
              variant="kurumsalmavi"
              size="sm"
              shape="none"
              className="!min-h-0 w-full sm:w-auto"
              title="Optimizasyon PDF"
            >
              Optimizasyon
            </AppButton>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-card border border-border text-foreground rounded-box w-52"
            >
              <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                <a
                  onClick={async () => {
                    const brandCfgold = await dispatch(getPdfBrandByKey());
                    const brandCfg = brandCfgold.config_json;
                    const detayliCfgold = await dispatch(getPdfTitleByKey('pdf.optimize.detayli0'));
                    const detayliCfg = detayliCfgold.config_json;
                    await generateOptimizeProfilesPdf(
                      { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                      'detayli',
                      detayliCfg,
                      brandCfg
                    );
                  }}
                >
                  Detaylı
                </a>
              </li>
              <li className="hover:bg-gray-200 dark:hover:bg-neutral-800">
                <a
                  onClick={async () => {
                    const brandCfgold = await dispatch(getPdfBrandByKey());
                    const brandCfg = brandCfgold.config_json;
                    const detaysizCfgold = await dispatch(getPdfTitleByKey('pdf.optimize.detaysiz0'));
                    const detaysizCfg = detaysizCfgold.config_json;
                    await generateOptimizeProfilesPdf(
                      { dispatch, getProfilImageFromApi, projectName, projectCode, proje, requirements },
                      'detaysiz',
                      detaysizCfg,
                      brandCfg
                    );
                  }}
                >
                  Detaysız
                </a>
              </li>
            </ul>
          </div>

          {/* Kaydet */}
          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="none"
            className="w-full sm:w-auto"
            onClick={handleSave}
            title="Değişiklikleri kaydet"
          >
            Değişiklikleri Kaydet
          </AppButton>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="bg-card text-foreground w-full border border-border rounded-2xl p-3 sm:p-5 h-full flex flex-col">
        {/* Özet durum */}
        {!proje?.is_teklif && (
          <div className="border mb-5 border-border rounded-2xl h-auto items-center text-foreground px-4 py-3 flex flex-col md:flex-row md:justify-between flex-wrap gap-x-6 gap-y-3">
            <StatusDropdown
              label="Boya Durum"
              value={paintStatus}
              options={BOYA_DURUMLAR}
              onChange={setPaintStatus}
            />
            <StatusDropdown
              label="Cam Durum"
              value={glassStatus}
              options={CAM_DURUMLAR}
              onChange={setGlassStatus}
            />
            <StatusDropdown
              label="Üretim Durum"
              value={productionStatus}
              options={URETIM_DURUMLAR}
              onChange={setProductionStatus}
            />
          </div>
        )}

        {/* Proje Bilgileri */}
        <div className="border border-border justify-center rounded-2xl h-auto md:h-20 flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 font-semibold flex items-center p-4">
            Proje No:
            <div className="flex items-stretch ml-2 w-full">
              <input
                type="text"
                value={projectCode}
                onChange={e => setProjectCode(e.target.value)}
                className="input input-bordered rounded-r w-full max-w-xs"
              />
            </div>
          </div>

          <div className="w-full md:w-1/3 justify-center font-semibold flex items-center p-4">
            Proje Adı:
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="input input-bordered ml-2 w-full max-w-xs"
            />
          </div>

          <div className="w-full md:w-1/3 justify-center font-semibold flex items-center p-4">
            Proje Tarihi:
            <input
              type="text"
              value={projectDate}
              readOnly
              className="input input-bordered ml-2 w-32"
            />
          </div>
        </div>

        <div className="border border-border mt-5 rounded-2xl flex flex-col md:flex-row h-auto md:h-20">
          <div className="w-full md:w-1/2 font-semibold flex justify-center items-center p-4">
            Profil Press Fiyatı:
            <div className="flex items-stretch ml-2 w-full">
              <input
                type="number"
                step="0.01"
                value={pressPrice === 0 ? '' : pressPrice}
                onChange={handleNumberChange(setPressPrice)}
                onBlur={() => handleNumberBlur(pressPrice, setPressPrice)}
                placeholder="Press Profil Fiyatı Giriniz.."
                className="input input-bordered min-w-xs ml-2 w-full max-w-xs"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 font-semibold flex justify-center items-center p-4">
            Profil Boyalı Fiyatı:
            <input
              type="number"
              step="0.01"
              value={paintedPrice === 0 ? '' : paintedPrice}
              onChange={handleNumberChange(setPaintedPrice)}
              onBlur={() => handleNumberBlur(paintedPrice, setPaintedPrice)}
              placeholder="Boyalı Profil Fiyatı Giriniz.."
              className="input input-bordered ml-2 w-full min-w-xs max-w-xs"
            />
          </div>
        </div>

        {/* Renk & Müşteri */}
        <div className="border border-border mt-5 rounded-2xl flex flex-col md:flex-row h-auto md:h-20">
          {/* Sol blok (Cam + Profil rengi) */}
          <div className="w-full md:w-2/3 flex flex-col md:flex-row gap-3 p-2">
            {/* Cam rengi */}
            <div className="w-full md:w-1/2 flex items-center gap-3 p-2">
              <Paintbrush className="w-8 sm:w-10 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="font-semibold mb-1">Cam Rengi</div>
                <div className="truncate text-sm">
                  {selectedGlassName || requirements?.glass_color?.name || 'Henüz Seçilmedi'}
                </div>
              </div>
              <AppButton
                variant="kurumsalmavi"
                size="sm"
                className="ml-auto"
                onClick={() => setOpenCamRenk(true)}
                title="Cam rengi seç"
              >
                Seç
              </AppButton>
            </div>

            {/* Profil rengi */}
            <div className="w-full md:w-1/2 flex items-center gap-3 p-2">
              <Pencilruler className="w-8 sm:w-10 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="font-semibold mb-1">Profil Rengi</div>
                <div className="truncate text-sm">
                  {selectedProfileName || requirements?.profile_color?.name || 'Henüz Seçilmedi'}
                </div>
              </div>
              <AppButton
                variant="kurumsalmavi"
                className="ml-auto"
                size="sm"
                onClick={() => setOpenProfilRenk(true)}
                title="Profil rengi seç"
              >
                Seç
              </AppButton>
            </div>
          </div>

          {/* Sağ blok (Müşteri) */}
          <div className="w-full md:w-1/3 flex items-center gap-3 p-2">
            <User className="w-8 sm:w-10 shrink-0 ml-1 md:ml-2" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">Müşteri</div>
              <div className="truncate text-sm">
                {selectedCustomer
                  ? `${selectedCustomer.company_name} (${selectedCustomer.name})`
                  : (requirements?.customer
                    ? `${requirements.customer.company_name} (${requirements.customer.name})`
                    : 'Henüz Seçilmedi')}
              </div>
            </div>
            <AppButton
              variant="kurumsalmavi"
              size="sm"
              shape="none"
              className="ml-auto md:mr-10"
              onClick={() => setOpenMusteri(true)}
              title="Müşteri seç"
            >
              Seç
            </AppButton>
          </div>
        </div>

        {/* Tablolar */}
        <div className="mb-5">
          <SistemTable systems={requirements.systems} />
        </div>

        <MalzemeTable
          extraProfiles={requirements.extra_profiles}
          extraGlasses={requirements.extra_glasses}
          extraRequirements={requirements.extra_requirements}
          extraRemotes={requirements.extra_remotes}
        />

        {/* Alt Butonlar */}
        <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2 sm:gap-4">
          <AppButton
            variant="kurumsalmavi"
            size="mdtxtlg"
            className="w-full sm:w-40"
            onClick={() => navigate(`/ekstramalzemeekle/${id}`)}
            title="Ekstra malzeme ekle"
          >
            Malzeme Ekle
          </AppButton>
          <AppButton
            size="mdtxtlg"
            variant="kurumsalmavi"
            className="w-full sm:w-40"
            onClick={() => navigate(`/sistemsec/${id}`)}
            title="Sistem ekle"
          >
            Sistem Ekle
          </AppButton>
        </div>
      </div>

      {/* ✅ Radix tabanlı diyaloglar */}
      <DialogMusteriSec
        open={openMusteri}
        onOpenChange={setOpenMusteri}
        onSelect={(row) => {
          setSelectedCustomer(row);
          setOpenMusteri(false);
        }}
      />

      <DialogCamRenkSec
        open={openCamRenk}
        onOpenChange={setOpenCamRenk}
        requirements={requirements}
        projectId={id}
      />

      <DialogProfilRenkSec
        open={openProfilRenk}
        onOpenChange={setOpenProfilRenk}
        onSelect={(row) => {
          setSelectedProfileColor(row.id);
          setSelectedProfileName(row.name || '');
          setOpenProfilRenk(false);
        }}
      />
    </div>
  );
};

export default ProjeDuzenle;
