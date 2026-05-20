import { useState } from 'react';
import { Calculator, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { fxAPI } from '../api/gateway';
import LoadingSpinner from '../components/LoadingSpinner';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('GTQ');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'GTQ', name: 'Quetzal Guatemalteco', flag: '🇬🇹' },
    { code: 'USD', name: 'Dólar Estadounidense', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
    { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽' },
  ];

  const handleConvert = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const data = await fxAPI.convertCurrency(parseFloat(amount), fromCurrency, toCurrency);
      console.log('FX Response:', data);
      
      // Normalizar la respuesta para manejar ambos formatos (snake_case y camelCase)
      const normalizedResult = {
        from: data.from,
        to: data.to,
        originalAmount: data.original_amount || data.originalAmount,
        convertedAmount: data.converted_amount || data.convertedAmount,
        rate: data.rate,
        fromCache: data.from_cache || data.fromCache || false,
      };
      
      if (normalizedResult.convertedAmount !== undefined && normalizedResult.rate !== undefined) {
        setResult(normalizedResult);
        toast.success('Conversión exitosa');
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al convertir moneda: ' + (error.response?.data?.message || error.message));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-4 rounded-full">
              <Calculator size={48} className="text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Conversor de Moneda</h1>
          <p className="text-gray-600">Convierte entre diferentes monedas con tasas actualizadas</p>
        </div>

        {/* Converter Form */}
        <form onSubmit={handleConvert} className="card">
          {/* Amount Input */}
          <div className="mb-6">
            <label className="label">Monto</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field text-2xl"
              placeholder="100.00"
              required
            />
          </div>

          {/* From Currency */}
          <div className="mb-4">
            <label className="label">De</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="input-field text-lg"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 mb-4">
            <button
              type="button"
              onClick={handleSwapCurrencies}
              className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-colors"
              title="Intercambiar monedas"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
          </div>

          {/* To Currency */}
          <div className="mb-6">
            <label className="label">A</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="input-field text-lg"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Convert Button */}
          <button type="submit" className="btn-primary w-full py-3 text-lg" disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" text="" />
                <span className="ml-2">Convirtiendo...</span>
              </div>
            ) : (
              <>
                <Calculator size={20} className="inline mr-2" />
                Convertir
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {result && result.convertedAmount !== undefined && result.rate !== undefined && (
          <div className="card mt-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Resultado</p>
              <div className="flex items-center justify-center space-x-4 text-2xl md:text-3xl font-bold">
                <span>
                  {result.originalAmount.toFixed(2)} {result.from}
                </span>
                <ArrowRight size={32} />
                <span className="text-quetzal-300">
                  {result.convertedAmount.toFixed(2)} {result.to}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-primary-500">
                <p className="text-sm opacity-90">
                  Tasa de cambio: 1 {result.from} = {result.rate.toFixed(4)} {result.to}
                </p>
                {result.fromCache && (
                  <p className="text-xs opacity-75 mt-2">
                    ℹ️ Tasa desde caché (actualizada hace menos de 1 hora)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="card mt-6 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Tasas de Cambio</h3>
              <p className="text-sm text-blue-800">
                Las tasas de cambio se actualizan automáticamente cada hora y provienen de
                fuentes confiables. Los valores pueden variar según el mercado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
