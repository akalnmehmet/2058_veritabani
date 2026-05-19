// src/App.tsx
import ContentArea from "./global/ContentArea";
import { SidebarProvider } from "./global/SideBarContext";
import { ToastContainer } from "react-toastify";
import ModalProvider from "@/shared/modals/ModalProvider";
import ConfirmProvider from "@/shared/modals/ConfirmProvider";

function App() {
  return (
    <>
      <ModalProvider>
        <ConfirmProvider>
          <SidebarProvider>
            <ContentArea />
          </SidebarProvider>
        </ConfirmProvider>
      </ModalProvider>

      <ToastContainer
        position="bottom-right"
        autoClose={750}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        className="myToastContainer"
        toastClassName="myToast"
        bodyClassName="myToastBody"
      />
    </>
  );
}

export default App;
