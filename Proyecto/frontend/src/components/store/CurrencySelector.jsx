export default function CurrencySelector({ selected, onChange }) {
  const currencies = [
    { code: 'GTQ', symbol: 'Q', name: 'Quetzales' },
    { code: 'USD', symbol: '$', name: 'Dólares' },
    { code: 'MXN', symbol: 'MX$', name: 'Pesos Mexicanos' },
    { code: 'EUR', symbol: '€', name: 'Euros' },
  ]

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
    >
      {currencies.map((curr) => (
        <option key={curr.code} value={curr.code}>
          {curr.symbol} {curr.name}
        </option>
      ))}
    </select>
  )
}
