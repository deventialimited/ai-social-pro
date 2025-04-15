function TabButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      className={`flex flex-col items-center justify-center w-full py-4 text-xs ${
        isActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 mb-1" />
      {label}
    </button>
  )
}

export default TabButton
