import React, { useState, useEffect } from 'react';
import MysticBackground from './components/layout/MysticBackground';
import CosmicHeader from './components/layout/CosmicHeader';
import HeroOracle from './components/sections/HeroOracle';
import ReadingFlow from './components/sections/ReadingFlow';
import PaymentAltar from './components/sections/PaymentAltar';
import TeaserRevelation from './components/sections/TeaserRevelation';
import ReadingRevelation from './components/sections/ReadingRevelation';
import CrystalBallLoader from './components/ui/CrystalBallLoader';
import RecoveryModal from './components/sections/RecoveryModal'; // [NEW]
import { ReadingProvider, useReading } from './context/ReadingContext';
import Footer from './components/layout/Footer';


// Inner component to consume Context
const AppContent = () => {
  const {
    userData,
    updateUserData,
    confirmPayment,
    drawnCards,
    readingText,
    readingState,
    startPaymentFlow,
    setDrawnCards,      // [NEW]
    setReadingText,     // [NEW]
    setReadingState,    // [NEW]
    toggleBump,          // [NEW] (Maybe needed if we want to restore bumps correctly, but context handles generic set?)
    // Actually toggleBump is for toggling. We might need to manually set bumps if they are returned.
    // But for now, let's just trust the reading endpoint to handle the logic based on DB.
    // Wait, the client context likely needs selectedBumps for UI consistency (though ReadingRevelation usually just shows static text).
    // ReadingRevelation uses 'deck' and 'readingData'.
  } = useReading();

  const [uiState, setUiState] = useState('hero'); // hero, form, payment, reading
  const [showRecovery, setShowRecovery] = useState(false); // [NEW]

  // [NEW] Handle URL Recovery
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recoverEmail = params.get('recover_email');
    if (recoverEmail) {
      handleRecovery(recoverEmail);
      // Clear param to clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // [NEW] Recovery Logic
  const handleRecovery = async (email) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // 1. Check Status
      const statusRes = await fetch(`${API_URL}/api/payment/status/${email}`);
      const statusData = await statusRes.json();

      if (statusData.status !== 'paid') {
        throw new Error("Pagamento não encontrado ou pendente.");
      }

      // 2. Update Context
      updateUserData({ email });
      // Optionally update bumps here if we exposed setBumps, but usually reading generation is the key.

      // 3. Fetch Reading
      // We manually call the /readings endpoint
      const readingRes = await fetch(`${API_URL}/api/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }) // The endpoint relies mainly on email lookup in DB now
      });

      const readingData = await readingRes.json();

      if (readingData.error) throw new Error(readingData.error);

      // 4. Update State
      setDrawnCards(readingData.cards);
      setReadingText(readingData.reading);
      setReadingState('complete');
      setUiState('reading');
      setShowRecovery(false);

    } catch (error) {
      console.error("Recovery failed", error);
      throw error; // Propagate to Modal or handle global alert
    }
  };

  return (
    <div className="min-h-screen text-moon overflow-hidden relative selection:bg-rose selection:text-white">
      <MysticBackground />
      <CosmicHeader onRecover={() => setShowRecovery(true)} />

      <RecoveryModal
        isOpen={showRecovery}
        onClose={() => setShowRecovery(false)}
        onRecover={handleRecovery}
      />

      <main className="relative z-10 container mx-auto px-4 pt-16">
        {uiState === 'hero' && (
          <HeroOracle onBegin={() => setUiState('form')} />
        )}

        {uiState === 'form' && (
          <ReadingFlow
            userData={userData}
            onUpdate={updateUserData}
            onSubmit={() => {
              startPaymentFlow();
              setUiState('payment');
            }}
          />
        )}

        {uiState === 'payment' && (
          <PaymentAltar
            userData={userData}
            onPaymentComplete={async () => {
              await confirmPayment();
              // confirmPayment in context handles fetching, we just wait for cards?
              // Context sets 'readingState' to 'complete'. 
              // We should probably watch readingState or just force transition here for simplicity
              setUiState('reading');
            }}
          />
        )}

        {readingState === 'shuffling' || readingState === 'drawing' ? (
          <CrystalBallLoader message="O universo está tecendo seu destino..." />
        ) : null}

        {uiState === 'reading' && readingState === 'complete' && (
          <ReadingRevelation
            deck={drawnCards}
            readingData={{ reading: readingText }}
            userData={userData}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ReadingProvider>
      <AppContent />
    </ReadingProvider>
  );
}

export default App;
