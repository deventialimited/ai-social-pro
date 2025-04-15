function ColorPicker({ colors, selectedColor, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color, index) => (
        <button
          key={index}
          className={`w-8 h-8 rounded-md hover:opacity-80 ${
            selectedColor === color ? "ring-2 ring-offset-2 ring-blue-500" : "border border-gray-200"
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        ></button>
      ))}
    </div>
  )
}

export default ColorPicker
