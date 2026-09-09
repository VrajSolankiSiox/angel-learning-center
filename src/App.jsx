import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import ConfirmModal from "./components/ConfirmModal";

import HomeView from "./views/HomeView";
import PacketView from "./views/PacketView";
import EnrollmentView from "./views/EnrollmentView";
import FinancialView from "./views/FinancialView";
import TransportView from "./views/TransportView";
import EmergencyView from "./views/EmergencyView";
import IesView from "./views/IesView";
import HandbookView from "./views/HandbookView";
import PhotoView from "./views/PhotoView";
import UploadsView from "./views/UploadsView";
import StaffView from "./views/StaffView";
import DoneView from "./views/DoneView";
import WaitlistDoneView from "./views/WaitlistDoneView";

import { useEnrollment } from "./context/EnrollmentContext";

export function App() {
  const { currentView, isWaitlistFlow, navigateTo } = useEnrollment();

  React.useEffect(() => {
    if (!isWaitlistFlow) return;
    const allowed = new Set(["enrollment", "waitlist-done", "home"]);
    if (!allowed.has(currentView)) {
      navigateTo("enrollment");
    }
  }, [currentView, isWaitlistFlow, navigateTo]);

  const renderActiveView = () => {
    switch (currentView) {
      case "packet":
        if (isWaitlistFlow) return <EnrollmentView />;
        return <PacketView />;
      case "enrollment":
        return <EnrollmentView />;
      case "financial":
        return <FinancialView />;
      case "transport":
        return <TransportView />;
      case "emergency":
        return <EmergencyView />;
      case "ies":
        return <IesView />;
      case "handbook":
        return <HandbookView />;
      case "photo":
        return <PhotoView />;
      case "uploads":
        return <UploadsView />;
      case "staff":
        return <StaffView />;
      case "done":
        return <DoneView />;
      case "waitlist-done":
        return <WaitlistDoneView />;
      case "locations":
      case "home":
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      <div id="appShell" className="app-shell">
        <Header />
        <main>{renderActiveView()}</main>
        <Footer />
      </div>
      <Toast />
      <ConfirmModal />
    </>
  );
}

export default App;
