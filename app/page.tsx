
'use client';

import { useState } from 'react';
import { Camera, FileText, Mail, Smartphone, CheckCircle } from 'lucide-react';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'camera' | 'process' | 'complete'>('welcome');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleImageCapture = (imageDataUrl: string) => {
    setCapturedImages(prev => [...prev, imageDataUrl]);
  };

  const processImages = async () => {
    setIsProcessing(true);
    // Симулация на обработка
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setCurrentStep('process');
  };

  const sendEmail = async () => {
    if (capturedImages.length === 0) return;
    
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfData: capturedImages[0], // Изпращаме първото изображение
          fileName: `Сканиран_документ_${Date.now()}.jpg`,
          metadata: `Сканирани ${capturedImages.length} документ${capturedImages.length > 1 ? 'а' : ''}`,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setEmailSent(true);
        alert('✅ Имейлът е изпратен успешно!');
      } else {
        throw new Error(result.error || 'Грешка при изпращане');
      }
    } catch (error) {
      alert(`❌ Грешка: ${error instanceof Error ? error.message : 'Неизвестна грешка'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Document Scanner
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Сканирайте и изпратете документи с AI обработка
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Сканиране</h3>
              <p className="text-gray-600">Използвайте камерата за сканиране на документи</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Smartphone className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Обработка</h3>
              <p className="text-gray-600">Автоматично подобряване на качеството</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Изпращане</h3>
              <p className="text-gray-600">Директно изпращане по имейл</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('camera')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Camera className="w-6 h-6" />
            Започни сканиране
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'camera') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Сканиране на документ</h1>
            <p className="text-gray-600">Използвайте камерата за заснемане на документа</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Камера ще се зареди тук</p>
                <p className="text-sm text-gray-400 mt-2">
                  За демо цели, използвайте бутона за симулация
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  // Симулация на заснемане
                  const canvas = document.createElement('canvas');
                  canvas.width = 800;
                  canvas.height = 600;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.fillStyle = '#f0f0f0';
                    ctx.fillRect(0, 0, 800, 600);
                    ctx.fillStyle = '#333';
                    ctx.font = '48px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Демо документ', 400, 300);
                    ctx.font = '24px Arial';
                    ctx.fillText(`Заснет в ${new Date().toLocaleTimeString()}`, 400, 350);
                    handleImageCapture(canvas.toDataURL());
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                📸 Заснеми (Демо)
              </button>
              
              {capturedImages.length > 0 && (
                <button
                  onClick={processImages}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Продължи ({capturedImages.length} снимки)
                </button>
              )}
            </div>
          </div>

          {capturedImages.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Заснети документи ({capturedImages.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {capturedImages.map((image, index) => (
                  <div key={index} className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    <img src={image} alt={`Документ ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentStep('welcome')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'process') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Обработка на документи</h1>
            <p className="text-gray-600">AI подобряване на качеството</p>
          </div>

          {isProcessing ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Обработвам документите...</h3>
              <p className="text-gray-600">Моля, изчакайте...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6">Обработени документи</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {capturedImages.map((image, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-md">
                      <img src={image} alt={`Документ ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">Документ {index + 1}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={sendEmail}
                  disabled={emailSent || isSendingEmail}
                  className={`px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    emailSent 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Изпращам...
                    </>
                  ) : emailSent ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Изпратено ✓
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Изпрати по имейл
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setCurrentStep('complete')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-xl font-medium transition-colors"
                >
                  Завърши
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentStep('camera')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Назад към камерата
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Готово!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Документите са обработени и изпратени успешно
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setCurrentStep('welcome');
                  setCapturedImages([]);
                  setEmailSent(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Нов документ
              </button>
              
              <button
                onClick={() => setCurrentStep('camera')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Добави още
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
