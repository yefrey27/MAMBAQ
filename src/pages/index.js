import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const features = [
  {
    icon: '🎨',
    title: 'Arte Digital Interactivo',
    description:
      'Los visitantes pueden transformar sus fotografías en obras de arte usando efectos como Pixel Art, Blanco y Negro, Óleo y Soplo mediante la Canvas API.',
  },
  {
    icon: '📸',
    title: 'Captura Webcam y Archivo',
    description:
      'El sistema permite capturar imágenes en tiempo real desde la cámara web o subir archivos locales para aplicarles los efectos artísticos del museo.',
  },
  {
    icon: '☁️',
    title: 'Galería en la Nube',
    description:
      'Las obras creadas se almacenan en Supabase con un sistema de likes y vistas acumulativos, construyendo una galería digital colaborativa.',
  },
  {
    icon: '🏛️',
    title: 'Dos Experiencias',
    description:
      'El sitio ofrece una experiencia para adultos (adultos.html) y una versión para niños (kids.html) con interfaz adaptada a cada público.',
  },
  {
    icon: '⚡',
    title: 'Tecnología Web Pura',
    description:
      'Construido con JavaScript vanilla, Canvas API, y CSS sin frameworks adicionales. Ligero, rápido y desplegado en Azure Static Web Apps.',
  },
  {
    icon: '🌐',
    title: 'Desplegado en Azure',
    description:
      'El proyecto está alojado en Microsoft Azure Static Web Apps, garantizando disponibilidad global y alto rendimiento.',
  },
];

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <p className={styles.heroEyebrow}>Documentación del Proyecto</p>
        <h1 className="hero__title">MAMBAQ</h1>
        <p className="hero__subtitle">
          Museo de Arte Moderno de Barranquilla
        </p>
        <p className={styles.heroDesc}>
          Plataforma web interactiva que permite a los visitantes del museo
          transformar sus fotografías en obras de arte digital usando efectos
          artísticos en tiempo real.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Ver Documentación →
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://www.mambaqsite.online"
            target="_blank"
          >
            Visitar Sitio ↗
          </Link> 
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Inicio" description="Documentación del proyecto MAMBAQ">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <h2 className={styles.featuresTitle}>Características del Proyecto</h2>
            <div className={styles.featuresGrid}>
              {features.map((f, i) => (
                <div key={i} className={styles.featureCard}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.teamSection}>
          <div className="container">
            <h2 className={styles.featuresTitle}>Equipo de Desarrollo</h2>
            <div className={styles.teamGrid}>
              {[
                { name: 'Yefrey Navarro', role: 'Desarrollador Frontend / Líder' },
                { name: 'Roberto De La Hoz', role: 'Desarrollador' },
                { name: 'Carlos Ovalle', role: 'Desarrollador' },
              ].map((m, i) => (
                <div key={i} className={styles.teamCard}>
                  <div className={styles.teamAvatar}>{m.name[0]}</div>
                  <h3>{m.name}</h3>
                  <p>{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
