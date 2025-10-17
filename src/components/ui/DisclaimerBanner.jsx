import { useState, useEffect } from 'react';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const DISCLAIMER_KEY = 'disclaimerAccepted';

const DisclaimerBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(DISCLAIMER_KEY);
    if (hasAccepted !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    // Fundo escuro (overlay) que cobre a tela inteira
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      {/* O card do modal */}
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 md:p-8 transform transition-all animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />

          <h2 className="text-2xl font-bold text-gray-900 mb-3">Aviso Importante de Uso</h2>

          <p className="text-base text-gray-600 mb-6">
            Este sistema serve apenas para o <strong>monitoramento</strong> de campanhas e não deve ser usado como parâmetro único para confirmar o status ou andamento das mesmas.
            <br /><br />
            É de <strong>inteira responsabilidade do usuário</strong> confirmar o status diretamente na plataforma de campanhas. Caso encontre alguma inconsistência, por favor, procure o time de Sustentação.
          </p>

          <Button
            size="lg"
            onClick={handleAccept}
            className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white font-bold w-full md:w-auto"
          >
            Aceito e entendi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerBanner;