import React from 'react';

/**
 * Renders the professional user‑flow illustration that shows the farmer,
 * logistics, buyer and a mobile mock‑up of the Saarthi app.
 *
 * The image file should be placed in the public folder (e.g. /images/user_flow_pro.png).
 * Replace the placeholder path with the actual asset when available.
 */
const UserFlowIllustration: React.FC = () => {
  return (
    <figure className="w-full max-w-5xl mx-auto p-4 bg-[var(--saarthi-surface-low)] rounded-2xl shadow-lg">
      <img
        src="/images/user_flow_pro.png"
        alt="Saarthi user flow: farmer, logistics truck, buyer, and mobile app mock‑up"
        className="w-full h-auto object-contain"
      />
      <figcaption className="mt-2 text-center text-sm text-[var(--saarthi-on-surface-variant)]">
        How Saarthi connects farmers, logistics and buyers across India.
      </figcaption>
    </figure>
  );
};

export default UserFlowIllustration;
