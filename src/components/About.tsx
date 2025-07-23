import { useTranslation } from '@/hooks/useTranslation';

const About = () => {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('about.title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('about.description')}
          </p>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('about.features.smart.title')}</h3>
              <p className="text-muted-foreground">
                {t('about.features.smart.description')}
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('about.features.expertise.title')}</h3>
              <p className="text-muted-foreground">
                {t('about.features.expertise.description')}
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('about.features.improving.title')}</h3>
              <p className="text-muted-foreground">
                {t('about.features.improving.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;