import React, { useState } from "react";

const CollectPayment = ({ booking, onClose, onPaymentCollected }) => {
  const [paymentAmount, setPaymentAmount] = useState(booking.balance);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentType, setPaymentType] = useState("full");

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    if (type === "full") {
      setPaymentAmount(booking.balance);
    } else {
      setPaymentAmount(customAmount);
    }
  };

  const handleCustomAmountChange = (e) => {
    const amount = parseFloat(e.target.value);
    setCustomAmount(e.target.value);
    if (paymentType === "custom") {
      setPaymentAmount(amount);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPaymentCollected(paymentAmount);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {booking.balance > 0 ? "Collect Payment" : "Refund Payment"}
          </h3>
          <div className="mt-2 px-7 py-3">
            <form onSubmit={handleSubmit}>
              {booking.balance > 0 ? (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Payment Type
                  </label>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="paymentType"
                        value="full"
                        checked={paymentType === "full"}
                        onChange={() => handlePaymentTypeChange("full")}
                      />
                      <span className="ml-2">Full Amount</span>
                    </label>
                    <label className="inline-flex items-center ml-6">
                      <input
                        type="radio"
                        className="form-radio"
                        name="paymentType"
                        value="custom"
                        checked={paymentType === "custom"}
                        onChange={() => handlePaymentTypeChange("custom")}
                      />
                      <span className="ml-2">Custom Amount</span>
                    </label>
                  </div>
                </div>
              ) : null}
              {paymentType === "custom" && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Custom Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter custom amount"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {booking.balance > 0 ? "Amount to Collect" : "Refund Amount"}
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  readOnly
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {booking.balance > 0 ? "Collect" : "Refund"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectPayment;
