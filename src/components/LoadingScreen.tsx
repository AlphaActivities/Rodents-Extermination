interface Props {
  visible: boolean;
}

export default function LoadingScreen({ visible }: Props) {
  return (
    <div aria-hidden={!visible} className={`loading-screen ${visible ? '' : 'loading-screen--exit'}`}>
      {/* Top curtain panel */}
      <div className="loading-curtain loading-curtain--top" />

      {/* Bottom curtain panel */}
      <div className="loading-curtain loading-curtain--bottom" />

      {/* Content — logo + name + spinner, centred between the two curtains */}
      <div className={`loading-content ${visible ? '' : 'loading-content--exit'}`}>
        <div className="loading-logo-wrap">
          <img
            src="/logo/black_logo.PNG"
            alt="Rodents Exterm and Insulation LLC"
            className="loading-logo"
          />
        </div>

        <div className="loading-name-wrap">
          <p className="loading-company-name">Rodents Exterm</p>
          <p className="loading-company-sub">& Insulation LLC</p>
        </div>

        <div className="loading-spinner-wrap">
          <span className="loading-spinner" aria-label="Loading" />
        </div>
      </div>
    </div>
  );
}
