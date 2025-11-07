'use client';

import Navbar from '../../components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isPublic={true} />

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Solidex Manufacturing Company</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              <strong>SOLIDEX MANUFACTURING COMPANY (SEMCO)</strong> is based in Bangalore and is involved 
              in the manufacturing of heavy-duty high-quality excavator buckets ranging from 0.75 - 80 Ton machines.
            </p>

            <p className="text-gray-700 mb-6">
              We manufacture wide range buckets suiting all types of excavators. While maintaining the profile 
              of a standard bucket, its structure will be reinforced at the points subjected to greater stress and wear.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Expertise</h2>
            <p className="text-gray-700 mb-4">
              We use variation of below reinforcing material to achieve different customer requirements:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Side attach Plates, Shrouds</li>
              <li>Lip Protector</li>
              <li>Hardox 400 reinforcements Plates</li>
              <li>En19 Round Bars</li>
              <li>High Grade Square Bars</li>
              <li>Railway Blades</li>
              <li>Hardened Axel</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Bucket Hard Facing</h3>
                <p className="text-sm text-gray-600">
                  Professional hard facing services to extend bucket life and reduce wear.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Re-bore and Re-Alignment</h3>
                <p className="text-sm text-gray-600">
                  Align-boring is a welding/machining process to repair bores that have been worn out, 
                  over sized and irregular shaped.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Dozer Blades</h3>
                <p className="text-sm text-gray-600">
                  Designed for rough and finish grading in dirt and gravel, and light dozing. 
                  Available in all sizes for all leading equipment manufacturers.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Custom Manufacturing</h3>
                <p className="text-sm text-gray-600">
                  Custom solutions tailored to your specific requirements and equipment specifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

