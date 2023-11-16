import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from 'locales'
i18n
	.use(initReactI18next)
	.init({
		fallbackLng: 'en',
		resources: {
			en: {
				translation: en
			}
		},
		lng: 'en',
		react: {
			useSuspense: true,
			wait: true,
		},
	});

export default i18n;
