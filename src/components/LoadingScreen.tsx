interface Props {
  visible: boolean;
}

export default function LoadingScreen({ visible }: Props) {
  return (
    <div
      aria-hidden={!visible}
      className={`loading-screen ${visible ? 'loading-screen--visible' : 'loading-screen--exit'}`}
    >
      {/* Logo mark */}
      <div className="loading-logo-wrap">
        <img
          src="/logo/black_logo.PNG"
          alt="Rodents Exterm and Insulation LLC"
          className="loading-logo"
        />
      </div>

      {/* Company name */}
      <div className="loading-name-wrap">
        <p className="loading-company-name">Rodents Exterm</p>
        <p className="loading-company-sub">& Insulation LLC</p>
      </div>

      {/* Luxury spinner */}
      <div className="loading-spinner-wrap">
        <span className="loading-spinner" aria-label="Loading" />
      </div>
    </div>
  );
}
