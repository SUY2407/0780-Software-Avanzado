export default function CategoryFilter({ selected, onChange }) {
  // Categorías extraídas directamente de tu respuesta JSON
  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'Tecnología', label: 'Tecnología' },
    { value: 'Accesorios', label: 'Accesorios' },
    { value: 'Hogar', label: 'Hogar' },
    { value: 'Fotografía', label: 'Fotografía' },
    { value: 'Audio', label: 'Audio' },
    { value: 'Almacenamiento', label: 'Almacenamiento' },
    { value: 'Oficina', label: 'Oficina' },
    { value: 'Consolas', label: 'Consolas' },
    { value: 'Software', label: 'Software' },
    { value: 'Redes', label: 'Redes' },
  ]

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
    >
      {categories.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  )
}
