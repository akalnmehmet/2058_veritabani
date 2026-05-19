// Path: @/redux/reducers/index.ts
import {combineReducers} from "redux"
import getBayilerFromApiReducer from "./getBayilerFromApiReducer";
import editBayilerOnApiReducer from "./editBayilerOnApiReducer";
import getMusterilerFromApiReducer from "./getMusterilerFromApiReducer";
import getProfillerFromApiReducer from "./getProfillerFromApiReducer";
import getDigerMalzemelerFromApiReducer from "./getDigerMalzemelerFromApiReducer";
import getCamlarFromApiReducer from "./getCamlarFromApiReducer";
import getSistemlerFromApiReducer from "./getSistemlerFromApiReducer";
import getProjelerFromApiReducer from "./getProjelerFromApiReducer";
import getSelectedFromProjelerTableReducer from "./getSelectedFromProjelerTableReducer";
import getSiparislerFromApiReducer from "./getSiparislerFromApiReducer";
import siparisDetayReducer from "./siparisDetayReducer";
import siparislerTableReducer from "./siparislerTableReducer";
import getSiparisDetayReducer from "./getSiparisDetayReducer";
import systemVariantsOfSystem from "./systemVariantsOfSystem";
import getProjeFromApiReducer from "./getProjeFromApiReducer";
import getSystemFullVariantsOfSystemFromApiReducer from "./getSystemFullVariantsOfSystemFromApiReducer";
import getProjeRequirementsFromApiReducer from "./getProjeRequirementsFromApiReducer";
import getProfilImageFromApiReducer from "./getProfilImageFromApiReducer";
import getProfileColorsFromApiReducer from "./getProfileColorsFromApiReducer";
import getGlassColorsFromApiReducer from "./getGlassColorsFromApiReducer";
import getSystemVariantsFromApiReducer from "./getSystemVariantsFromApiReducer";
import auth from "./authReducer";
import getKumandalarFromApiReducer from "./getKumandalarFromApiReducer";
import pdfConfigsReducer from "./pdfConfigsReducer";
import getPdfTitleByKeyReducer from "./getPdfTitleByKeyReducer";
import getPdfBrandByKeyReducer from "./getPdfBrandByKeyReducer";
import getBrandImageReducer from "./getBrandImageReducer";
import getSystemImageFromApiReducer from "./getSystemImageFromApiReducer";
import getSystemVariantImageFromApiReducer from "./getSystemVariantImageFromApiReducer";
import calcHelpersReducer from "./calcHelpersReducer";


const rootReducer = combineReducers({
    getBayilerFromApiReducer,
    editBayilerOnApiReducer,
    getMusterilerFromApiReducer,
    getProfillerFromApiReducer,
    getDigerMalzemelerFromApiReducer,
    getCamlarFromApiReducer,
    getSistemlerFromApiReducer,
    getProjelerFromApiReducer,
    getSelectedFromProjelerTableReducer,
    getSiparislerFromApiReducer,
    siparisDetayReducer,
    siparislerTableReducer,
    getSiparisDetayReducer,
    systemVariantsOfSystem,
    getProjeFromApiReducer,
    getSystemFullVariantsOfSystemFromApiReducer,
    getProjeRequirementsFromApiReducer,
    getProfilImageFromApiReducer,
    getProfileColorsFromApiReducer,
    getGlassColorsFromApiReducer,
    getSystemVariantsFromApiReducer,
    auth,
    getKumandalarFromApiReducer,
    pdfConfigsReducer,
    getPdfTitleByKeyReducer,
    getPdfBrandByKeyReducer,
    getBrandImageReducer,
    getSystemImageFromApiReducer,
    getSystemVariantImageFromApiReducer,
    calcHelpersReducer
})

export default rootReducer;