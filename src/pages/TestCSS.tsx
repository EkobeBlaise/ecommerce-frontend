import React from 'react';

const TestCSS: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-blue-600 text-white p-8 rounded-2xl mb-8">
        <h1 className="text-4xl font-bold mb-4">CSS Test Page</h1>
        <p className="text-xl">If you see blue background and white text, Tailwind CSS is working!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="w-12 h-12 bg-blue-600 rounded-full mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Card 1</h3>
          <p className="text-gray-600">This card has shadow, rounded corners, and proper spacing.</p>
          <button className="btn-primary mt-4">Test Button</button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="w-12 h-12 bg-green-600 rounded-full mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Card 2</h3>
          <p className="text-gray-600">Gradients, shadows, and animations are all working.</p>
          <button className="btn-secondary mt-4">Secondary Button</button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="w-12 h-12 bg-purple-600 rounded-full mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Card 3</h3>
          <p className="text-gray-600">The layout is responsive and looks great on all devices.</p>
          <input type="text" placeholder="Test input" className="input mt-4" />
        </div>
      </div>
    </div>
  );
};

export default TestCSS;
