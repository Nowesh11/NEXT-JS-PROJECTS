import Layout from '../../components/Layout';
import Head from 'next/head';
import Projects from '../../components/Projects';
import { useLanguage } from '../../contexts/LanguageContext';

const ProjectsPage = () => {
  const { t, language } = useLanguage();
  const getText = t; // Alias for backward compatibility

  return (
    <>
      <Head>
        <title>{getText('projects.title', 'Projects')} - Tamil Literary Society</title>
        <meta name="description" content={getText('projects.description', 'Explore our innovative projects preserving and promoting Tamil language and culture')} />
        <meta name="keywords" content="Tamil projects, literary projects, cultural preservation, Tamil society" />
        <meta property="og:title" content={`${getText('projects.title', 'Projects')} - Tamil Literary Society`} />
        <meta property="og:description" content={getText('projects.description', 'Explore our innovative projects preserving and promoting Tamil language and culture')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/projects" />
      </Head>
      <Layout>
        <Projects />
      </Layout>
    </>
  );
};

export default ProjectsPage;