import { Search } from "lucide-react"

function SearchInput({ placeholder, value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
      />
    </div>
  )
}

export default SearchInput
