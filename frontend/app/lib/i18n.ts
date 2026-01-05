"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        newConsultation: 'New Consultation',
        history: 'Consultation History',
        dashboard: 'Health Dashboard',
        support: 'Support & FAQ',
        settings: 'Settings',
        logout: 'Logout',
        patient: 'Patient'
      },
      main: {
        howCanIHelp: 'How can I help today?',
        describeSymptoms: 'Describe what you\'re experiencing.',
        temporarilyUnavailable: 'I\'m temporarily unavailable. Please try again in a moment.'
      },
      settings: {
        title: 'Settings',
        profile: 'Profile',
        fullName: 'Full Name',
        appearance: 'Appearance',
        language: 'Language',
        notifications: 'Notifications',
        dataManagement: 'Data Management',
        exportData: 'Export Your Data',
        exportButton: 'Export My Data',
        dangerZone: 'Danger Zone',
        deleteAccount: 'Delete My Account & All Data',
        subscription: 'Subscription',
        currentPlan: 'Current Plan',
        upgrade: 'Upgrade'
      }
    }
  },
  hi: {
    translation: {
      nav: {
        newConsultation: 'नई परामर्श',
        history: 'परामर्श इतिहास',
        dashboard: 'स्वास्थ्य डैशबोर्ड',
        support: 'सहायता और FAQ',
        settings: 'सेटिंग्स',
        logout: 'लॉग आउट',
        patient: 'मरीज़'
      },
      main: {
        howCanIHelp: 'आज मैं कैसे मदद कर सकता हूं?',
        describeSymptoms: 'बताएं कि आप क्या महसूस कर रहे हैं।',
        temporarilyUnavailable: 'मैं अस्थायी रूप से अनुपलब्ध हूं। कृपया एक क्षण में पुनः प्रयास करें।'
      },
      settings: {
        title: 'सेटिंग्स',
        profile: 'प्रोफ़ाइल',
        fullName: 'पूरा नाम',
        appearance: 'दिखावट',
        language: 'भाषा',
        notifications: 'सूचनाएं',
        dataManagement: 'डेटा प्रबंधन',
        exportData: 'अपना डेटा निर्यात करें',
        exportButton: 'मेरा डेटा निर्यात करें',
        dangerZone: 'खतरा क्षेत्र',
        deleteAccount: 'मेरा खाता हटाएं',
        subscription: 'सदस्यता',
        currentPlan: 'वर्तमान योजना',
        upgrade: 'अपग्रेड'
      }
    }
  },
  es: {
    translation: {
      nav: {
        newConsultation: 'Nueva Consulta',
        history: 'Historial de Consultas',
        dashboard: 'Panel de Salud',
        support: 'Soporte y FAQ',
        settings: 'Configuración',
        logout: 'Cerrar Sesión',
        patient: 'Paciente'
      },
      main: {
        howCanIHelp: '¿Cómo puedo ayudarte hoy?',
        describeSymptoms: 'Describe lo que estás experimentando.',
        temporarilyUnavailable: 'No estoy disponible temporalmente. Por favor, inténtalo de nuevo en un momento.'
      },
      settings: {
        title: 'Configuración',
        profile: 'Perfil',
        fullName: 'Nombre Completo',
        appearance: 'Apariencia',
        language: 'Idioma',
        notifications: 'Notificaciones',
        dataManagement: 'Gestión de Datos',
        exportData: 'Exportar Tus Datos',
        exportButton: 'Exportar Mis Datos',
        dangerZone: 'Zona de Peligro',
        deleteAccount: 'Eliminar Mi Cuenta y Todos los Datos',
        subscription: 'Suscripción',
        currentPlan: 'Plan Actual',
        upgrade: 'Actualizar'
      }
    }
  },
  fr: {
    translation: {
      nav: {
        newConsultation: 'Nouvelle Consultation',
        history: 'Historique des Consultations',
        dashboard: 'Tableau de Bord Santé',
        support: 'Support et FAQ',
        settings: 'Paramètres',
        logout: 'Déconnexion',
        patient: 'Patient'
      },
      main: {
        howCanIHelp: 'Comment puis-je vous aider aujourd\'hui?',
        describeSymptoms: 'Décrivez ce que vous ressentez.',
        temporarilyUnavailable: 'Je suis temporairement indisponible. Veuillez réessayer dans un moment.'
      },
      settings: {
        title: 'Paramètres',
        profile: 'Profil',
        fullName: 'Nom Complet',
        appearance: 'Apparence',
        language: 'Langue',
        notifications: 'Notifications',
        dataManagement: 'Gestion des Données',
        exportData: 'Exporter Vos Données',
        exportButton: 'Exporter Mes Données',
        dangerZone: 'Zone de Danger',
        deleteAccount: 'Supprimer Mon Compte et Toutes les Données',
        subscription: 'Abonnement',
        currentPlan: 'Plan Actuel',
        upgrade: 'Mettre à Niveau'
      }
    }
  },
  de: {
    translation: {
      nav: {
        newConsultation: 'Neue Beratung',
        history: 'Beratungshistorie',
        dashboard: 'Gesundheits-Dashboard',
        support: 'Support & FAQ',
        settings: 'Einstellungen',
        logout: 'Abmelden',
        patient: 'Patient'
      },
      main: {
        howCanIHelp: 'Wie kann ich Ihnen heute helfen?',
        describeSymptoms: 'Beschreiben Sie, was Sie erleben.',
        temporarilyUnavailable: 'Ich bin vorübergehend nicht verfügbar. Bitte versuchen Sie es in einem Moment erneut.'
      },
      settings: {
        title: 'Einstellungen',
        profile: 'Profil',
        fullName: 'Vollständiger Name',
        appearance: 'Erscheinungsbild',
        language: 'Sprache',
        notifications: 'Benachrichtigungen',
        dataManagement: 'Datenverwaltung',
        exportData: 'Ihre Daten Exportieren',
        exportButton: 'Meine Daten Exportieren',
        dangerZone: 'Gefahrenzone',
        deleteAccount: 'Mein Konto und Alle Daten Löschen',
        subscription: 'Abonnement',
        currentPlan: 'Aktueller Plan',
        upgrade: 'Upgrade'
      }
    }
  },
  pt: {
    translation: {
      nav: {
        newConsultation: 'Nova Consulta',
        history: 'Histórico de Consultas',
        dashboard: 'Painel de Saúde',
        support: 'Suporte e FAQ',
        settings: 'Configurações',
        logout: 'Sair',
        patient: 'Paciente'
      },
      main: {
        howCanIHelp: 'Como posso ajudá-lo hoje?',
        describeSymptoms: 'Descreva o que você está sentindo.',
        temporarilyUnavailable: 'Estou temporariamente indisponível. Tente novamente em um momento.'
      },
      settings: {
        title: 'Configurações',
        profile: 'Perfil',
        fullName: 'Nome Completo',
        appearance: 'Aparência',
        language: 'Idioma',
        notifications: 'Notificações',
        dataManagement: 'Gerenciamento de Dados',
        exportData: 'Exportar Seus Dados',
        exportButton: 'Exportar Meus Dados',
        dangerZone: 'Zona de Perigo',
        deleteAccount: 'Excluir Minha Conta e Todos os Dados',
        subscription: 'Assinatura',
        currentPlan: 'Plano Atual',
        upgrade: 'Atualizar'
      }
    }
  },
  ar: {
    translation: {
      nav: {
        newConsultation: 'استشارة جديدة',
        history: 'تاريخ الاستشارات',
        dashboard: 'لوحة الصحة',
        support: 'الدعم والأسئلة الشائعة',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج',
        patient: 'مريض'
      },
      main: {
        howCanIHelp: 'كيف يمكنني مساعدتك اليوم؟',
        describeSymptoms: 'صف ما تشعر به.',
        temporarilyUnavailable: 'أنا غير متاح مؤقتاً. يرجى المحاولة مرة أخرى بعد قليل.'
      },
      settings: {
        title: 'الإعدادات',
        profile: 'الملف الشخصي',
        fullName: 'الاسم الكامل',
        appearance: 'المظهر',
        language: 'اللغة',
        notifications: 'الإشعارات',
        dataManagement: 'إدارة البيانات',
        exportData: 'تصدير بياناتك',
        exportButton: 'تصدير بياناتي',
        dangerZone: 'منطقة الخطر',
        deleteAccount: 'حذف حسابي وجميع البيانات',
        subscription: 'الاشتراك',
        currentPlan: 'الخطة الحالية',
        upgrade: 'ترقية'
      }
    }
  },
  zh: {
    translation: {
      nav: {
        newConsultation: '新咨询',
        history: '咨询历史',
        dashboard: '健康仪表板',
        support: '支持和常见问题',
        settings: '设置',
        logout: '登出',
        patient: '患者'
      },
      main: {
        howCanIHelp: '今天我能为您做些什么？',
        describeSymptoms: '描述您正在经历的症状。',
        temporarilyUnavailable: '我暂时不可用。请稍后再试。'
      },
      settings: {
        title: '设置',
        profile: '个人资料',
        fullName: '全名',
        appearance: '外观',
        language: '语言',
        notifications: '通知',
        dataManagement: '数据管理',
        exportData: '导出您的数据',
        exportButton: '导出我的数据',
        dangerZone: '危险区域',
        deleteAccount: '删除我的账户和所有数据',
        subscription: '订阅',
        currentPlan: '当前计划',
        upgrade: '升级'
      }
    }
  },
  ja: {
    translation: {
      nav: {
        newConsultation: '新しい相談',
        history: '相談履歴',
        dashboard: '健康ダッシュボード',
        support: 'サポートとFAQ',
        settings: '設定',
        logout: 'ログアウト',
        patient: '患者'
      },
      main: {
        howCanIHelp: '今日はどのようにお手伝いできますか？',
        describeSymptoms: '症状を説明してください。',
        temporarilyUnavailable: '一時的に利用できません。しばらくしてからもう一度お試しください。'
      },
      settings: {
        title: '設定',
        profile: 'プロフィール',
        fullName: 'フルネーム',
        appearance: '外観',
        language: '言語',
        notifications: '通知',
        dataManagement: 'データ管理',
        exportData: 'データをエクスポート',
        exportButton: 'データをエクスポート',
        dangerZone: '危険ゾーン',
        deleteAccount: 'アカウントとすべてのデータを削除',
        subscription: 'サブスクリプション',
        currentPlan: '現在のプラン',
        upgrade: 'アップグレード'
      }
    }
  },
  ru: {
    translation: {
      nav: {
        newConsultation: 'Новая Консультация',
        history: 'История Консультаций',
        dashboard: 'Панель Здоровья',
        support: 'Поддержка и FAQ',
        settings: 'Настройки',
        logout: 'Выйти',
        patient: 'Пациент'
      },
      main: {
        howCanIHelp: 'Как я могу помочь вам сегодня?',
        describeSymptoms: 'Опишите, что вы чувствуете.',
        temporarilyUnavailable: 'Я временно недоступен. Пожалуйста, попробуйте еще раз через момент.'
      },
      settings: {
        title: 'Настройки',
        profile: 'Профиль',
        fullName: 'Полное Имя',
        appearance: 'Внешний Вид',
        language: 'Язык',
        notifications: 'Уведомления',
        dataManagement: 'Управление Данными',
        exportData: 'Экспорт Ваших Данных',
        exportButton: 'Экспорт Моих Данных',
        dangerZone: 'Опасная Зона',
        deleteAccount: 'Удалить Мой Аккаунт и Все Данные',
        subscription: 'Подписка',
        currentPlan: 'Текущий План',
        upgrade: 'Обновить'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;