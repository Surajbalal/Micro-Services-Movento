function LocationSearchPanel(props) {
  return (
    <div className="p-4">

      {props.isLoading ? (
        // 🔥 Loading state FIRST
        <div className="text-center py-8 text-gray-500">
          <i className="ri-loader-line text-2xl mb-2 animate-spin"></i>
          <p>Loading...</p>
        </div>

      ) : props.addressList.length === 0 ? (
        // 🔥 Empty state
        <div className="text-center py-8 text-gray-500">
          <i className="ri-search-line text-2xl mb-2"></i>
          <p>Start typing to see location suggestions</p>
        </div>

      ) : (
        // 🔥 Data state
        props.addressList.map((el, indx) => (
          <button
            key={indx}
            onClick={() => {
              props.setFieldValue(el.description);
              props.setIsLocationSelected(true);
            }}
            className="w-full flex gap-4 items-center p-4 mb-2 border-2 border-gray-100 rounded-xl hover:border-black hover:bg-gray-50 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black text-left"
            type="button"
          >
            <div className="bg-gray-100 h-8 w-8 flex items-center justify-center rounded-full shrink-0">
              <i className="ri-map-pin-fill text-gray-600"></i>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">
              {el.description}
            </h4>
          </button>
        ))
      )}

    </div>
  );
}

export default LocationSearchPanel;