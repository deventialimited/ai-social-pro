function TextTab() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create header</h2>
      <h3 className="text-lg mb-4">Create sub header</h3>
      <p className="text-sm mb-4">Create body text</p>

      {/* Text formatting options would go here */}
      <div className="mt-6">
        <button className="w-full py-2 px-4 border rounded-md hover:bg-gray-50 mb-2">Add Text</button>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Text Style</h4>
          <div className="flex gap-2 mb-4">
            <button className="p-2 border rounded-md hover:bg-gray-50">B</button>
            <button className="p-2 border rounded-md hover:bg-gray-50">I</button>
            <button className="p-2 border rounded-md hover:bg-gray-50">U</button>
            <button className="p-2 border rounded-md hover:bg-gray-50">A</button>
          </div>

          <h4 className="text-sm font-medium mb-2">Alignment</h4>
          <div className="flex gap-2">
            <button className="p-2 border rounded-md hover:bg-gray-50">Left</button>
            <button className="p-2 border rounded-md hover:bg-gray-50">Center</button>
            <button className="p-2 border rounded-md hover:bg-gray-50">Right</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextTab
