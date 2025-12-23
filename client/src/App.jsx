import React, { useState } from 'react';
import MysticBackground from './components/layout/MysticBackground';
import CosmicHeader from './components/layout/CosmicHeader';
import HeroOracle from './components/sections/HeroOracle';
import ReadingFlow from './components/sections/ReadingFlow';
import PaymentAltar from './components/sections/PaymentAltar';
import TeaserRevelation from './components/sections/TeaserRevelation';
import ReadingRevelation from './components/sections/ReadingRevelation';
import CrystalBallLoader from './components/ui/CrystalBallLoader';
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
    startPaymentFlow
  } = useReading();

  const [uiState, setUiState] = useState('hero'); // hero, form, payment, reading

  // Bridge Context state to UI transitions
  // Ideally Context drives UI, but we are mixing for the visual overhaul structure provided

  return (
    <div className="min-h-screen text-moon overflow-hidden relative selection:bg-rose selection:text-white">
      <MysticBackground />
      <CosmicHeader />

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
