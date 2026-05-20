import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { receiptsAPI } from '../api/gateway';
import LoadingSpinner from '../components/LoadingSpinner';

const Receipt = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      try {
        const data = await receiptsAPI.generateReceipt(orderId);
        setReceipt(data);
        toast.success('Recibo generado exitosamente');
      } catch (error) {
        toast.error('Error al generar el recibo');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receipt) return;

    const blob = new Blob([receipt.content_body], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Recibo descargado');
  };

  if (loading) {
    return <LoadingSpinner text="Generando recibo..." />;
  }

  if (!receipt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Recibo no disponible</h3>
          <Link to="/orders" className="btn-primary inline-flex items-center mt-4">
            <ArrowLeft size={18} className="mr-2" />
            Volver a Órdenes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6 font-semibold no-print"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a Detalles
        </button>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6 no-print">
          <button onClick={handlePrint} className="btn-primary flex items-center">
            <Printer size={18} className="mr-2" />
            Imprimir
          </button>
          <button onClick={handleDownload} className="btn-secondary flex items-center">
            <Download size={18} className="mr-2" />
            Descargar TXT
          </button>
        </div>

        {/* Receipt Display */}
        <div className="card bg-white max-w-3xl mx-auto">
          <div className="mb-4 flex items-center justify-center no-print">
            <FileText className="text-primary-600 mr-2" size={32} />
            <h1 className="text-2xl font-bold">Recibo de Envío</h1>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
              {receipt.content_body}
            </pre>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 no-print">
            <p>Generado el: {new Date(receipt.generated_at).toLocaleString('es-GT')}</p>
            <p className="mt-2">ID de Orden: {receipt.order_id}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Receipt;
