function TextTab() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create header</h2>
      <h3 className="text-lg mb-4">Create sub header</h3>
      <p className="text-sm mb-4">Create body text</p>

      {/* Text formatting options would go here */}
      <div className="mt-6">
        <button className="w-full py-2 px-4 border rounded-md hover:bg-gray-50 mb-2">
          Add Text
        </button>
      </div>
    </div>
  );
}

export default TextTab;
